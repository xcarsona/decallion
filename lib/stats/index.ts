/* Player statistics, kept in this browser's storage. Falls back to memory for the session if storage is blocked.
   Totals, bests and daily streaks are tracked per cluster choice ("all" is the mixed round). These totals are the
   source of truth for the training log page: they include rounds older than the ones lib/log keeps. */
import { dayKey } from "@/lib/game-engine";
import { LEGACY_CATEGORY_CLUSTER } from "@/lib/questions/clusters";
import type { ClusterChoice, ClusterId, Mode } from "@/types";

export interface DailyState {
  /** Day key of the last counted daily round, 0 if none. */
  last: number;
  streak: number;
  bestStreak: number;
  /** Score of the last counted daily round. */
  score: number;
  /** Day key of the last daily round in which an answer was given, finished or not. A round that is started and
      abandoned (Home, reload) still uses up the day's counted run. */
  started?: number;
}
export interface ClusterTotals {
  games: number;
  prompts: number;
  pts: number;
}
export interface Stats {
  games: number;
  prompts: number;
  pts: number;
  levels: Record<string, number>;
  /** Per topic, keyed "cluster|topic". */
  topics: Record<string, { n: number; pts: number; glass: number }>;
  /** Totals keyed by the cluster the player chose for the round, including "all". */
  clusters: Record<string, ClusterTotals>;
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
const NO_TOTALS: ClusterTotals = { games: 0, prompts: 0, pts: 0 };

export function blank(): Stats {
  return { games: 0, prompts: 0, pts: 0, levels: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, miss: 0 }, topics: {}, clusters: {}, best: {}, daily: {} };
}

export const bestKey = (cluster: ClusterChoice, mode: Mode) => `${cluster}:${mode}`;
export const topicKey = (cluster: ClusterId, topic: string) => `${cluster}|${topic}`;
export function bestOf(stats: Stats, cluster: ClusterChoice, mode: Mode): number {
  return stats.best[bestKey(cluster, mode)] || 0;
}
export function dailyOf(stats: Stats, cluster: ClusterChoice): DailyState {
  return stats.daily[cluster] ?? NO_DAILY;
}

