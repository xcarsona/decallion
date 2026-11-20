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
    for (const c of CLUSTER_IDS) expect(counts[c]).toBeGreaterThanOrEqual(50);
    expect(QUESTIONS.length).toBeGreaterThanOrEqual(250);
  });
  it("opens the daily round in every cluster", () => {
    for (const c of CLUSTER_IDS) expect(dailyEnabled(QUESTIONS, c)).toBe(true);
    expect(dailyEnabled(QUESTIONS, "all")).toBe(true);
  });
  it("gives every prompt added since the original bank at least 8 answers", () => {
    // Prompts from the original 39 that may stay shorter: they are near-closed sets.
    const original = new Set(["BMA-01", "ECO-01", "ECO-02", "POB-01", "POB-03", "LAW-01", "LAW-02", "LAW-03", "PFL-02", "ACC-02", "MKT-02", "MKT-05", "SEL-03"]);
    const off = QUESTIONS.filter((q) => !original.has(q.id) && q.a.length < 8).map((q) => q.id + ": " + q.a.length);
    expect(off).toEqual([]);
  });
  it("spreads each cluster over several topics and all three difficulties", () => {
    for (const c of CLUSTER_IDS) {
      const topics = topicsOf(c);
      expect(topics.length).toBeGreaterThanOrEqual(5);
      for (const t of topics) expect(BANK[c].filter((q) => q.topic === t).length, c + " " + t).toBeGreaterThanOrEqual(4);
      for (const d of [1, 2, 3]) expect(BANK[c].filter((q) => q.diff === d).length, c + " difficulty " + d).toBeGreaterThanOrEqual(5);
    }
  });
});
