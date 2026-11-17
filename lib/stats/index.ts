/* Player statistics, kept in this browser's storage. Falls back to memory for the session if storage is blocked.
   Bests and daily streaks are tracked per cluster choice ("all" is the mixed round). */
import { LEGACY_CATEGORY_CLUSTER } from "@/lib/questions/clusters";
import type { ClusterChoice, ClusterId, Mode } from "@/types";

export interface DailyState {
  /** Day key of the last counted daily round, 0 if none. */
  last: number;
  streak: number;
  bestStreak: number;
  /** Score of the last counted daily round. */
  score: number;
}
export interface Stats {
  games: number;
  prompts: number;
  pts: number;
  levels: Record<string, number>;
  /** Per topic, keyed "cluster|topic". */
  topics: Record<string, { n: number; pts: number; glass: number }>;
  /** Best score, keyed "cluster:mode". */
  best: Record<string, number>;
  /** Daily round state, keyed by cluster choice. */
  daily: Record<string, DailyState>;
}
export interface RoundResult {
  mode: Mode;
  cluster: ClusterChoice;
  score: number;
  dayKey: number;
  prevDayKey: number;
  log: { cluster: ClusterId; topic: string; level: number; pts: number }[];
}
export interface RecordOutcome {
  newBest: boolean;
  previousBest: number;
  streak: number;
}

const KEY = "decallion-stats-v3";
const OLD_KEY = "decallion-stats-v2";
const NO_DAILY: DailyState = { last: 0, streak: 0, bestStreak: 0, score: 0 };

export function blank(): Stats {
  return { games: 0, prompts: 0, pts: 0, levels: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, miss: 0 }, topics: {}, best: {}, daily: {} };
}

export const bestKey = (cluster: ClusterChoice, mode: Mode) => `${cluster}:${mode}`;
export const topicKey = (cluster: ClusterId, topic: string) => `${cluster}|${topic}`;
export function bestOf(stats: Stats, cluster: ClusterChoice, mode: Mode): number {
  return stats.best[bestKey(cluster, mode)] || 0;
}
export function dailyOf(stats: Stats, cluster: ClusterChoice): DailyState {
  return stats.daily[cluster] ?? NO_DAILY;
}

/** Stats saved before clusters existed (decallion-stats-v2). */
interface OldStats {
  games?: number;
  prompts?: number;
  pts?: number;
  levels?: Record<string, number>;
  cats?: Record<string, { n: number; pts: number; glass: number }>;
  best?: { daily?: number; practice?: number; endless?: number };
  daily?: Partial<DailyState>;
}
/** Carries pre-cluster stats over: the old daily round and bests become the "All clusters" ones, and each old
    category becomes a topic inside its cluster. */
export function migrate(old: OldStats): Stats {
  const s = blank();
  s.games = old.games || 0;
  s.prompts = old.prompts || 0;
  s.pts = old.pts || 0;
  s.levels = { ...s.levels, ...old.levels };
  for (const [cat, v] of Object.entries(old.cats ?? {})) {
    const cluster = LEGACY_CATEGORY_CLUSTER[cat];
    if (cluster) s.topics[topicKey(cluster, cat)] = { n: v.n || 0, pts: v.pts || 0, glass: v.glass || 0 };
  }
  if (old.best?.daily) s.best[bestKey("all", "daily")] = old.best.daily;
  if (old.best?.practice) s.best[bestKey("all", "practice")] = old.best.practice;
  if (old.best?.endless) s.best[bestKey("all", "unlimited")] = old.best.endless;
  if (old.daily?.last) s.daily.all = { ...NO_DAILY, ...old.daily };
  return s;
}

let persistent = true;
export const isPersistent = () => persistent;

export function load(): Stats {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return { ...blank(), ...JSON.parse(raw) };
    const old = localStorage.getItem(OLD_KEY);
    return old ? migrate(JSON.parse(old)) : blank();
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
  const key = bestKey(result.cluster, result.mode);
  const daily: DailyState = { ...dailyOf(s, result.cluster) };
  const outcome: RecordOutcome = { newBest: false, previousBest: s.best[key] || 0, streak: daily.streak };
  s.games++;
  for (const l of result.log) {
    s.prompts++;
    s.pts += l.pts;
    const level = l.level < 0 ? "miss" : String(l.level);
    s.levels[level] = (s.levels[level] || 0) + 1;
    const t = s.topics[topicKey(l.cluster, l.topic)] || (s.topics[topicKey(l.cluster, l.topic)] = { n: 0, pts: 0, glass: 0 });
    t.n++;
    t.pts += l.pts;
    if (l.level === 6) t.glass++;
  }
  if (result.score > outcome.previousBest) {
    s.best[key] = result.score;
    outcome.newBest = true;
  }
  if (result.mode === "daily") {
    daily.streak = daily.last === result.prevDayKey ? daily.streak + 1 : 1;
    daily.last = result.dayKey;
    daily.score = result.score;
    daily.bestStreak = Math.max(daily.bestStreak, daily.streak);
    s.daily[result.cluster] = daily;
    outcome.streak = daily.streak;
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
/** A streak only counts if the last daily round in that cluster was today or yesterday. */
export function liveStreak(stats: Stats, cluster: ClusterChoice, today: number, yesterday: number): number {
  const d = dailyOf(stats, cluster);
  return d.last === today || d.last === yesterday ? d.streak : 0;
}