export function totalsOf(stats: Stats, cluster: ClusterChoice): ClusterTotals {
  return stats.clusters[cluster] ?? NO_TOTALS;
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
/** Carries pre-cluster stats over: the old totals, daily round and bests become the "All clusters" ones, and each
    old category becomes a topic inside its cluster. */
export function migrate(old: OldStats): Stats {
  const s = blank();
  s.games = old.games || 0;
  s.prompts = old.prompts || 0;
  s.pts = old.pts || 0;
  s.levels = { ...s.levels, ...old.levels };
  if (s.games || s.prompts) s.clusters.all = { games: s.games, prompts: s.prompts, pts: s.pts };
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

const isObject = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v);
const count = (v: unknown) => (typeof v === "number" && Number.isFinite(v) && v > 0 ? v : 0);
/** Fills in anything missing from saved v3 stats. Stats saved before per-cluster totals existed cannot be split
    by cluster, so their totals go to "All clusters", the same as migrated v2 totals. */
export function normalize(raw: unknown): Stats {
  const s = blank();
  if (!isObject(raw)) return s;
  s.games = count(raw.games);
  s.prompts = count(raw.prompts);
  s.pts = count(raw.pts);
  // every field is rebuilt from numbers only: a value of the wrong type in storage must not reach the page, where
  // it would throw while rendering or while the next round is added
  if (isObject(raw.levels)) for (const [k, v] of Object.entries(raw.levels)) s.levels[k] = count(v);
  if (isObject(raw.topics)) {
    for (const [k, v] of Object.entries(raw.topics)) if (isObject(v)) s.topics[k] = { n: count(v.n), pts: count(v.pts), glass: count(v.glass) };
  }
  if (isObject(raw.best)) for (const [k, v] of Object.entries(raw.best)) s.best[k] = count(v);
  if (isObject(raw.daily)) {
    for (const [k, v] of Object.entries(raw.daily)) {
      if (isObject(v)) {
        s.daily[k] = { last: count(v.last), streak: count(v.streak), bestStreak: count(v.bestStreak), score: count(v.score) };
        if (count(v.started)) s.daily[k].started = count(v.started);
      }
    }
  }
  if (isObject(raw.clusters)) {
    for (const [k, v] of Object.entries(raw.clusters)) {
      if (isObject(v)) s.clusters[k] = { games: count(v.games), prompts: count(v.prompts), pts: count(v.pts) };
    }
  } else if (s.games || s.prompts) {
    s.clusters.all = { games: s.games, prompts: s.prompts, pts: s.pts };
  }
  return s;
}

/* `persistent` is false while storage cannot be read or the last save did not reach it. Until a save works again,
   the copy in memory is the newest one and is what load() returns. */
let persistent = true;
let memory: Stats | null = null;
export const isPersistent = () => persistent;

/** Reads saved text. A damaged save is not a storage problem: it reads as blank and the next save replaces it. */
export function parseSaved(raw: string | null, old: string | null): Stats {
  try {
    if (raw) return normalize(JSON.parse(raw));
    if (old) {
      const v2: unknown = JSON.parse(old);
      if (isObject(v2)) return migrate(v2 as OldStats);
    }
  } catch { /* damaged save */ }
  return blank();
}

/** The saved stats, read fresh from storage every time (another tab or the log page may have changed them). */
export function load(): Stats {
  if (!persistent && memory) return normalize(memory);
  let raw: string | null;
  let old: string | null;
  try {
    raw = localStorage.getItem(KEY);
    old = raw ? null : localStorage.getItem(OLD_KEY);
  } catch {
    persistent = false;
    return memory ? normalize(memory) : blank();
  }
  return parseSaved(raw, old);
}
function save(stats: Stats) {
  memory = stats;
  try {
    localStorage.setItem(KEY, JSON.stringify(stats));
    persistent = true;
  } catch {
    persistent = false;
  }
  changed();
}

/* ---------- a store React can subscribe to (useSyncExternalStore) ---------- */

let cached: Stats | null = null;
let watching = false;
const listeners = new Set<() => void>();
function changed() {
  cached = null;
  listeners.forEach((fn) => fn());
}
/** The saved stats. Returns the same object until they change in this tab or in another one. */
export function snapshot(): Stats {
  return (cached ??= load());
}
export function subscribe(fn: () => void): () => void {
  if (!watching && typeof window !== "undefined") {
    watching = true;
    // fires when another tab saves or clears; `key` is null when all storage is cleared
    window.addEventListener("storage", (e) => {
      if (e.key === null || e.key === KEY || e.key === OLD_KEY) changed();
    });
  }
  listeners.add(fn);
  return () => void listeners.delete(fn);
}

/** Whether a round finishing now changes stats, bests and streaks. Only the first daily round of a day does, and
    only if no later day's round has been counted since: a round left open in another tab and finished a day or two
    late must not wind the streak back or let the later day's round count twice. A saved day that is in the future
    (a device clock that was wrong) is ignored, so it cannot block the player. */
export function countsNow(stats: Stats, mode: Mode, cluster: ClusterChoice, day: number, today: number = dayKey(), ownRound = false): boolean {
  if (mode !== "daily") return true;
  const { last, started } = dailyOf(stats, cluster);
  if (last === day) return false;
  // `ownRound` is true when the round asking is the one that marked the day as started
  if (!ownRound && started === day) return false;
  return !(last > day && last <= today);
}

/** Notes that the daily round for this day has had an answer given. From then on a fresh start that day does not
    count: only the first run does, whether or not it is finished. */
export function markDailyStarted(cluster: ClusterChoice, day: number): void {
  const stats = load();
  const daily = dailyOf(stats, cluster);
  if (daily.started === day) return;
  save({ ...stats, daily: { ...stats.daily, [cluster]: { ...daily, started: day } } });
}

/** Adds a finished round to the stats. Pure: returns the new stats and what changed. */
export function apply(prev: Stats, result: RoundResult): { stats: Stats; outcome: RecordOutcome } {
  const s: Stats = JSON.parse(JSON.stringify(prev));
  const key = bestKey(result.cluster, result.mode);
  const daily: DailyState = { ...dailyOf(s, result.cluster) };
  const outcome: RecordOutcome = { newBest: false, previousBest: s.best[key] || 0, streak: daily.streak };
  s.games++;
  const totals = (s.clusters[result.cluster] = { ...totalsOf(s, result.cluster) });
  totals.games++;
  for (const l of result.log) {
    s.prompts++;
    s.pts += l.pts;
    totals.prompts++;
    totals.pts += l.pts;
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
    // A saved day later than this round can only come from a wrong clock or an older way of naming the day. The
    // streak is kept then, not broken.
    daily.streak = daily.last === result.prevDayKey ? daily.streak + 1 : daily.last > result.dayKey ? Math.max(1, daily.streak) : 1;
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
