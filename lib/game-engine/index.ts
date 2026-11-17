/* Pure game rules: answer matching, round building, the shared daily seed, and data checks. No DOM access, so the
   server scores a round with exactly the same code the browser plays it with. */
import type { AnswerRow, Mode, Question } from "@/types";
import { LEVELS, pointsFor } from "@/lib/scoring";

export const SECONDS = 25;
export const ROUND_SIZE = 7;
export const STRIKES = 3;
export const DIFFS: Record<number, string> = { 1: "Easy", 2: "Medium", 3: "Hard" };

export function norm(s: string): string {
  return String(s)
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9 ]/g, " ")
    .replace(/\b(the|a|an)\b/g, " ")
    .replace(/\s+/g, "");
}

function lev(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  if (Math.abs(m - n) > 2) return 9;
  let prev = Array.from({ length: n + 1 }, (_, i) => i);
  for (let i = 1; i <= m; i++) {
    const cur = [i];
    for (let j = 1; j <= n; j++) {
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
    prev = cur;
  }
  return prev[n];
}

/** Returns the matching answer row or null. Exact and plural-insensitive matches win; otherwise one typo is
    forgiven in answers of 5+ letters and two in answers of 8+. */
export function match(question: Question, input: string): AnswerRow | null {
  const x = norm(input);
  if (!x) return null;
  const xs = x.replace(/s$/, "");
  let best: AnswerRow | null = null;
  let bestDistance = 9;
  for (const row of question.a) {
    for (const alias of [row[0], ...row.slice(2)] as string[]) {
      const y = norm(alias);
      const ys = y.replace(/s$/, "");
      if (x === y || xs === ys) return row;
      const tolerance = y.length >= 8 ? 2 : y.length >= 5 ? 1 : 0;
      const d = lev(x, y);
      if (d <= tolerance && d < bestDistance) {
        bestDistance = d;
        best = row;
      }
    }
  }
  return best;
}

/** Small seeded generator (mulberry32) so a seed always gives the same round. */
export function rng(seed: number): () => number {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function shuffle<T>(list: T[], rand: () => number): T[] {
  const a = list.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* The daily round is keyed to the UTC date so every player in the world gets the same seven prompts. */
export function dayKey(d: Date = new Date()): number {
  return d.getUTCFullYear() * 10000 + (d.getUTCMonth() + 1) * 100 + d.getUTCDate();
}
function keyToDate(key: number): Date {
  return new Date(Date.UTC(Math.floor(key / 10000), (Math.floor(key / 100) % 100) - 1, key % 100));
}
export function prevDayKey(key: number): number {
  const d = keyToDate(key);
  d.setUTCDate(d.getUTCDate() - 1);
  return dayKey(d);
}
/** 20261117 -> "2026-11-17" */
export function dayIso(key: number): string {
  return keyToDate(key).toISOString().slice(0, 10);
}
export function msUntilNextDay(now: Date = new Date()): number {
  return Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1) - now.getTime();
}

export interface RoundOptions {
  mode: Mode;
  cats?: string[];
  diff?: number;
  /** Day key for the daily round. Defaults to today (UTC). */
  seed?: number;
  rand?: () => number;
}

export function pool(questions: Question[], opts: { cats?: string[]; diff?: number } = {}): Question[] {
  return questions.filter((q) => (!opts.cats || opts.cats.includes(q.cat)) && (!opts.diff || q.diff === opts.diff));
}

/** Takes n prompts, preferring categories not yet used so a round is varied. */
function spread(list: Question[], n: number): Question[] {
  const out: Question[] = [];
  const seen = new Set<string>();
  for (const q of list) {
    if (out.length >= n) break;
    if (!seen.has(q.cat)) {
      seen.add(q.cat);
      out.push(q);
    }
  }
  for (const q of list) {
    if (out.length >= n) break;
    if (!out.includes(q)) out.push(q);
  }
  return out;
}

export function buildRound(questions: Question[], opts: RoundOptions): Question[] {
  const rand = opts.rand ?? Math.random;
  if (opts.mode === "daily") return spread(shuffle(questions, rng(opts.seed ?? dayKey())), ROUND_SIZE);
  if (opts.mode === "endless") return shuffle(questions, rand);
  return spread(shuffle(pool(questions, opts), rand), ROUND_SIZE);
}

/** Scores typed answers against a round. Used by the server so a submitted score cannot be made up. */
export function scoreAnswers(round: Question[], answers: string[]): { score: number; levels: number[] } {
  const levels = round.map((q, i) => {
    const row = match(q, answers[i] ?? "");
    return row ? row[1] : 0;
  });
  const score = round.reduce((sum, q, i) => sum + pointsFor(match(q, answers[i] ?? "")), 0);
  return { score, levels };
}

/** Data checks, run in tests, so a bad edit to the bank is reported instead of silently breaking a prompt. */
export function validate(questions: Question[], categories?: string[]): string[] {
  const out: string[] = [];
  const ids = new Set<string>();
  for (const q of questions) {
    if (!q.id || ids.has(q.id)) out.push(`duplicate or missing id: ${q.id}`);
    ids.add(q.id);
    if (categories && !categories.includes(q.cat)) out.push(`${q.id}: unknown category ${q.cat}`);
    if (!q.q || !q.why || !q.area || !DIFFS[q.diff]) out.push(`${q.id}: missing q, why, area or diff`);
    if (!q.a || q.a.length < 4) out.push(`${q.id}: needs at least 4 answers`);
    const seen = new Map<string, string>();
    let glass = false;
    for (const row of q.a ?? []) {
      if (!LEVELS[row[1]]) out.push(`${q.id}: bad level on ${row[0]}`);
      if (row[1] === 6) glass = true;
      for (const alias of [row[0], ...row.slice(2)] as string[]) {
        const key = norm(alias).replace(/s$/, "");
        const owner = seen.get(key);
        if (owner && owner !== row[0]) out.push(`${q.id}: "${alias}" matches both ${owner} and ${row[0]}`);
        seen.set(key, row[0]);
      }
    }
    if (!glass) out.push(`${q.id}: no DECA Glass answer`);
  }
  return out;
}
