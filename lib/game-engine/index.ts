/* Pure game rules: answer matching, round building, the shared daily seed, and data checks. No DOM access, so the
   server scores a round with exactly the same code the browser plays it with. */
import type { AnswerRow, ClusterChoice, ClusterId, Mode, Question } from "@/types";
import { CLUSTER_IDS } from "@/lib/questions/clusters";
import { LEVELS, pointsFor } from "@/lib/scoring";

export const SECONDS = 25;
export const ROUND_SIZE = 7;
/** Longest typed answer that is kept. The answer box, the training log and the leaderboard all use it. */
export const MAX_ANSWER_LENGTH = 80;
export const STRIKES = 3;
export const DIFFS: Record<number, string> = { 1: "Easy", 2: "Medium", 3: "Hard" };

/** The words of an answer: lower case, punctuation removed, "the", "a" and "an" dropped. */
function words(s: string): string[] {
  return String(s)
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9 ]/g, " ")
    .replace(/\b(the|a|an)\b/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}
/** An answer with case, punctuation, spaces and small words removed: "The Four P's" becomes "fourps". */
export function norm(s: string): string {
  return words(s).join("");
}
/** A looser form of an answer, for comparing: joining words are dropped, each word loses its plural ending, and the
    words are put in alphabetical order. So word order, plurals and "and"/"of" do not matter:
    "pricing, penetration" and "penetration pricing" give the same key. */
export function looseKey(s: string): string {
  return words(s)
    .filter((w) => !LINK_WORDS.has(w))
    .map(singular)
    .sort()
    .join("");
}
const LINK_WORDS = new Set(["and", "of", "for", "to", "in", "on", "or"]);
/** A word without its plural ending, for comparing only: "libraries" and "library" both give "library", "bonuses"
    and "bonus" both give "bonu". The result need not be a real word, only the same for singular and plural. */
function singular(word: string): string {
  let w = word;
  for (let i = 0; i < 2 && w.length > 3; i++) {
    if (/ies$/.test(w)) w = w.slice(0, -3) + "y";
    else if (/(s|x|z|ch|sh)es$/.test(w)) w = w.slice(0, -2);
    else if (/s$/.test(w) && !/ss$/.test(w)) w = w.slice(0, -1);
    else break;
  }
  return w;
}

/** Typing mistakes between two strings: a missing, extra or wrong letter, or two neighbouring letters swapped, each
    count as one. Returns 9 when the lengths differ by more than could be forgiven. */
function typos(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  if (Math.abs(m - n) > 3) return 9;
  let before: number[] = [];
  let prev = Array.from({ length: n + 1 }, (_, i) => i);
  for (let i = 1; i <= m; i++) {
    const cur = [i];
    for (let j = 1; j <= n; j++) {
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) cur[j] = Math.min(cur[j], before[j - 2] + 1);
    }
    before = prev;
    prev = cur;
  }
  return prev[n];
}
/** How many typing mistakes are forgiven in an answer of this many letters. Short answers get none, because one
    changed letter in a short word is usually a different word. */
export function typosAllowed(length: number): number {
  return length >= 13 ? 3 : length >= 8 ? 2 : length >= 5 ? 1 : 0;
}

/** Returns the matching answer row or null. An exact match wins, then a match that ignores word order, plurals and
    joining words. Otherwise typing mistakes are forgiven: one in answers of 5+ letters, two in 8+, three in 13+.
    Two neighbouring letters swapped count as one mistake. If a mistyped answer is equally close to two rows, the
    closest wins and a tie goes to the row listed first. */
