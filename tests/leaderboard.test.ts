import { describe, expect, it } from "vitest";
import { MAX_ANSWER_LENGTH, ROUND_SIZE, buildRound, nextDayKey, prevDayKey, scoreAnswers } from "@/lib/game-engine";
import { createLimiter } from "@/lib/leaderboard/ratelimit";
import { parseCluster, parseSubmission, scoreSubmission } from "@/lib/leaderboard/submission";
import { CLUSTER_CHOICES, QUESTIONS } from "@/lib/questions";
import type { ClusterChoice } from "@/types";

const TODAY = 20261117;
/** Midday Eastern on that day. */
const NOW = new Date("2026-11-17T17:00:00Z");
const round = (cluster: ClusterChoice, day = TODAY) => buildRound(QUESTIONS, { mode: "daily", cluster, seed: day });
/** The rarest answer on each prompt of a cluster's round: a perfect set of typed answers for that round. */
const best = (cluster: ClusterChoice, day = TODAY) => round(cluster, day).map((q) => q.a.find((row) => row[1] === 6)![0]);
const body = (over: Record<string, unknown> = {}) => ({ name: "Test Player", day: TODAY, cluster: "fin", answers: best("fin"), ...over });

function submit(input: unknown, now = NOW) {
  const parsed = parseSubmission(input, now);
  if (!parsed.ok) throw new Error(parsed.error);
  const scored = scoreSubmission(parsed.submission);
  if (!scored.ok) throw new Error(scored.error);
  return { ...parsed.submission, score: scored.score, levels: scored.levels };
}

