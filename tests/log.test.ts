import { beforeEach, describe, expect, it } from "vitest";
import { match } from "@/lib/game-engine";
import {
  CSV_HEADER, LOG_CAP, LOG_KEY, addRound, appendRound, clearLog, clusterSummaries, csvCell, filterRounds, isLogPersistent, loadLog, logSnapshot, makeRound,
  matchedRow, overall, roundsNotListed, sanitize, subscribeLog, toCsv, topicBreakdown, type LoggedRound,
} from "@/lib/log";
import { QUESTIONS } from "@/lib/questions";
import { pointsFor } from "@/lib/scoring";
import { apply, blank, countsNow, isPersistent, load, migrate, normalize, record, reset, snapshot, subscribe, type Stats } from "@/lib/stats";
import type { ClusterChoice, LogEntry, Mode, Question } from "@/types";

const fin = QUESTIONS.filter((q) => q.cluster === "fin");
const mkt = QUESTIONS.filter((q) => q.cluster === "mkt");

function entry(question: Question, typed: string, timedOut = false): LogEntry {
  const row = match(question, typed);
  return { question, row, typed, pts: pointsFor(row), level: row ? row[1] : -1, timedOut };
}
function round(id: string, cluster: ClusterChoice, mode: Mode, log: LogEntry[], counted = true, at = "2026-11-17T15:04:05.000Z"): LoggedRound {
  return makeRound({ id, at: new Date(at), day: 20261117, cluster, mode, score: log.reduce((s, l) => s + l.pts, 0), counted, log });
}
function play(stats: Stats, cluster: ClusterChoice, mode: Mode, log: LogEntry[], day = 20261117): Stats {
  return apply(stats, {
    mode, cluster, score: log.reduce((s, l) => s + l.pts, 0), dayKey: day, prevDayKey: day - 1,
    log: log.map((l) => ({ cluster: l.question.cluster, topic: l.question.topic, level: l.level, pts: l.pts })),
  }).stats;
}
/** Splits one CSV document into rows of fields (handles quotes, doubled quotes and line breaks inside quotes). */
function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"' && text[i + 1] === '"') {
        cell += '"';
        i++;
      } else if (ch === '"') quoted = false;
      else cell += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ",") {
      row.push(cell);
      cell = "";
    } else if (ch === "\r" && text[i + 1] === "\n") {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
      i++;
    } else cell += ch;
  }
  return rows;
}

