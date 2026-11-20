import { describe, expect, it } from "vitest";
import { CLUSTER_CHOICES, CLUSTER_IDS, QUESTIONS } from "@/lib/questions";
import { DAILY_MIN, ROUND_SIZE, buildRound, dailyEnabled, dailyRound, dayIso, dayKey, inCluster, isPlayableDay, match, msUntilNextDay, nextDayKey, pool, prevDayKey, scoreAnswers, utcDayKey, validate } from "@/lib/game-engine";
import { apply, bestOf, blank, dailyOf, liveStreak, migrate, totalsOf } from "@/lib/stats";
import { cleanName } from "@/lib/leaderboard/names";
import type { ClusterId, Question } from "@/types";

const q = (id: string) => QUESTIONS.find((x) => x.id === id)!;
const hit = (id: string, text: string) => match(q(id), text)?.[0] ?? null;
const ids = (round: Question[]) => round.map((x) => x.id);

/** A made-up bank with a known size per cluster, so round rules can be tested whatever the real bank holds. */
function fakeBank(perCluster: number): Question[] {
  return CLUSTER_IDS.flatMap((cluster) =>
    Array.from({ length: perCluster }, (_, i): Question => ({
      id: cluster.toUpperCase() + "-T" + String(i).padStart(2, "0"),
      cluster,
      topic: cluster + " topic " + (i % 4),
      area: "Test",
      diff: ((i % 3) + 1) as 1 | 2 | 3,
      q: "Prompt " + cluster + " " + i,
      why: "Because.",
      a: [["One", 1], ["Two", 2], ["Three", 3], ["Four", 4], ["Five", 5], ["Six", 6]],
    })),
  );
}
const nextDay = nextDayKey;

describe("bank checks", () => {
  it("reports a bad cluster, a thin board and a missing top level", () => {
    const base = fakeBank(1)[0];
    expect(validate([{ ...base, cluster: "xyz" as ClusterId }]).join()).toContain("unknown cluster");
    expect(validate([{ ...base, a: base.a.slice(0, 4) }]).join()).toContain("needs at least");
    expect(validate([{ ...base, a: base.a.map((r) => (r[1] === 5 ? [r[0], 4] : r)) as Question["a"] }]).join()).toContain("no ICDC answer");
    expect(validate([base, { ...base, id: "OTHER-1" }]).join()).toContain("same prompt wording");
    expect(validate([base])).toEqual([]);
  });
});

describe("answer matching", () => {
  it("accepts aliases, case and punctuation", () => {
    expect(hit("LAW-03", "ftc")).toBe("FTC");
    expect(hit("LAW-03", "Federal Trade Commission")).toBe("FTC");
    expect(hit("FIN-02", "P/E")).toBe("Price-to-earnings ratio");
    expect(hit("PFL-03", "401k")).toBe("401(k) contribution");
  });
  it("forgives small typos and plurals", () => {
    expect(hit("ACC-02", "accounts recievable")).toBe("Accounts receivable");
    expect(hit("MKT-01", "products")).toBe("Product");
  });
  it("rejects wrong and empty answers", () => {
    expect(hit("SEL-03", "banana")).toBeNull();
    expect(hit("SEL-03", "   ")).toBeNull();
  });
});

