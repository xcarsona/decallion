/* The training log: every finished round, newest first, kept in this browser's storage (latest 500 rounds).
   Rounds store prompt ids, not whole prompts; the log page looks them up in the bank.
   Totals, bests and streaks are NOT worked out from this list. They come from lib/stats, which also counts rounds
   that are older than the 500 kept here or were played before the log existed. */
import { MAX_ANSWER_LENGTH, dayIso, dayKey, match, utcDayKey } from "@/lib/game-engine";
import { CLUSTER_CHOICES, CLUSTER_IDS, clusterInfo, isClusterChoice } from "@/lib/questions";
import { LEVELS } from "@/lib/scoring";
import { bestOf, dailyOf, liveStreak, totalsOf, type Stats } from "@/lib/stats";
import type { AnswerRow, ClusterChoice, ClusterId, Level, LogEntry, Mode, Question } from "@/types";

export interface LoggedEntry {
  /** Prompt id. */
  id: string;
  typed: string;
  level: Level | -1;
  pts: number;
  timedOut: boolean;
}
export interface LoggedRound {
  id: string;
  /** When the round finished, ISO date-time (UTC). */
  at: string;
  /** The date (Eastern Time) when the round started, as a day key such as 20261117. */
  day: number;
  /** The cluster the player chose, which may be "all". */
  cluster: ClusterChoice;
  mode: Mode;
  score: number;
  /** False for a replayed daily round, which does not change stats, bests or streaks. */
  counted: boolean;
  entries: LoggedEntry[];
}

export const LOG_KEY = "decallion-log-v1";
export const LOG_CAP = 500;
export const MODES: Mode[] = ["daily", "unlimited", "practice"];
export const MODE_LABEL: Record<Mode, string> = { daily: "Daily", unlimited: "Unlimited", practice: "Practice" };
export const NO_CREDIT = "No credit";

/* ---------- building and adding rounds (pure) ---------- */