describe("round log", () => {
  it("stores prompt ids, not whole prompts", () => {
    const good = fin[0].a[0][0];
    const r = round("r1", "fin", "daily", [entry(fin[0], good), entry(fin[1], "zzz not an answer", true)]);
    expect(r.at).toBe("2026-11-17T15:04:05.000Z");
    expect(r.entries).toEqual([
      { id: fin[0].id, typed: good, level: fin[0].a[0][1], pts: pointsFor(fin[0].a[0]), timedOut: false },
      { id: fin[1].id, typed: "zzz not an answer", level: -1, pts: 0, timedOut: true },
    ]);
    expect(JSON.stringify(r)).not.toContain(fin[0].why);
    const auto = makeRound({ at: new Date(), day: 20261117, cluster: "all", mode: "practice", score: 0, counted: true, log: [] });
    const auto2 = makeRound({ at: new Date(), day: 20261117, cluster: "all", mode: "practice", score: 0, counted: true, log: [] });
    expect(auto.id).not.toBe(auto2.id);
  });

  it("adds newest first and keeps the latest 500", () => {
    let log: LoggedRound[] = [];
    for (let i = 0; i < LOG_CAP + 5; i++) log = addRound(log, round(`r${i}`, "all", "practice", []));
    expect(LOG_CAP).toBe(500);
    expect(log).toHaveLength(500);
    expect(log[0].id).toBe("r504");
    expect(log[499].id).toBe("r5");
    const before = log.slice();
    addRound(log, round("x", "all", "daily", []));
    expect(log).toEqual(before); // pure
  });

  it("filters by cluster and mode", () => {
    const log = [round("a", "fin", "daily", []), round("b", "fin", "practice", []), round("c", "all", "daily", []), round("d", "mkt", "unlimited", [])];
    const ids = (cluster: ClusterChoice | "any", mode: Mode | "any") => filterRounds(log, { cluster, mode }).map((r) => r.id);
    expect(ids("any", "any")).toEqual(["a", "b", "c", "d"]);
    expect(ids("fin", "any")).toEqual(["a", "b"]);
    expect(ids("any", "daily")).toEqual(["a", "c"]);
    expect(ids("fin", "daily")).toEqual(["a"]);
    expect(ids("all", "any")).toEqual(["c"]); // "all" is the mixed round, not every round
    expect(ids("ht", "any")).toEqual([]);
  });

  it("drops malformed saved rounds and repairs fields", () => {
    expect(sanitize(null)).toEqual([]);
    expect(sanitize({ a: 1 })).toEqual([]);
    const ok = round("ok", "fin", "daily", [entry(fin[0], fin[0].a[0][0])]);
    const out = sanitize([
      ok, "junk", { id: "no-date", cluster: "fin", mode: "daily", entries: [] }, { ...ok, id: "bad-cluster", cluster: "zzz" }, { ...ok, id: "bad-mode", mode: "endless" },
      { id: "loose", at: ok.at, cluster: "all", mode: "practice", entries: [{ id: "q1", level: 9 }, 5, { typed: "no id" }] },
    ]);
    expect(out.map((r) => r.id)).toEqual(["ok", "loose"]);
    expect(out[0]).toEqual(ok);
    // a round saved without a day takes the day it finished
    expect(out[1]).toMatchObject({ day: 20261117, score: 0, counted: true, entries: [{ id: "q1", typed: "", level: -1, pts: 0, timedOut: false }] });
  });

  it("repairs a damaged day key from the round's own time, so the export cannot fail", () => {
    const ok = round("ok", "fin", "daily", [entry(fin[0], fin[0].a[0][0])], true, "2026-03-01T00:30:00.000Z");
    for (const day of [1e20, 0, -5, 20261340, 20260230, 2026.5, "20261117", null, undefined]) {
      const [r] = sanitize([{ ...ok, day }]);
      expect(r.day).toBe(20260301);
      expect(parseCsv(toCsv([r], QUESTIONS))[1][2]).toBe("2026-03-01");
    }
    expect(sanitize([{ ...ok, day: 20260228 }])[0].day).toBe(20260228); // a real day is kept, even if it is not the day in `at`
  });

  it("caps the length of a stored answer", () => {
    const long = "x".repeat(5000);
    const r = round("long", "fin", "practice", [entry(fin[0], long)]);
    expect(r.entries[0].typed).toHaveLength(80);
    expect(sanitize([{ ...r, entries: [{ ...r.entries[0], typed: long }] }])[0].entries[0].typed).toHaveLength(80);
  });
});