describe("daily rounds", () => {
  const bank = fakeBank(DAILY_MIN);
  it("gives everyone the same round for a cluster and day", () => {
    for (const c of CLUSTER_CHOICES) {
      const a = ids(buildRound(bank, { mode: "daily", cluster: c, seed: 20261117 }));
      expect(a).toEqual(ids(buildRound(bank.slice().reverse(), { mode: "daily", cluster: c, seed: 20261117 })));
      expect(new Set(a).size).toBe(ROUND_SIZE);
      expect(a).not.toEqual(ids(buildRound(bank, { mode: "daily", cluster: c, seed: 20261118 })));
    }
  });
  it("gives each cluster its own round on the same day", () => {
    const rounds = CLUSTER_CHOICES.map((c) => ids(dailyRound(bank, c, 20261117)).join());
    expect(new Set(rounds).size).toBe(CLUSTER_CHOICES.length);
  });
  it("never repeats a prompt within three days in a row, even with the smallest allowed pool", () => {
    for (const c of CLUSTER_CHOICES) {
      let day = 20261220;
      let recent: string[][] = [];
      for (let i = 0; i < 45; i++) {
        const today = ids(dailyRound(bank, c, day));
        expect(today.length).toBe(ROUND_SIZE);
        for (const earlier of recent) expect(today.filter((id) => earlier.includes(id))).toEqual([]);
        recent = [...recent.slice(-1), today];
        day = nextDay(day);
      }
    }
  });
  it("stays closed for a cluster with fewer than 21 prompts", () => {
    const small = fakeBank(DAILY_MIN - 1);
    expect(dailyEnabled(small, "fin")).toBe(false);
    expect(buildRound(small, { mode: "daily", cluster: "fin", seed: 20261117 })).toEqual([]);
    expect(dailyEnabled(small, "all")).toBe(true);
    expect(dailyEnabled(bank, "fin")).toBe(true);
  });
  it("mixes clusters in the All clusters round", () => {
    expect(new Set(dailyRound(bank, "all", 20261117).map((x) => x.cluster)).size).toBe(CLUSTER_IDS.length);
  });
  it("keys the day to the player's own calendar date, changing at their midnight", () => {
    // new Date(year, month, day, hour, minute) is a time on the local clock, whatever zone the tests run in
    expect(dayKey(new Date(2026, 10, 17, 23, 59, 59))).toBe(20261117);
    expect(dayKey(new Date(2026, 10, 18, 0, 0, 0))).toBe(20261118);
    expect(dayKey(new Date(2026, 10, 18, 18, 30))).toBe(20261118); // evening is still the same day
    expect(dayKey(new Date(2026, 10, 19, 9, 0))).toBe(20261119); // and the next morning is a new one
    expect(msUntilNextDay(new Date(2026, 10, 17, 23, 0, 0))).toBe(3600000);
    expect(ids(dailyRound(bank, "fin", dayKey(new Date(2026, 10, 18, 19, 0))))).not.toEqual(ids(dailyRound(bank, "fin", dayKey(new Date(2026, 10, 19, 9, 0)))));
  });
  it("does day arithmetic on the calendar, and keeps a UTC date for the server", () => {
    expect(utcDayKey(new Date("2026-11-17T23:59:59Z"))).toBe(20261117);
    expect(utcDayKey(new Date("2026-11-18T00:00:00Z"))).toBe(20261118);
    expect(prevDayKey(20270101)).toBe(20261231);
    expect(nextDayKey(20261231)).toBe(20270101);
    expect(nextDayKey(20260228)).toBe(20260301);
    expect(dayIso(20261107)).toBe("2026-11-07");
  });
  it("accepts a player's date one day either side of the UTC date, and nothing further", () => {
    expect([20261116, 20261117, 20261118].map((d) => isPlayableDay(d, 20261117))).toEqual([true, true, true]);
    expect([20261115, 20261119, 20251117, "20261117", null, undefined, NaN].map((d) => isPlayableDay(d, 20261117))).toEqual([false, false, false, false, false, false, false]);
    expect(isPlayableDay(20270101, 20261231)).toBe(true);
  });
});

describe("cluster rounds", () => {
  const bank = fakeBank(DAILY_MIN);
  it("draws only from the chosen cluster in every mode", () => {
    for (const c of CLUSTER_IDS) {
      for (const mode of ["daily", "practice", "unlimited"] as const) {
        const round = buildRound(bank, { mode, cluster: c, seed: 20261117 });
        expect(round.length).toBeGreaterThan(0);
        expect(round.filter((x) => x.cluster !== c)).toEqual([]);
      }
      // the ticked clusters only apply to All clusters; a single cluster always wins
      const others = CLUSTER_IDS.filter((x) => x !== c);
      expect(buildRound(bank, { mode: "practice", cluster: c, clusters: others }).every((x) => x.cluster === c)).toBe(true);
    }
  });
  it("draws only from the chosen cluster with the real bank", () => {
    for (const c of CLUSTER_IDS) {
      for (const mode of ["practice", "unlimited"] as const) {
        const round = buildRound(QUESTIONS, { mode, cluster: c });
        expect(round.length).toBeGreaterThan(0);
        expect(round.filter((x) => x.cluster !== c)).toEqual([]);
      }
      expect(buildRound(QUESTIONS, { mode: "daily", cluster: c, seed: 20261117 }).filter((x) => x.cluster !== c)).toEqual([]);
    }
  });
  it("uses the whole cluster for unlimited and seven prompts for practice", () => {
    expect(buildRound(bank, { mode: "unlimited", cluster: "mkt" }).length).toBe(DAILY_MIN);
    expect(buildRound(bank, { mode: "unlimited", cluster: "all" }).length).toBe(bank.length);
    expect(buildRound(bank, { mode: "practice", cluster: "ht" }).length).toBe(ROUND_SIZE);
  });
  it("respects ticked clusters and difficulty in All clusters practice", () => {
    const round = buildRound(bank, { mode: "practice", cluster: "all", clusters: ["fin", "ht"], diff: 3 });
    expect(round.length).toBe(ROUND_SIZE);
    expect(round.every((x) => (x.cluster === "fin" || x.cluster === "ht") && x.diff === 3)).toBe(true);
    expect(buildRound(bank, { mode: "practice", cluster: "all", clusters: [] })).toEqual([]);
    expect(pool(bank, { cluster: "ent", diff: 1 }).every((x) => x.cluster === "ent" && x.diff === 1)).toBe(true);
    expect(inCluster(bank, "all").length).toBe(bank.length);
  });
});