export function match(question: Question, input: string): AnswerRow | null {
  const x = norm(input);
  if (!x) return null;
  const xs = x.replace(/s$/, "");
  const xl = looseKey(input);
  const aliases: { row: AnswerRow; y: string; yl: string }[] = [];
  for (const row of question.a) {
    for (const alias of [row[0], ...row.slice(2)] as string[]) aliases.push({ row, y: norm(alias), yl: looseKey(alias) });
  }
  for (const { row, y } of aliases) if (x === y || xs === y.replace(/s$/, "")) return row;
  if (xl) for (const { row, yl } of aliases) if (xl === yl) return row;
  let best: AnswerRow | null = null;
  let bestDistance = 9;
  for (const { row, y, yl } of aliases) {
    const d = Math.min(typos(x, y), xl && yl ? typos(xl, yl) : 9);
    if (d <= typosAllowed(y.length) && d < bestDistance) {
      bestDistance = d;
      best = row;
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

/* The daily round is keyed to a calendar date, written as a number such as 20261117. Each player gets the round for
   their own date, so it changes at their midnight, and everyone gets the same seven prompts for the same date. */
/** Today for the player: the calendar date on their own clock. */
export function dayKey(d: Date = new Date()): number {
  return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
}
/** The calendar date in UTC. The server uses this, because it does not know the player's time zone. */
export function utcDayKey(d: Date = new Date()): number {
  return d.getUTCFullYear() * 10000 + (d.getUTCMonth() + 1) * 100 + d.getUTCDate();
}
function keyToDate(key: number): Date {
  return new Date(Date.UTC(Math.floor(key / 10000), (Math.floor(key / 100) % 100) - 1, key % 100));
}
export function prevDayKey(key: number): number {
  const d = keyToDate(key);
  d.setUTCDate(d.getUTCDate() - 1);
  return utcDayKey(d);
}
export function nextDayKey(key: number): number {
  const d = keyToDate(key);
  d.setUTCDate(d.getUTCDate() + 1);
  return utcDayKey(d);
}
/** A player's date is never more than a day away from the UTC date, whatever their time zone. */
export function isPlayableDay(day: unknown, utcToday: number = utcDayKey()): day is number {
  return day === utcToday || day === prevDayKey(utcToday) || day === nextDayKey(utcToday);
}
/** 20261117 -> "2026-11-17" */
export function dayIso(key: number): string {
  return keyToDate(key).toISOString().slice(0, 10);
}
/** Time left until the player's next midnight, when their daily rounds change. */
export function msUntilNextDay(now: Date = new Date()): number {
  return new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).getTime() - now.getTime();
}

/** Whole days since 1 January 2026 for a day key. */
const EPOCH = Date.UTC(2026, 0, 1);
function dayIndex(key: number): number {
  return Math.round((keyToDate(key).getTime() - EPOCH) / 86400000);
}
/** FNV-1a string hash, used to turn "cluster + day" into a seed. */
function hash(text: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h | 0;
}
/** The seed for one cluster's daily round on one day. Different clusters get different rounds on the same day. */
export function dailySeed(day: number, cluster: ClusterChoice): number {
  return hash(`${cluster}:${day}`);
}

export interface RoundOptions {
  mode: Mode;
  /** The cluster the player chose. Defaults to "all". A single cluster always wins over `clusters`. */
  cluster?: ClusterChoice;
  /** Practice in All clusters only: the clusters the player ticked. */
  clusters?: ClusterId[];
  diff?: number;
  /** Day key for the daily round. Defaults to the player's today. */
  seed?: number;
  rand?: () => number;
}

/** A cluster needs this many prompts before its daily round opens, so three days in a row never share a prompt. */
export const DAILY_MIN = ROUND_SIZE * 3;

export function inCluster(questions: Question[], cluster: ClusterChoice = "all"): Question[] {
  return cluster === "all" ? questions : questions.filter((q) => q.cluster === cluster);
}
export function dailyEnabled(questions: Question[], cluster: ClusterChoice): boolean {
  return inCluster(questions, cluster).length >= DAILY_MIN;
}
export function countByCluster(questions: Question[]): Record<ClusterId, number> {
  const out = { bma: 0, ent: 0, fin: 0, ht: 0, mkt: 0 };
  for (const q of questions) if (q.cluster in out) out[q.cluster]++;
  return out;
}

export function pool(questions: Question[], opts: { cluster?: ClusterChoice; clusters?: ClusterId[]; diff?: number } = {}): Question[] {
  const single = opts.cluster && opts.cluster !== "all" ? opts.cluster : null;
  return questions.filter((q) => (single ? q.cluster === single : !opts.clusters || opts.clusters.includes(q.cluster)) && (!opts.diff || q.diff === opts.diff));
}

/** Takes n prompts, preferring groups not yet used so a round is varied: topics inside one cluster, clusters in a
    mixed round. */
function spread(list: Question[], n: number, group: (q: Question) => string): Question[] {
  const out: Question[] = [];
  const seen = new Set<string>();
  for (const q of list) {
    if (out.length >= n) break;
    if (!seen.has(group(q))) {
      seen.add(group(q));
      out.push(q);
    }
  }
  for (const q of list) {
    if (out.length >= n) break;
    if (!out.includes(q)) out.push(q);
  }
  return out;
}
const groupFor = (cluster: ClusterChoice) => (q: Question) => (cluster === "all" ? q.cluster : q.topic);

const dailyCache = new Map<string, Question[]>();

/** The daily round for one cluster (or the mixed round) on one day. Every player gets the same seven prompts.
    Each day is drawn from a shuffle seeded by the cluster and the day, skipping any prompt used on the two days
    before, so three days in a row never repeat. That makes a day depend on the days before it, so the rounds are
    worked out forward from 1 January 2026. Returns [] while the cluster has fewer than DAILY_MIN prompts. */
export function dailyRound(questions: Question[], cluster: ClusterChoice, day: number): Question[] {
  const list = inCluster(questions, cluster).slice().sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
  if (list.length < DAILY_MIN) return [];
  const cacheKey = `${cluster}:${day}:${list.length}:${hash(list.map((q) => q.id).join())}`;
  const cached = dailyCache.get(cacheKey);
  if (cached) return cached;
  const end = dayIndex(day);
  let round: Question[] = [];
  let recent: string[][] = [];
  for (let i = Math.min(0, end); i <= end; i++) {
    const key = utcDayKey(new Date(EPOCH + i * 86400000));
    const used = new Set(recent.flat());
    round = spread(shuffle(list, rng(dailySeed(key, cluster))).filter((q) => !used.has(q.id)), ROUND_SIZE, groupFor(cluster));
    recent = [...recent.slice(-1), round.map((q) => q.id)];
  }
  if (dailyCache.size > 64) dailyCache.clear();
  dailyCache.set(cacheKey, round);
  return round;
}

export function buildRound(questions: Question[], opts: RoundOptions): Question[] {
  const rand = opts.rand ?? Math.random;
  const cluster = opts.cluster ?? "all";
  if (opts.mode === "daily") return dailyRound(questions, cluster, opts.seed ?? dayKey());
  if (opts.mode === "unlimited") return shuffle(inCluster(questions, cluster), rand);
  return spread(shuffle(pool(questions, opts), rand), ROUND_SIZE, groupFor(cluster));
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

/** The fewest answers a prompt may have. Prompts with only a handful of possible answers do not suit the game. */
export const MIN_ANSWERS = 6;
/** Prompts from the original bank whose answers are a complete, closed set smaller than MIN_ANSWERS. */
const CLOSED_SETS = new Set(["PFL-02"]); // the five credit score factors

/** Data checks, run in tests, so a bad edit to the bank is reported instead of silently breaking a prompt. */
export function validate(questions: Question[]): string[] {
  const out: string[] = [];
  const ids = new Set<string>();
  const prompts = new Map<string, string>();
  for (const q of questions) {
    if (!q.id || ids.has(q.id)) out.push(`duplicate or missing id: ${q.id}`);
    ids.add(q.id);
    if (!CLUSTER_IDS.includes(q.cluster)) out.push(`${q.id}: unknown cluster ${q.cluster}`);
    if (!q.q || !q.why || !q.area || !q.topic || !DIFFS[q.diff]) out.push(`${q.id}: missing q, why, area, topic or diff`);
    const wording = norm(q.q ?? "");
    const twin = prompts.get(wording);
    if (twin) out.push(`${q.id}: same prompt wording as ${twin}`);
    prompts.set(wording, q.id);
    if (!q.a || (q.a.length < MIN_ANSWERS && !CLOSED_SETS.has(q.id)) || q.a.length < 4) out.push(`${q.id}: needs at least ${MIN_ANSWERS} answers`);
    const seen = new Map<string, string>();
    const levels = new Set<number>();
    for (const row of q.a ?? []) {
      if (!LEVELS[row[1]]) out.push(`${q.id}: bad level on ${row[0]}`);
      levels.add(row[1]);
      for (const alias of [row[0], ...row.slice(2)] as string[]) {
        const exact = norm(alias).replace(/s$/, "");
        if (!exact) out.push(`${q.id}: empty answer or alias on ${row[0]}`);
        // two rows may not accept the same typed text, whether matched exactly or with word order and plurals ignored
        for (const key of new Set([exact, "~" + looseKey(alias)])) {
          const owner = seen.get(key);
          if (owner && owner !== row[0]) out.push(`${q.id}: "${alias}" matches both ${owner} and ${row[0]}`);
          seen.set(key, row[0]);
        }
      }
    }
    if (!levels.has(6)) out.push(`${q.id}: no DECA Glass answer`);
    if (!levels.has(5)) out.push(`${q.id}: no ICDC answer`);
  }
  return out;
}
