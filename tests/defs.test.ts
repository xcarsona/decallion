/* Checks on the answer definitions. Run one cluster alone with, for example: npx vitest run tests/defs.test.ts -t "cluster fin" */
import { describe, expect, it } from "vitest";
import { BANK, CLUSTER_IDS } from "@/lib/questions";
import type { Definitions } from "@/lib/questions/defs";
import bma from "@/lib/questions/defs/bma.json";
import ent from "@/lib/questions/defs/ent.json";
import fin from "@/lib/questions/defs/fin.json";
import ht from "@/lib/questions/defs/ht.json";
import mkt from "@/lib/questions/defs/mkt.json";
import { norm } from "@/lib/game-engine";

const DEFS = { bma, ent, fin, ht, mkt } as Record<string, Definitions>;
export const MIN_LENGTH = 25;
export const MAX_LENGTH = 240;

describe("answer definitions", () => {
  for (const c of CLUSTER_IDS) {
    it(`cluster ${c}: every answer is explained once, and nothing is left over`, () => {
      const defs = DEFS[c];
      const problems: string[] = [];
      for (const q of BANK[c]) {
        const forPrompt = defs[q.id];
        if (!forPrompt) {
          problems.push(`${q.id}: no definitions for this prompt`);
          continue;
        }
        const answers = new Set(q.a.map((row) => row[0]));
        for (const answer of answers) {
          const text = forPrompt[answer];
          if (typeof text !== "string" || !text.trim()) problems.push(`${q.id}: no definition for "${answer}"`);
          else {
            if (text.length < MIN_LENGTH) problems.push(`${q.id}: definition of "${answer}" is too short`);
            if (text.length > MAX_LENGTH) problems.push(`${q.id}: definition of "${answer}" is over ${MAX_LENGTH} characters (${text.length})`);
            if (text !== text.trim() || /\s{2,}/.test(text)) problems.push(`${q.id}: definition of "${answer}" has stray spaces`);
            if (!/[.!?)]$/.test(text)) problems.push(`${q.id}: definition of "${answer}" does not end with a full stop`);
            if (norm(text) === norm(answer)) problems.push(`${q.id}: definition of "${answer}" only repeats the answer`);
          }
        }
        for (const key of Object.keys(forPrompt)) if (!answers.has(key)) problems.push(`${q.id}: definition for "${key}", which is not an answer on the board`);
      }
      const ids = new Set(BANK[c].map((q) => q.id));
      for (const id of Object.keys(defs)) if (!ids.has(id)) problems.push(`${id}: definitions for a prompt that is not in the ${c} bank`);
      expect(problems.slice(0, 40)).toEqual([]);
    });
  }
});