describe("log storage", () => {
  beforeEach(() => {
    const data = new Map<string, string>();
    (globalThis as { localStorage?: unknown }).localStorage = {
      getItem: (k: string) => data.get(k) ?? null,
      setItem: (k: string, v: string) => void data.set(k, v),
      removeItem: (k: string) => void data.delete(k),
    };
  });

  it("appends, reloads and clears", () => {
    expect(loadLog()).toEqual([]);
    appendRound(round("a", "fin", "daily", [entry(fin[0], fin[0].a[0][0])]));
    const log = appendRound(round("b", "mkt", "unlimited", [], false));
    expect(log.map((r) => r.id)).toEqual(["b", "a"]);
    expect(JSON.parse(localStorage.getItem(LOG_KEY)!)).toEqual(log);
    expect(loadLog()).toEqual(log);
    expect(loadLog()[0].counted).toBe(false);
    expect(clearLog()).toEqual([]);
    expect(loadLog()).toEqual([]);
  });

  it("migrates v2 stats without deleting them, and reads older v3 shapes", () => {
    const v2 = { games: 4, prompts: 28, pts: 900, levels: { 6: 2 }, cats: { Accounting: { n: 5, pts: 200, glass: 1 } }, best: { endless: 950 }, daily: { last: 20261116, streak: 3, bestStreak: 5, score: 410 } };
    localStorage.setItem("decallion-stats-v2", JSON.stringify(v2));
    const s = load();
    expect(s.clusters.all).toEqual({ games: 4, prompts: 28, pts: 900 });
    expect(s.best["all:unlimited"]).toBe(950);
    expect(localStorage.getItem("decallion-stats-v2")).toBe(JSON.stringify(v2));
    // a v3 save from before per-cluster totals existed
    localStorage.setItem("decallion-stats-v3", JSON.stringify({ games: 3, prompts: 21, pts: 600, levels: { 6: 1 }, topics: {}, best: { "fin:daily": 300 }, daily: {} }));
    const v3 = load();
    expect(v3.clusters).toEqual({ all: { games: 3, prompts: 21, pts: 600 } });
    expect(v3.best["fin:daily"]).toBe(300);
    expect(v3.levels.miss).toBe(0);
  });

  it("treats a damaged save as empty, not as blocked storage", () => {
    clearLog();
    reset();
    for (const bad of ['[{"id":', "null", "{}", '"text"']) {
      localStorage.setItem(LOG_KEY, bad);
      expect(loadLog()).toEqual([]);
    }
    for (const bad of ['{"games":', "null", "[]", "7"]) {
      localStorage.setItem("decallion-stats-v3", bad);
      expect(load()).toEqual(blank());
    }
    localStorage.removeItem("decallion-stats-v3");
    for (const bad of ["null", "{", "[1]"]) {
      localStorage.setItem("decallion-stats-v2", bad); // migrate(null) used to throw
      expect(load()).toEqual(blank());
    }
    expect(isLogPersistent()).toBe(true);
    expect(isPersistent()).toBe(true);
    // the next finished round is saved normally
    const log = appendRound(round("after", "fin", "practice", []));
    expect(JSON.parse(localStorage.getItem(LOG_KEY)!)).toEqual(log);
  });

  it("reads storage again for every round, so another tab or a cleared log is not overwritten", () => {
    const one = [entry(fin[0], fin[0].a[0][0])];
    const result = (cluster: ClusterChoice, mode: Mode) => ({
      mode, cluster, score: one[0].pts, dayKey: 20261117, prevDayKey: 20261116,
      log: one.map((l) => ({ cluster: l.question.cluster, topic: l.question.topic, level: l.level, pts: l.pts })),
    });
    const stale = load(); // what a tab opened earlier is still holding
    expect(countsNow(stale, "daily", "fin", 20261117)).toBe(true);
    record(load(), result("fin", "daily")); // tab A plays today's Finance daily
    // tab B finishes later: it must add to what is stored and must not count the same daily again
    expect(countsNow(load(), "daily", "fin", 20261117)).toBe(false);
    expect(countsNow(load(), "daily", "fin", 20261118)).toBe(true); // a new day
    expect(countsNow(load(), "daily", "mkt", 20261117)).toBe(true); // another cluster
    expect(countsNow(load(), "practice", "fin", 20261117)).toBe(true);
    record(load(), result("fin", "practice"));
    expect(load().games).toBe(2);
    expect(load().clusters.fin.games).toBe(2);
    // "Clear log and stats" on the log page, then a round finished in a game that was already open
    reset();
    record(load(), result("mkt", "unlimited"));
    expect(load().games).toBe(1);
    expect(load().daily.fin).toBeUndefined();
  });

  it("tells subscribers when the saved data changes, and keeps the snapshot stable in between", () => {
    clearLog();
    reset();
    let logCalls = 0, statCalls = 0;
    const offLog = subscribeLog(() => logCalls++);
    const offStats = subscribe(() => statCalls++);
    const before = logSnapshot(), statsBefore = snapshot();
    expect(logSnapshot()).toBe(before);
    expect(snapshot()).toBe(statsBefore);
    appendRound(round("s", "fin", "practice", []));
    expect(logCalls).toBe(1);
    expect(logSnapshot()).not.toBe(before);
    expect(logSnapshot().map((r) => r.id)).toEqual(["s"]);
    reset();
    expect(statCalls).toBe(1);
    expect(snapshot()).not.toBe(statsBefore);
    offLog();
    offStats();
    clearLog();
    reset();
    expect([logCalls, statCalls]).toEqual([1, 1]);
    expect(logSnapshot()).toEqual([]);
  });

  it("keeps the session's rounds in memory when storage can be read but not written", () => {
    clearLog();
    reset();
    const kept = appendRound(round("old", "fin", "practice", []));
    const data = new Map<string, string>([[LOG_KEY, JSON.stringify(kept)], ["decallion-stats-v3", JSON.stringify(load())]]);
    let full = true;
    (globalThis as { localStorage?: unknown }).localStorage = {
      getItem: (k: string) => data.get(k) ?? null,
      setItem: (k: string, v: string) => {
        if (full) throw new Error("QuotaExceededError");
        data.set(k, v);
      },
    };
    const one = [entry(fin[0], fin[0].a[0][0])];
    const daily = { mode: "daily" as Mode, cluster: "fin" as ClusterChoice, score: one[0].pts, dayKey: 20261117, prevDayKey: 20261116, log: one.map((l) => ({ cluster: l.question.cluster, topic: l.question.topic, level: l.level, pts: l.pts })) };
    appendRound(round("r1", "fin", "daily", one));
    record(load(), daily);
    appendRound(round("r2", "fin", "practice", one));
    record(load(), { ...daily, mode: "practice" });
    // neither round reached storage, and both are still there for the session
    expect(JSON.parse(data.get(LOG_KEY)!)).toHaveLength(1);
    expect(loadLog().map((r) => r.id)).toEqual(["r2", "r1", "old"]);
    expect(load().games).toBe(2);
    expect(countsNow(load(), "daily", "fin", 20261117)).toBe(false); // today's daily cannot count twice
    expect(isLogPersistent()).toBe(false);
    expect(isPersistent()).toBe(false);
    // once a save works again, storage has everything and the warning goes away
    full = false;
    appendRound(round("r3", "fin", "practice", one));
    record(load(), { ...daily, mode: "practice" });
    expect(JSON.parse(data.get(LOG_KEY)!).map((r: LoggedRound) => r.id)).toEqual(["r3", "r2", "r1", "old"]);
    expect(JSON.parse(data.get("decallion-stats-v3")!).games).toBe(3);
    expect(isLogPersistent()).toBe(true);
    expect(isPersistent()).toBe(true);
  });

  // keep this test last in the block: it leaves the modules in "not saved" mode
  it("falls back to memory when storage is blocked", () => {
    clearLog();
    reset();
    (globalThis as { localStorage?: unknown }).localStorage = {
      getItem: () => { throw new Error("blocked"); },
      setItem: () => { throw new Error("blocked"); },
    };
    clearLog();
    appendRound(round("m", "all", "practice", []));
    expect(loadLog().map((r) => r.id)).toEqual(["m"]);
    expect(load().games).toBe(0);
    expect(isLogPersistent()).toBe(false);
  });
});

