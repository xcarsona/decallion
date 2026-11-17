/* Checks on the question bank only. Run alone with: npx vitest run tests/bank.test.ts */
import { describe, expect, it } from "vitest";
import { BANK, CLUSTERS, CLUSTER_IDS, QUESTIONS, topicsOf } from "@/lib/questions";
import { DAILY_MIN, countByCluster, dailyEnabled, validate } from "@/lib/game-engine";

describe("question bank", () => {
  it("has no data problems", () => {
    expect(validate(QUESTIONS)).toEqual([]);
  });
  it("keeps every prompt in the file for its cluster", () => {
    for (const c of CLUSTER_IDS) expect(BANK[c].filter((q) => q.cluster !== c).map((q) => q.id)).toEqual([]);
  });
  it("reports how many prompts each cluster has", () => {
    const counts = countByCluster(QUESTIONS);
    const lines = CLUSTER_IDS.map((c) => {
      const daily = dailyEnabled(QUESTIONS, c) ? "on" : "off until " + DAILY_MIN;
      return "  " + c.padEnd(4) + String(counts[c]).padStart(4) + "  " + CLUSTERS[c].name + " (" + topicsOf(c).length + " topics, daily " + daily + ")";
    });
    console.info(["Prompts per cluster:", ...lines, "  all " + String(QUESTIONS.length).padStart(4)].join("\n"));
    expect(Object.values(counts).reduce((a, b) => a + b, 0)).toBe(QUESTIONS.length);
    for (const c of CLUSTER_IDS) expect(counts[c]).toBeGreaterThan(0);
  });
});