describe("leaderboard submission", () => {
  it("scores a valid submission exactly as the engine does", () => {
    for (const cluster of CLUSTER_CHOICES) {
      const answers = best(cluster).map((a, i) => (i % 3 === 2 ? "not an answer" : a));
      const out = submit(body({ cluster, answers }));
      expect(out.cluster).toBe(cluster);
      expect({ score: out.score, levels: out.levels }).toEqual(scoreAnswers(round(cluster), answers));
    }
    expect(submit(body()).score).toBe(700);
    expect(submit(body()).levels).toEqual([6, 6, 6, 6, 6, 6, 6]);
  });

  it("ignores a score, levels or points sent by the browser", () => {
    const answers = Array.from({ length: ROUND_SIZE }, () => "not an answer");
    const parsed = parseSubmission(body({ answers, score: 700, levels: [6, 6, 6, 6, 6, 6, 6], points: 700, pts: 700 }), NOW);
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;
    expect(Object.keys(parsed.submission).sort()).toEqual(["answers", "cluster", "day", "name"]);
    expect(scoreSubmission(parsed.submission)).toEqual({ ok: true, score: 0, levels: [0, 0, 0, 0, 0, 0, 0] });
  });

  it("rejects an unknown cluster and treats a missing one as the mixed round", () => {
    for (const cluster of ["xyz", "", "ALL", 3, ["fin"]]) {
      expect(parseSubmission(body({ cluster }), NOW)).toEqual({ ok: false, error: "Unknown cluster." });
    }
    const { cluster: _dropped, ...old } = body({ answers: best("all") });
    void _dropped;
    const out = submit(old);
    expect(out.cluster).toBe("all");
    expect(out.score).toBe(700);
    expect(parseCluster(null)).toEqual({ ok: true, cluster: "all" });
    expect(parseCluster("mkt")).toEqual({ ok: true, cluster: "mkt" });
    expect(parseCluster("nope").ok).toBe(false);
  });

  it("rejects the wrong number of answers and answers that are not text", () => {
    const seven = best("fin");
    for (const answers of [seven.slice(0, 6), [...seven, "extra"], [], "seven", undefined, [...seven.slice(0, 6), 7], [...seven.slice(0, 6), null]]) {
      expect(parseSubmission(body({ answers }), NOW)).toEqual({ ok: false, error: "A daily round has seven answers." });
    }
  });

  it("scores an over-long answer as a miss and still accepts the other six", () => {
    const seven = best("fin");
    expect(MAX_ANSWER_LENGTH).toBe(80);
    const out = submit(body({ answers: [...seven.slice(0, 6), "x".repeat(81)] }));
    expect(out.score).toBe(600);
    expect(out.levels).toEqual([6, 6, 6, 6, 6, 6, 0]);
    expect(out.answers[6]).toBe("");
    // padding a real answer past the limit does not earn it
    expect(submit(body({ answers: [...seven.slice(0, 6), seven[6] + " ".repeat(200)] })).score).toBe(600);
    expect(submit(body({ answers: [...seven.slice(0, 6), "x".repeat(80)] })).answers[6]).toHaveLength(80);
  });

  it("gives different results for the same typed answers in two clusters", () => {
    const answers = best("fin");
    const fin = submit(body({ cluster: "fin", answers }));
    const mkt = submit(body({ cluster: "mkt", answers }));
    const all = submit(body({ cluster: "all", answers }));
    expect(round("fin").map((q) => q.id)).not.toEqual(round("mkt").map((q) => q.id));
    expect(fin.score).toBe(700);
    expect(mkt.score).toBeLessThan(fin.score);
    expect(mkt.levels).not.toEqual(fin.levels);
    expect(all.score).toBeLessThan(fin.score);
  });

  it("accepts only today's round (Eastern Time), with an hour's grace for yesterday's after midnight", () => {
    const yesterday = prevDayKey(TODAY);
    const tomorrow = nextDayKey(TODAY);
    expect(submit(body()).day).toBe(TODAY);
    for (const day of [yesterday, tomorrow, prevDayKey(yesterday), nextDayKey(tomorrow), 20251117, String(TODAY), undefined, null]) {
      const parsed = parseSubmission(body({ day }), NOW);
      expect(parsed.ok).toBe(false);
      if (!parsed.ok) expect(parsed.error).toContain("closed");
    }
    // tomorrow's round cannot be posted early, even late in the evening when the UTC date has already moved on
    expect(parseSubmission(body({ day: tomorrow }), new Date("2026-11-18T03:00:00Z")).ok).toBe(false);
    // half an hour after midnight Eastern, a round started the evening before still posts, under its own day
    const justAfter = new Date("2026-11-18T05:30:00Z");
    expect(submit(body({ day: TODAY }), justAfter).score).toBe(700);
    expect(submit(body({ day: tomorrow, answers: best("fin", tomorrow) }), justAfter).day).toBe(tomorrow);
    expect(parseSubmission(body({ day: TODAY }), new Date("2026-11-18T06:30:00Z")).ok).toBe(false);
    // the first day of a month still has a yesterday
    expect(parseSubmission(body({ day: 20261130 }), new Date("2026-12-01T05:20:00Z")).ok).toBe(true);
  });

  it("keeps the name rules", () => {
    expect(parseSubmission(body({ name: "ab" }), NOW).ok).toBe(false);
    expect(parseSubmission(body({ name: undefined }), NOW).ok).toBe(false);
    expect(submit(body({ name: "  Test   Player " })).name).toBe("Test Player");
    for (const bad of [null, [], "text", 7]) expect(parseSubmission(bad, NOW).ok).toBe(false);
  });

  it("limits posts per address without counting the refused ones", () => {
    const limited = createLimiter(3, 60_000);
    const t0 = 1_000_000;
    expect([limited("a", t0), limited("a", t0 + 1), limited("a", t0 + 2)]).toEqual([false, false, false]);
    expect(limited("a", t0 + 3)).toBe(true);
    expect(limited("b", t0 + 3)).toBe(false); // another address has its own allowance
    // a class that keeps retrying every second must not keep its own window full
    for (let s = 1; s < 60; s++) expect(limited("a", t0 + s * 1000)).toBe(true);
    expect(limited("a", t0 + 60_000)).toBe(false); // the first accepted post has aged out
    expect(limited("a", t0 + 60_001)).toBe(false);
    expect(limited("a", t0 + 60_002)).toBe(false);
    expect(limited("a", t0 + 60_003)).toBe(true);
    // the map of addresses cannot grow without limit
    const small = createLimiter(1, 60_000, 2);
    expect([small("x", t0), small("y", t0), small("z", t0)]).toEqual([false, false, false]);
    expect(small("z", t0 + 1)).toBe(true);
  });

  it("refuses a cluster whose daily round is closed", () => {
    const thin = QUESTIONS.filter((q) => q.cluster !== "ent").concat(QUESTIONS.filter((q) => q.cluster === "ent").slice(0, 5));
    expect(scoreSubmission({ day: TODAY, cluster: "ent", answers: best("fin") }, thin).ok).toBe(false);
    expect(scoreSubmission({ day: TODAY, cluster: "fin", answers: best("fin") }, thin).ok).toBe(true);
  });
});