describe("log summaries", () => {
  const glass = (q: Question) => q.a.find((r) => r[1] === 6)![0];
  const low = (q: Question) => q.a.slice().sort((a, b) => a[1] - b[1])[0][0];

  it("keeps totals per chosen cluster and topics per prompt cluster", () => {
    let s = blank();
    s = play(s, "fin", "daily", [entry(fin[0], glass(fin[0])), entry(fin[1], "zzz")]);
    s = play(s, "all", "practice", [entry(fin[0], low(fin[0])), entry(mkt[0], glass(mkt[0]))]);
    expect(overall(s)).toEqual({ rounds: 2, prompts: 4, avg: Math.round(s.pts / 4), glass: 2 });
    const rows = clusterSummaries(s, 20261117, 20261116);
    expect(rows.map((r) => r.cluster)).toEqual(["bma", "ent", "fin", "ht", "mkt", "all"]);
    const by = Object.fromEntries(rows.map((r) => [r.cluster, r]));
    expect(by.fin).toMatchObject({ rounds: 1, prompts: 2, pts: 100, avg: 50, streak: 1, bestStreak: 1, best: { daily: 100, practice: 0, unlimited: 0 } });
    expect(by.all).toMatchObject({ rounds: 1, prompts: 2, streak: 0, bestStreak: 0 });
    expect(by.all.best.practice).toBe(by.all.pts);
    expect(by.mkt).toMatchObject({ rounds: 0, prompts: 0, avg: 0 }); // the mkt prompt was played in an All clusters round
    // the streak lapses after a missed day, the best streak stays
    expect(clusterSummaries(s, 20261119, 20261118).find((r) => r.cluster === "fin")).toMatchObject({ streak: 0, bestStreak: 1 });
    expect(topicBreakdown(s, "mkt")).toEqual([{ cluster: "mkt", topic: mkt[0].topic, prompts: 1, pts: 100, avg: 100, glass: 1 }]);
  });

  it("sorts topics weakest first", () => {
    const s = blank();
    s.topics = {
      "fin|Accounting": { n: 4, pts: 100, glass: 0 }, "fin|Finance": { n: 2, pts: 160, glass: 1 }, "mkt|Marketing": { n: 3, pts: 30, glass: 0 },
      "mkt|Selling": { n: 9, pts: 225, glass: 0 }, "fin|Empty": { n: 0, pts: 0, glass: 0 }, "zzz|Unknown": { n: 3, pts: 0, glass: 0 },
    };
    expect(topicBreakdown(s).map((t) => `${t.cluster}|${t.topic}:${t.avg}`)).toEqual(["mkt|Marketing:10", "mkt|Selling:25", "fin|Accounting:25", "fin|Finance:80"]);
    expect(topicBreakdown(s, "fin").map((t) => t.topic)).toEqual(["Accounting", "Finance"]);
    expect(topicBreakdown(s, "ht")).toEqual([]);
  });

  it("carries migrated v2 totals and says how many rounds are not listed", () => {
    const s = migrate({ games: 4, prompts: 28, pts: 900, cats: { Accounting: { n: 5, pts: 200, glass: 1 } }, best: { daily: 410, endless: 950 }, daily: { last: 20261116, streak: 3, bestStreak: 5, score: 410 } });
    const all = clusterSummaries(s, 20261117, 20261116).find((r) => r.cluster === "all")!;
    expect(all).toMatchObject({ rounds: 4, prompts: 28, avg: 32, streak: 3, bestStreak: 5, best: { daily: 410, practice: 0, unlimited: 950 } });
    expect(topicBreakdown(s)).toEqual([{ cluster: "fin", topic: "Accounting", prompts: 5, pts: 200, avg: 40, glass: 1 }]);
    expect(roundsNotListed(s, [])).toBe(4);
    const after = play(s, "fin", "practice", []);
    const log = [round("a", "fin", "practice", []), round("b", "fin", "daily", [], false)]; // the replay is not in the totals
    expect(roundsNotListed(after, log)).toBe(4);
    expect(roundsNotListed(blank(), log)).toBe(0);
    expect(normalize(JSON.parse(JSON.stringify(after)))).toEqual(after);
  });
});

