/* Player statistics, kept in this browser's storage. Falls back to memory for the session if storage is blocked. */
import type { Mode } from "@/types";

export interface Stats {
  games: number;
  prompts: number;
  pts: number;
  levels: Record<string, number>;
  cats: Record<string, { n: number; pts: number; glass: number }>;
  best: Record<Mode, number>;
  daily: { last: number; streak: number; bestStreak: number; score: number };
}
export interface RoundResult {
  mode: Mode;
  score: number;
  dayKey: number;
  prevDayKey: number;
  log: { cat: string; level: number; pts: number }[];
}
export interface RecordOutcome {
  newBest: boolean;
  previousBest: number;
  streak: number;
}

const KEY = "decallion-stats-v2";

export function blank(): Stats {
  return {
    games: 0,
    prompts: 0,
    pts: 0,
    levels: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, miss: 0 },
    cats: {},
    best: { daily: 0, practice: 0, endless: 0 },
    daily: { last: 0, streak: 0, bestStreak: 0, score: 0 },
  };
}

let persistent = true;
export const isPersistent = () => persistent;

export function load(): Stats {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? { ...blank(), ...JSON.parse(raw) } : blank();
  } catch {
    persistent = false;
    return blank();
  }
}
function save(stats: Stats) {
  try {
    localStorage.setItem(KEY, JSON.stringify(stats));
  } catch {
    persistent = false;
  }
}

/** Adds a finished round to the stats. Pure: returns the new stats and what changed. */
export function apply(prev: Stats, result: RoundResult): { stats: Stats; outcome: RecordOutcome } {
  const s: Stats = JSON.parse(JSON.stringify(prev));
  const outcome: RecordOutcome = { newBest: false, previousBest: s.best[result.mode] || 0, streak: s.daily.streak };
  s.games++;
  for (const l of result.log) {
    s.prompts++;
    s.pts += l.pts;
    const key = l.level < 0 ? "miss" : String(l.level);
    s.levels[key] = (s.levels[key] || 0) + 1;
    const c = s.cats[l.cat] || (s.cats[l.cat] = { n: 0, pts: 0, glass: 0 });
    c.n++;
    c.pts += l.pts;
    if (l.level === 6) c.glass++;
  }
  if (result.score > outcome.previousBest) {
    s.best[result.mode] = result.score;
    outcome.newBest = true;
  }
  if (result.mode === "daily") {
    s.daily.streak = s.daily.last === result.prevDayKey ? s.daily.streak + 1 : 1;
    s.daily.last = result.dayKey;
    s.daily.score = result.score;
    s.daily.bestStreak = Math.max(s.daily.bestStreak, s.daily.streak);
    outcome.streak = s.daily.streak;
  }
  return { stats: s, outcome };
}

export function record(prev: Stats, result: RoundResult) {
  const out = apply(prev, result);
  save(out.stats);
  return out;
}
export function reset(): Stats {
  const s = blank();
  save(s);
  return s;
}
/** A streak only counts if the last daily round was today or yesterday. */
export function liveStreak(stats: Stats, today: number, yesterday: number): number {
  return stats.daily.last === today || stats.daily.last === yesterday ? stats.daily.streak : 0;
}
