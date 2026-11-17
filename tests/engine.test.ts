import { describe, expect, it } from "vitest";
import { CATEGORIES, QUESTIONS } from "@/lib/questions";
import { buildRound, dayIso, dayKey, match, msUntilNextDay, pool, prevDayKey, scoreAnswers, validate } from "@/lib/game-engine";
import { apply, blank, liveStreak } from "@/lib/stats";
import { cleanName } from "@/lib/leaderboard/names";

const q = (id: string) => QUESTIONS.find((x) => x.id === id)!;
const hit = (id: string, text: string) => match(q(id), text)?.[0] ?? null;

describe("question bank", () => {
  it("has no data problems", () => {
    expect(validate(QUESTIONS, CATEGORIES)).toEqual([]);
  });
  it("covers every category", () => {
    for (const c of CATEGORIES) expect(pool(QUESTIONS, { cats: [c] }).length).toBeGreaterThanOrEqual(3);
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

describe("rounds", () => {
  it("builds the same daily round for the same day, for everyone", () => {
    const a = buildRound(QUESTIONS, { mode: "daily", seed: 20261117 }).map((x) => x.id);
    const b = buildRound(QUESTIONS, { mode: "daily", seed: 20261117 }).map((x) => x.id);
    const c = buildRound(QUESTIONS, { mode: "daily", seed: 20261118 }).map((x) => x.id);
    expect(a).toEqual(b);
    expect(a).not.toEqual(c);
    expect(new Set(a).size).toBe(7);
  });
  it("keys the day to UTC", () => {
    expect(dayKey(new Date("2026-11-17T23:59:59Z"))).toBe(20261117);
    expect(dayKey(new Date("2026-11-18T00:00:00Z"))).toBe(20261118);
    expect(prevDayKey(20270101)).toBe(20261231);
    expect(dayIso(20261107)).toBe("2026-11-07");
    expect(msUntilNextDay(new Date("2026-11-17T23:00:00Z"))).toBe(3600000);
  });
  it("respects practice filters and uses the whole bank for endless", () => {
    const law = buildRound(QUESTIONS, { mode: "practice", cats: ["Business Law"] });
    expect(law.length).toBe(3);
    expect(law.every((x) => x.cat === "Business Law")).toBe(true);
    expect(buildRound(QUESTIONS, { mode: "practice", diff: 3 }).every((x) => x.diff === 3)).toBe(true);
    expect(buildRound(QUESTIONS, { mode: "endless" }).length).toBe(QUESTIONS.length);
  });
});

describe("server-side scoring", () => {
  const round = buildRound(QUESTIONS, { mode: "daily", seed: 20261117 });
  it("scores a perfect round at 700", () => {
    const best = round.map((x) => x.a.find((r) => r[1] === 6)![0]);
    expect(scoreAnswers(round, best)).toEqual({ score: 700, levels: [6, 6, 6, 6, 6, 6, 6] });
  });
  it("gives nothing for wrong, blank or missing answers", () => {
    expect(scoreAnswers(round, ["zzzz", "", "qqqq"])).toEqual({ score: 0, levels: [0, 0, 0, 0, 0, 0, 0] });
  });
});

describe("stats", () => {
  it("tracks bests and the daily streak", () => {
    const day1 = apply(blank(), { mode: "daily", score: 300, dayKey: 20261117, prevDayKey: 20261116, log: [{ cat: "Finance", level: 6, pts: 100 }, { cat: "Finance", level: -1, pts: 0 }] });
    expect(day1.outcome).toEqual({ newBest: true, previousBest: 0, streak: 1 });
    const day2 = apply(day1.stats, { mode: "daily", score: 200, dayKey: 20261118, prevDayKey: 20261117, log: [] });
    expect(day2.outcome.streak).toBe(2);
    expect(day2.outcome.newBest).toBe(false);
    expect(day2.stats.levels.miss).toBe(1);
    expect(day2.stats.cats.Finance.glass).toBe(1);
    expect(liveStreak(day2.stats, 20261120, 20261119)).toBe(0);
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
