/* Typing slips that must not turn into a different answer, the "did you mean" signal, and daily rounds that stay put
   when prompts are added. */
import { describe, expect, it } from "vitest";
import { DAILY_MIN, ROUND_SIZE, dailyEnabled, dailyRound, match, matchDetail, nextDayKey } from "@/lib/game-engine";
import { CLUSTER_IDS } from "@/lib/questions";
import type { AnswerRow, Question } from "@/types";

const board = (...answers: (string | [string, ...string[]])[]): Question => ({
  id: "T-1", cluster: "fin", topic: "Test", area: "Test", diff: 1, q: "Prompt.", why: "Because.",
  a: answers.map((x, i): AnswerRow => (typeof x === "string" ? [x, ((i % 6) + 1) as 1] : [x[0], ((i % 6) + 1) as 1, ...x.slice(1)])),
});

describe("a slip is not a different answer", () => {
  it("refuses near misses that change the meaning", () => {
    // typed answer, and the accepted wording it once scored as
    const cases: [string, string][] = [
      ["trained employees", "untrained employees"], ["collectible accounts", "uncollectible accounts"], ["adequate systems", "inadequate systems"],
      ["profit minimization", "profit maximization"], ["maximal regulation", "minimal regulation"], ["lawful confinement", "unlawful confinement"],
      ["accompanied minor fees", "unaccompanied minor fees"], ["imperfect competition", "perfect competition"], ["theory", "theory x"],
      ["theory b", "theory x"], ["c corp certification", "b corp certification"], ["m-commerce platform", "e-commerce platform"],
      ["403k match", "401k match"], ["being over 30", "being over 40"], ["s&p 400", "s&p 500"], ["macrofinance", "microfinance"],
      ["honest advertising", "dishonest advertising"], ["direct costs", "indirect costs"], ["tangible assets", "intangible assets"],
      ["exporting goods", "importing goods"], ["underpricing", "overpricing"], ["nonprofit corporation", "profit corporation"],
    ];
    for (const [typed, accepted] of cases) {
      const q = board(accepted, "Two", "Three", "Four", "Five", "Six");
      expect(match(q, typed)?.[0] ?? null, typed + " is not " + accepted).toBeNull();
      expect(match(q, accepted)?.[0], accepted).toBe(accepted);
    }
  });
  it("still forgives real slips in the same answers", () => {
    const q = board("Uncollectible accounts", "Perfect competition", "Profit maximization", "401(k) match", "E-commerce platform", "Microfinance");
    const got = (text: string) => match(q, text)?.[0] ?? null;
    expect(got("uncollectable accounts")).toBe("Uncollectible accounts");
    expect(got("perfect compettion")).toBe("Perfect competition");
    expect(got("profit maximisation")).toBe("Profit maximization");
    expect(got("e-commerce platfrom")).toBe("E-commerce platform");
    expect(got("microfinanse")).toBe("Microfinance");
  });
});

describe("did you mean", () => {
  const q = board(["Penetration pricing", "penetration"], "Cost of goods sold", "Accounts receivable", "Franchise", "Bond", "Libraries");
  it("says a correctly typed answer is exact, whatever the case, order, plural or joining words", () => {
    for (const text of ["penetration pricing", "PENETRATION PRICING", "pricing, penetration", "penetration", "cost goods sold", "accounts receivables", "bonds", "library", "franchises"]) {
      expect(matchDetail(q, text)?.exact, text).toBe(true);
    }
  });
  it("says a near miss is not exact, and names the answer it is close to", () => {
    for (const [text, answer] of [["penetraton pricing", "Penetration pricing"], ["acounts recievable", "Accounts receivable"], ["franchize", "Franchise"], ["cost of godos sold", "Cost of goods sold"]]) {
      expect(matchDetail(q, text), text).toMatchObject({ exact: false });
      expect(matchDetail(q, text)?.row[0]).toBe(answer);
    }
  });
  it("gives nothing for a wrong answer", () => {
    for (const text of ["banana", "", "   ", "pricing", "band"]) expect(matchDetail(q, text), text).toBeNull();
  });
});

describe("adding prompts does not change earlier daily rounds", () => {
  const make = (cluster: (typeof CLUSTER_IDS)[number], n: number, tag: string, since?: number): Question[] =>
    Array.from({ length: n }, (_, i): Question => ({
      id: cluster.toUpperCase() + "-" + tag + String(i).padStart(2, "0"), cluster, topic: "topic " + (i % 5), area: "Test", diff: 1, q: tag + cluster + i, why: "w",
      a: [["One", 1], ["Two", 2], ["Three", 3], ["Four", 4], ["Five", 5], ["Six", 6]], ...(since ? { since } : {}),
    }));
  const before = CLUSTER_IDS.flatMap((c) => make(c, 30, "A"));
  const START = 20261124; // the new prompts join from this day
  const after = [...before, ...CLUSTER_IDS.flatMap((c) => make(c, 25, "N", START))];
  const ids = (list: Question[]) => list.map((x) => x.id).join(" ");

  it("keeps every round before the new prompts' first day exactly as it was", () => {
    for (const cluster of ["fin", "all"] as const) {
      for (const day of [20261101, 20261120, 20261122, 20261123]) expect(ids(dailyRound(after, cluster, day)), cluster + " " + day).toBe(ids(dailyRound(before, cluster, day)));
    }
  });
  it("uses the new prompts from their first day on, still seven a day with no repeat within three days", () => {
    let day = START;
    let recent: string[][] = [ids(dailyRound(after, "fin", 20261122)).split(" "), ids(dailyRound(after, "fin", 20261123)).split(" ")];
    let usedNew = 0;
    for (let i = 0; i < 30; i++) {
      const today = dailyRound(after, "fin", day).map((x) => x.id);
      expect(today.length).toBe(ROUND_SIZE);
      for (const earlier of recent) expect(today.filter((id) => earlier.includes(id))).toEqual([]);
      usedNew += today.filter((id) => id.includes("-N")).length;
      recent = [...recent.slice(-1), today];
      day = nextDayKey(day);
    }
    expect(usedNew).toBeGreaterThan(30);
    expect(dailyRound(after, "fin", 20261123).every((x) => !x.id.includes("-N"))).toBe(true);
  });
  it("does not open a cluster's daily round on prompts that have not started yet", () => {
    const thin = [...make("fin", DAILY_MIN - 1, "A"), ...make("fin", 10, "N", START)];
    expect(dailyEnabled(thin, "fin", 20261123)).toBe(false);
    expect(dailyRound(thin, "fin", 20261123)).toEqual([]);
    expect(dailyEnabled(thin, "fin", START)).toBe(true);
    expect(dailyRound(thin, "fin", START).length).toBe(ROUND_SIZE);
  });
});