describe("CSV export", () => {
  it("quotes fields and guards against formulas", () => {
    expect(csvCell("plain")).toBe("plain");
    expect(csvCell(42)).toBe("42");
    expect(csvCell("a,b")).toBe('"a,b"');
    expect(csvCell('say "hi"')).toBe('"say ""hi"""');
    expect(csvCell("two\nlines")).toBe('"two\nlines"');
    expect(csvCell("=1+1")).toBe("'=1+1");
    expect(csvCell("+1")).toBe("'+1");
    expect(csvCell("-1")).toBe("'-1");
    expect(csvCell("@SUM(A1)")).toBe("'@SUM(A1)");
    expect(csvCell('=HYPERLINK("x","y")')).toBe(`"'=HYPERLINK(""x"",""y"")"`);
  });

  it("writes one line per answered prompt for the whole log", () => {
    const q = fin[0];
    const top = q.a.find((r) => r[1] === 6)!;
    const log = [
      round("r2", "all", "unlimited", [entry(q, top[0]), entry(mkt[0], '=cmd, "x"\nnext', true)], false),
      round("r1", "fin", "daily", [{ ...entry(q, "gone"), question: { ...q, id: "removed-1" } }]),
    ];
    const csv = toCsv(log, QUESTIONS);
    expect(csv.endsWith("\r\n")).toBe(true);
    const rows = parseCsv(csv);
    expect(rows).toHaveLength(4);
    expect(rows[0]).toEqual(CSV_HEADER);
    expect(rows[0]).toHaveLength(17);
    expect(rows[1]).toEqual(["r2", "2026-11-17T15:04:05.000Z", "2026-11-17", "All clusters", "Unlimited", "no", "100", "1000", "1", q.id, q.topic, q.q, top[0], top[0], "DECA Glass", "100", "no"]);
    expect(rows[2].slice(8, 11)).toEqual(["2", mkt[0].id, mkt[0].topic]);
    expect(rows[2].slice(12)).toEqual([`'=cmd, "x"\nnext`, "", "No credit", "0", "yes"]);
    // a prompt that is no longer in the bank keeps its id and what was typed
    expect(rows[3].slice(0, 6)).toEqual(["r1", "2026-11-17T15:04:05.000Z", "2026-11-17", "Finance", "Daily", "yes"]);
    expect(rows[3].slice(9)).toEqual(["removed-1", "", "", "gone", "", "No credit", "0", "no"]);
    expect(matchedRow(undefined, log[1].entries[0])).toBeNull();
    expect(toCsv([], QUESTIONS)).toBe(CSV_HEADER.join(",") + "\r\n");
  });
});
