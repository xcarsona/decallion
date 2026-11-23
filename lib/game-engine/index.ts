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
    // accents are dropped, so "café" and "résumé" (which a phone keyboard may type) match "cafe" and "resume"
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
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
/** How many typing mistakes are forgiven between two strings, judged by the SHORTER one: one mistake from 5 letters,
    two from 9. Short strings get none, because one changed letter in a short word is usually a different word
    ("fax" is not "tax"). Three or more are never forgiven, however long the answer: that many changes can add or drop
    a whole short word or prefix and reverse the meaning ("honest advertising" is not "dishonest advertising"). */
export function typosAllowed(a: number, b: number = a): number {
  const length = Math.min(a, b);
  return length >= 9 ? 2 : length >= 5 ? 1 : 0;
}

/** True when two strings of the same length differ in exactly one letter. */
function oneLetterChanged(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let changed = 0;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) changed++;
  return changed === 1;
}
/** How far apart two strings are for matching, or 9 if they are too far to forgive. In strings under seven letters
    one wrong letter is not forgiven, because it usually makes another real word ("patent" is not "parent", "stack"
    is not "stock"); a missing, extra or swapped letter still is. */
function slip(a: string, b: string): number {
  const d = typos(a, b);
  if (d > typosAllowed(a.length, b.length)) return 9;
  if (d === 1 && Math.min(a.length, b.length) < 7 && oneLetterChanged(a, b)) return 9;
  return d;
}

/* A typing slip must not turn one answer into a different or opposite one. These checks look at the words, not just
   the letters, and rule a near miss out as a slip when: */
/** prefixes that reverse or change a word's meaning: "imperfect" is not "perfect", "uncollectible" not "collectible" */
const CHANGING_PREFIXES = ["un", "in", "im", "il", "ir", "non", "dis", "de", "mis", "anti", "counter", "re", "pre", "post", "sub", "super", "over", "under", "out", "co"];
/** word parts that are opposites of each other: "maximize" is not "minimize", "microfinance" not "macrofinance" */
const OPPOSITES: [string, string][] = [["max", "min"], ["micro", "macro"], ["over", "under"], ["import", "export"], ["pre", "post"], ["increas", "decreas"], ["inter", "intra"], ["hyper", "hypo"], ["up", "down"], ["high", "low"], ["buy", "sell"], ["debit", "credit"], ["asset", "liabilit"], ["long", "short"], ["fixed", "variable"], ["direct", "indirect"], ["formal", "informal"], ["internal", "external"], ["tangible", "intangible"], ["public", "private"]];
const digitsOf = (s: string) => s.replace(/[^0-9]/g, "");

/** True when the typed words and an answer's words differ in a way that is a different answer, not a slip. */
function differentAnswer(typed: string[], answer: string[]): boolean {
  const a = typed.join("");
  const b = answer.join("");
  if (digitsOf(a) !== digitsOf(b)) return true; // "403k" is not "401k", "s&p 400" is not "s&p 500"
  for (const [p, q] of OPPOSITES) {
    if ((a.includes(p) && !b.includes(p) && b.includes(q) && !a.includes(q)) || (a.includes(q) && !b.includes(q) && b.includes(p) && !a.includes(p))) return true;
  }
  // the words each side has that the other does not
  const left = answer.slice();
  const onlyTyped: string[] = [];
  for (const w of typed) {
    const at = left.indexOf(w);
    if (at === -1) onlyTyped.push(w);
    else left.splice(at, 1);
  }
  // a one- or two-letter word is a whole word, never a slip: "theory b" is not "theory x", "c corp" is not "b corp"
  if ([...onlyTyped, ...left].some((w) => w.length <= 2)) return true;
  if (onlyTyped.length === 1 && left.length === 1) {
    const [s, t] = onlyTyped[0].length <= left[0].length ? [onlyTyped[0], left[0]] : [left[0], onlyTyped[0]];
    if (CHANGING_PREFIXES.some((p) => t === p + s)) return true;
  }
  // the same check when the words run together ("imperfectcompetition")
  const [s, t] = a.length <= b.length ? [a, b] : [b, a];
  return CHANGING_PREFIXES.some((p) => t === p + s);
}

export interface MatchResult {
  row: AnswerRow;
  /** False when the typed text is only close to the answer (a typing slip). The game then asks "Did you mean ...?"
      instead of taking it silently. */
  exact: boolean;
}

/** Finds the answer row for typed text, and says whether it was typed correctly. An exact match wins, then a match
    that ignores word order, plurals and joining words: both count as exact. Otherwise typing mistakes are forgiven:
    one when both the typed text and the answer have 5+ letters, two when both have 9+. Two neighbouring letters
    swapped count as one mistake; in words under seven letters a single wrong letter is not forgiven; and a change
    that makes a different answer (a number, a short word, a prefix such as un- or im-, max for min) is never a
    slip. If a mistyped answer is equally close to two rows, the closest wins and a tie goes to the row listed first. */