describe("server-side scoring", () => {
  const round = buildRound(QUESTIONS, { mode: "daily", cluster: "all", seed: 20261117 });
  it("scores a perfect round at 700", () => {
    const best = round.map((x) => x.a.find((r) => r[1] === 6)![0]);
    expect(scoreAnswers(round, best)).toEqual({ score: 700, levels: [6, 6, 6, 6, 6, 6, 6] });
  });
  it("gives nothing for wrong, blank or missing answers", () => {
    expect(scoreAnswers(round, ["zzzz", "", "qqqq"])).toEqual({ score: 0, levels: [0, 0, 0, 0, 0, 0, 0] });
  });
});

describe("stats", () => {
  it("tracks bests and the daily streak per cluster", () => {
    const log = [{ cluster: "fin" as const, topic: "Finance", level: 6, pts: 100 }, { cluster: "fin" as const, topic: "Finance", level: -1, pts: 0 }];
    const day1 = apply(blank(), { mode: "daily", cluster: "fin", score: 300, dayKey: 20261117, prevDayKey: 20261116, log });
    expect(day1.outcome).toEqual({ newBest: true, previousBest: 0, streak: 1 });
    const day2 = apply(day1.stats, { mode: "daily", cluster: "fin", score: 200, dayKey: 20261118, prevDayKey: 20261117, log: [] });
    expect(day2.outcome.streak).toBe(2);
    expect(day2.outcome.newBest).toBe(false);
    expect(day2.stats.levels.miss).toBe(1);
    expect(day2.stats.topics["fin|Finance"].glass).toBe(1);
    expect(liveStreak(day2.stats, "fin", 20261120, 20261119)).toBe(0);
    // another cluster's daily round is separate
    expect(dailyOf(day2.stats, "mkt").last).toBe(0);
    const other = apply(day2.stats, { mode: "daily", cluster: "mkt", score: 100, dayKey: 20261118, prevDayKey: 20261117, log: [] });
    expect(other.outcome).toEqual({ newBest: true, previousBest: 0, streak: 1 });
    expect(dailyOf(other.stats, "fin").streak).toBe(2);
    expect(bestOf(other.stats, "fin", "daily")).toBe(300);
    expect(bestOf(other.stats, "mkt", "daily")).toBe(100);
    // totals are kept per chosen cluster as well as overall
    expect(other.stats.games).toBe(3);
    expect(totalsOf(other.stats, "fin")).toEqual({ games: 2, prompts: 2, pts: 100 });
    expect(totalsOf(other.stats, "mkt")).toEqual({ games: 1, prompts: 0, pts: 0 });
    expect(totalsOf(other.stats, "all")).toEqual({ games: 0, prompts: 0, pts: 0 });
  });
  it("carries over stats saved before clusters existed", () => {
    const s = migrate({
      games: 4, prompts: 28, pts: 900, levels: { 6: 2, miss: 3 },
      cats: { Accounting: { n: 5, pts: 200, glass: 1 }, Marketing: { n: 3, pts: 90, glass: 0 } },
      best: { daily: 410, practice: 300, endless: 950 },
      daily: { last: 20261116, streak: 3, bestStreak: 5, score: 410 },
    });
    expect(s.games).toBe(4);
    expect(totalsOf(s, "all")).toEqual({ games: 4, prompts: 28, pts: 900 });
    expect(totalsOf(s, "fin").games).toBe(0);
    expect(s.levels[6]).toBe(2);
    expect(s.topics["fin|Accounting"]).toEqual({ n: 5, pts: 200, glass: 1 });
    expect(s.topics["mkt|Marketing"].n).toBe(3);
    expect(bestOf(s, "all", "unlimited")).toBe(950);
    expect(bestOf(s, "all", "daily")).toBe(410);
    expect(liveStreak(s, "all", 20261117, 20261116)).toBe(3);
  });
});

describe("leaderboard names", () => {
  it("accepts ordinary names and rejects bad ones", () => {
    expect(cleanName("  Carson A ")).toEqual({ ok: true, name: "Carson A" });
    expect(cleanName("ab").ok).toBe(false);
    expect(cleanName("<script>").ok).toBe(false);
    expect(cleanName("sh1t_head").ok).toBe(true);
    expect(cleanName("xShitx").ok).toBe(false);
    expect(cleanName(42).ok).toBe(false);
  });
});