export function makeRound(input: { at: Date; day: number; cluster: ClusterChoice; mode: Mode; score: number; counted: boolean; log: LogEntry[]; id?: string }): LoggedRound {
  return {
    id: input.id ?? `${input.at.getTime().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
    at: input.at.toISOString(),
    day: input.day,
    cluster: input.cluster,
    mode: input.mode,
    score: input.score,
    counted: input.counted,
    entries: input.log.map((l) => ({ id: l.question.id, typed: l.typed.slice(0, MAX_ANSWER_LENGTH), level: l.level, pts: l.pts, timedOut: l.timedOut })),
  };
}

/** Puts a round at the front and drops the oldest rounds past the cap. */
export function addRound(log: LoggedRound[], round: LoggedRound, cap: number = LOG_CAP): LoggedRound[] {
  return [round, ...log].slice(0, cap);
}

const isObject = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v);
const num = (v: unknown) => (typeof v === "number" && Number.isFinite(v) ? v : 0);
/** True for a day key that names a real date, such as 20261117. */
function isDayKey(v: unknown): v is number {
  if (typeof v !== "number" || !Number.isInteger(v) || v < 20000101 || v > 29991231) return false;
  return utcDayKey(new Date(Date.UTC(Math.floor(v / 10000), (Math.floor(v / 100) % 100) - 1, v % 100))) === v;
}

/** Reads whatever was saved and keeps only well-formed rounds. */
export function sanitize(raw: unknown): LoggedRound[] {
  if (!Array.isArray(raw)) return [];
  const out: LoggedRound[] = [];
  for (const r of raw) {
    if (!isObject(r) || typeof r.id !== "string" || typeof r.at !== "string" || Number.isNaN(Date.parse(r.at))) continue;
    if (!isClusterChoice(r.cluster) || !MODES.includes(r.mode as Mode) || !Array.isArray(r.entries)) continue;
    const entries: LoggedEntry[] = [];
    for (const e of r.entries) {
      if (!isObject(e) || typeof e.id !== "string") continue;
      const level = num(e.level);
      entries.push({
        id: e.id,
        typed: typeof e.typed === "string" ? e.typed.slice(0, MAX_ANSWER_LENGTH) : "",
        level: (Number.isInteger(level) && level >= 1 && level <= 6 ? level : -1) as Level | -1,
        pts: num(e.pts),
        timedOut: e.timedOut === true,
      });
    }
    // a missing or damaged day falls back to the day the round finished
    const day = isDayKey(r.day) ? r.day : dayKey(new Date(r.at));
    out.push({ id: r.id, at: r.at, day, cluster: r.cluster, mode: r.mode as Mode, score: num(r.score), counted: r.counted !== false, entries });
  }
  return out.slice(0, LOG_CAP);
}

/* ---------- storage ---------- */

/* `persistent` is false while storage cannot be read or the last save did not reach it. Until a save works again,
   the copy in memory is the newest one and is what loadLog() returns. */
let persistent = true;
let memory: LoggedRound[] | null = null;
export const isLogPersistent = () => persistent;

/** The saved log, read fresh from storage every time (another tab may have changed it). */
export function loadLog(): LoggedRound[] {
  if (!persistent && memory) return memory;
  let raw: string | null;
  try {
    raw = localStorage.getItem(LOG_KEY);
  } catch {
    persistent = false;
    return memory ?? [];
  }
  if (!raw) return [];
  try {
    return sanitize(JSON.parse(raw));
  } catch {
    return []; // a damaged save is not a storage problem: the next round saved replaces it
  }
}
function saveLog(log: LoggedRound[]) {
  memory = log;
  try {
    localStorage.setItem(LOG_KEY, JSON.stringify(log));
    persistent = true;
  } catch {
    persistent = false;
  }
  changed();
}

/* A store React can subscribe to (useSyncExternalStore). */
let cached: LoggedRound[] | null = null;
let watching = false;
const listeners = new Set<() => void>();
function changed() {
  cached = null;
  listeners.forEach((fn) => fn());
}
/** The saved log. Returns the same array until it changes in this tab or in another one. */
export function logSnapshot(): LoggedRound[] {
  return (cached ??= loadLog());
}
export function subscribeLog(fn: () => void): () => void {
  if (!watching && typeof window !== "undefined") {
    watching = true;
    // fires when another tab saves or clears; `key` is null when all storage is cleared
    window.addEventListener("storage", (e) => {
      if (e.key === null || e.key === LOG_KEY) changed();
    });
  }
  listeners.add(fn);
  return () => void listeners.delete(fn);
}
/** Adds a finished round to the stored log and returns the new log. */
export function appendRound(round: LoggedRound): LoggedRound[] {
  const log = addRound(loadLog(), round);
  saveLog(log);
  return log;
}
export function clearLog(): LoggedRound[] {
  saveLog([]);
  return [];
}

/* ---------- filters ---------- */

export interface LogFilter {
  cluster: ClusterChoice | "any";
  mode: Mode | "any";
}
/** `cluster` is the cluster the player chose for the round, so "all" means mixed rounds only. */
export function filterRounds(log: LoggedRound[], filter: LogFilter): LoggedRound[] {
  return log.filter((r) => (filter.cluster === "any" || r.cluster === filter.cluster) && (filter.mode === "any" || r.mode === filter.mode));
}

/* ---------- summaries (from the aggregate stats) ---------- */

const average = (pts: number, n: number) => (n > 0 ? Math.round(pts / n) : 0);

export interface Overall {
  rounds: number;
  prompts: number;
  /** Average points per prompt, rounded. */
  avg: number;
  glass: number;
}
export function overall(stats: Stats): Overall {
  return { rounds: stats.games, prompts: stats.prompts, avg: average(stats.pts, stats.prompts), glass: stats.levels[6] || 0 };
}

export interface ClusterSummary {
  cluster: ClusterChoice;
  rounds: number;
  prompts: number;
  pts: number;
  avg: number;
  /** Current daily streak: 0 unless the last counted daily round was today or yesterday. */
  streak: number;
  bestStreak: number;
  /** Best score per mode, in points. */
  best: Record<Mode, number>;
}
/** One row per cluster choice, in picker order with "all" last. */
export function clusterSummaries(stats: Stats, today: number, yesterday: number): ClusterSummary[] {
  return CLUSTER_CHOICES.map((cluster) => {
    const t = totalsOf(stats, cluster);
    return {
      cluster,
      rounds: t.games,
      prompts: t.prompts,
      pts: t.pts,
      avg: average(t.pts, t.prompts),
      streak: liveStreak(stats, cluster, today, yesterday),
      bestStreak: dailyOf(stats, cluster).bestStreak,
      best: { daily: bestOf(stats, cluster, "daily"), practice: bestOf(stats, cluster, "practice"), unlimited: bestOf(stats, cluster, "unlimited") },
    };
  });
}

export interface TopicSummary {
  /** The prompt's own cluster. */
  cluster: ClusterId;
  topic: string;
  prompts: number;
  pts: number;
  avg: number;
  glass: number;
}
/** Topics the player has answered, weakest first (lowest average points per prompt). */
export function topicBreakdown(stats: Stats, cluster: ClusterChoice = "all"): TopicSummary[] {
  const rows: TopicSummary[] = [];
  for (const [key, v] of Object.entries(stats.topics)) {
    const cut = key.indexOf("|");
    const c = key.slice(0, cut) as ClusterId;
    if (cut < 0 || !CLUSTER_IDS.includes(c) || !v || !(v.n > 0)) continue;
    if (cluster !== "all" && c !== cluster) continue;
    rows.push({ cluster: c, topic: key.slice(cut + 1), prompts: v.n, pts: v.pts || 0, avg: average(v.pts || 0, v.n), glass: v.glass || 0 });
  }
  // compare the exact averages (a.pts / a.prompts < b.pts / b.prompts) without dividing
  return rows.sort((a, b) => a.pts * b.prompts - b.pts * a.prompts || b.prompts - a.prompts || a.topic.localeCompare(b.topic));
}

/** Rounds counted in the totals that are not in the stored list: played before the log existed, or trimmed. */
export function roundsNotListed(stats: Stats, log: LoggedRound[]): number {
  return Math.max(0, stats.games - log.filter((r) => r.counted).length);
}

/* ---------- looking prompts up ---------- */

export function questionIndex(questions: Question[]): Map<string, Question> {
  return new Map(questions.map((q) => [q.id, q]));
}
/** The board row a logged answer matched, or null for no credit or a prompt that has since changed. */
export function matchedRow(question: Question | undefined, entry: LoggedEntry): AnswerRow | null {
  return question && entry.level !== -1 ? match(question, entry.typed) : null;
}
export function levelName(level: Level | -1): string {
  return level === -1 ? NO_CREDIT : LEVELS[level].name;
}

/* ---------- CSV ---------- */

export const CSV_HEADER = [
  "round id", "date-time (UTC)", "day", "cluster", "mode", "counted", "round score", "round altitude ft",
  "prompt number", "prompt id", "topic", "prompt", "typed", "matched answer", "level", "points", "timed out",
];

/** One CSV field. Text that a spreadsheet would run as a formula gets a leading single quote. */
export function csvCell(value: string | number): string {
  if (typeof value === "number") return String(value);
  const safe = /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
  return /[",\r\n]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
}

/** The whole log, one line per answered prompt, newest round first. */
export function toCsv(log: LoggedRound[], questions: Question[]): string {
  const byId = questionIndex(questions);
  const lines = [CSV_HEADER.map(csvCell).join(",")];
  for (const r of log) {
    r.entries.forEach((e, i) => {
      const q = byId.get(e.id);
      const row = matchedRow(q, e);
      lines.push([
        r.id, r.at, dayIso(r.day), clusterInfo(r.cluster).short, MODE_LABEL[r.mode], r.counted ? "yes" : "no", r.score, r.score * 10,
        i + 1, e.id, q?.topic ?? "", q?.q ?? "", e.typed, row ? row[0] : "", levelName(e.level), e.pts, e.timedOut ? "yes" : "no",
      ].map(csvCell).join(","));
    });
  }
  return lines.join("\r\n") + "\r\n";
}