export function matchDetail(question: Question, input: string): MatchResult | null {
  const x = norm(input);
  if (!x) return null;
  const xs = x.replace(/s$/, "");
  const xl = looseKey(input);
  const xw = words(input);
  const aliases: { row: AnswerRow; text: string; y: string; yl: string }[] = [];
  for (const row of question.a) {
    for (const alias of [row[0], ...row.slice(2)] as string[]) aliases.push({ row, text: alias, y: norm(alias), yl: looseKey(alias) });
  }
  for (const { row, y } of aliases) if (x === y || xs === y.replace(/s$/, "")) return { row, exact: true };
  if (xl) for (const { row, yl } of aliases) if (xl === yl) return { row, exact: true };
  let best: AnswerRow | null = null;
  let bestDistance = 9;
  for (const { row, text, y, yl } of aliases) {
    // each comparison is judged against its own two strings: the looser form can be much shorter than the answer
    const d = Math.min(slip(x, y), xl && yl ? slip(xl, yl) : 9);
    if (d < bestDistance && !differentAnswer(xw, words(text))) {
      bestDistance = d;
      best = row;
    }
  }
  return best ? { row: best, exact: false } : null;
}

/** Returns the matching answer row or null, typing slips included. The server scores with this. */
export function match(question: Question, input: string): AnswerRow | null {
  return matchDetail(question, input)?.row ?? null;
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

/* The daily round is keyed to a calendar date, written as a number such as 20261117. The date is always the date in
   US Eastern Time, wherever the player is, so the round changes for everyone at the same moment: midnight Eastern.
   Because the browser and the server use the same clock, the server knows exactly which round is today's. */
export const GAME_ZONE = "America/New_York";
const zoneClock = new Intl.DateTimeFormat("en-US", { timeZone: GAME_ZONE, year: "numeric", month: "numeric", day: "numeric", hour: "numeric", minute: "numeric", second: "numeric", hourCycle: "h23" });
/** The date and time in the game's zone at a moment. */
function zoned(d: Date): { year: number; month: number; day: number; hour: number; minute: number; second: number } {
  const out: Record<string, number> = {};
  for (const part of zoneClock.formatToParts(d)) if (part.type !== "literal") out[part.type] = Number(part.value);
  return out as ReturnType<typeof zoned>;
}
/** Today's day key: the calendar date in Eastern Time. */
export function dayKey(d: Date = new Date()): number {
  const z = zoned(d);
  return z.year * 10000 + z.month * 100 + z.day;
}
/** The calendar date in UTC. Used only for arithmetic on day keys, which are plain calendar dates. */
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
/** How long after midnight a round started the day before may still be posted. A round takes a few minutes. */
export const LATE_POST_MS = 60 * 60 * 1000;
/** Whether a daily round for this day may be posted now: today's, or yesterday's in the first hour after midnight
    (a round started just before midnight and finished just after). Tomorrow's round can never be posted early. */
export function isPlayableDay(day: unknown, now: Date = new Date()): day is number {
  const today = dayKey(now);
  if (day === today) return true;
  return day === prevDayKey(today) && dayKey(new Date(now.getTime() - LATE_POST_MS)) === day;
}
/** 20261117 -> "2026-11-17" */
export function dayIso(key: number): string {
  return keyToDate(key).toISOString().slice(0, 10);
}
/** Time left until the next midnight Eastern, when the daily rounds change. */
export function msUntilNextDay(now: Date = new Date()): number {
  const z = zoned(now);
  const today = dayKey(now);
  // the time left on the clock, which is right except on the two days a year the clocks change
  let ms = ((23 - z.hour) * 3600 + (59 - z.minute) * 60 + (60 - z.second)) * 1000 - now.getMilliseconds();
  while (dayKey(new Date(now.getTime() + ms)) === today) ms += 3600000; // clocks went back: the day is an hour longer
  while (ms > 3600000 && dayKey(new Date(now.getTime() + ms - 3600000)) !== today) ms -= 3600000; // clocks went forward
  return ms;
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
  /** Day key for the daily round. Defaults to today (Eastern Time). */
  seed?: number;
  rand?: () => number;
}

/** A cluster needs this many prompts before its daily round opens, so three days in a row never share a prompt. */
export const DAILY_MIN = ROUND_SIZE * 3;

export function inCluster(questions: Question[], cluster: ClusterChoice = "all"): Question[] {
  return cluster === "all" ? questions : questions.filter((q) => q.cluster === cluster);
}
export function dailyEnabled(questions: Question[], cluster: ClusterChoice, day: number = dayKey()): boolean {
  return inCluster(questions, cluster).filter((q) => (q.since ?? 0) <= day).length >= DAILY_MIN;
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
  const all = inCluster(questions, cluster).slice().sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
  /* Each day draws only from the prompts that existed by then (`since`). The rounds are worked out forward from the
     first day, so without this, adding a prompt would reshuffle every earlier day and change today's round for
     people already playing it. With it, new prompts simply join from their first day on. */
  const dated = all.some((q) => q.since);
  const poolFor = (key: number) => (dated ? all.filter((q) => (q.since ?? 0) <= key) : all);
  if (poolFor(day).length < DAILY_MIN) return [];
  const cacheKey = `${cluster}:${day}:${all.length}:${hash(all.map((q) => q.id + (q.since ?? "")).join())}`;
  const cached = dailyCache.get(cacheKey);
  if (cached) return cached;
  const end = dayIndex(day);
  let round: Question[] = [];
  let recent: string[][] = [];
  for (let i = Math.min(0, end); i <= end; i++) {
    const key = utcDayKey(new Date(EPOCH + i * 86400000));
    const used = new Set(recent.flat());
    round = spread(shuffle(poolFor(key), rng(dailySeed(key, cluster))).filter((q) => !used.has(q.id)), ROUND_SIZE, groupFor(cluster));
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
