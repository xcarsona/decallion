/* The study list: answers the player saved from an answer board to learn later, kept in this browser's storage.
   An item stores the prompt id and the answer as displayed on the board, not the prompt or the definition; the study
   page looks those up. The list is separate from the training log and the stats: clearing those does not touch it. */
import { CLUSTER_IDS } from "@/lib/questions/clusters";
import type { AnswerRow, ClusterId, Question } from "@/types";

export interface StudyRef {
  promptId: string;
  /** The answer exactly as it is displayed on the board. */
  answer: string;
}
export interface StudyItem extends StudyRef {
  /** When it was added, ISO date-time (UTC). */
  addedAt: string;
  learned: boolean;
}

export const STUDY_KEY = "decallion-study-v1";
export const STUDY_CAP = 2000;

/** One string per term. Prompt ids never contain a line break, so two different terms cannot share a key. */
export const termKey = (ref: StudyRef) => `${ref.promptId}\n${ref.answer}`;
const same = (a: StudyRef, b: StudyRef) => a.promptId === b.promptId && a.answer === b.answer;

/* ---------- changing the list (pure) ---------- */

export function hasTerm(list: StudyItem[], ref: StudyRef): boolean {
  return list.some((i) => same(i, ref));
}

/** Drops items past the cap: the oldest learned ones first, then the oldest. The order of the rest is kept. */
export function trim(list: StudyItem[], cap: number = STUDY_CAP): StudyItem[] {
  const extra = list.length - cap;
  if (extra <= 0) return list;
  const oldestFirst = list
    .map((item, at) => ({ item, at }))
    .sort((a, b) => Number(b.item.learned) - Number(a.item.learned) || a.item.addedAt.localeCompare(b.item.addedAt) || a.at - b.at);
  const drop = new Set(oldestFirst.slice(0, extra).map((x) => x.item));
  return list.filter((i) => !drop.has(i));
}

/** Adds terms that are not on the list yet, at the end. Terms already on it keep their date and learned mark. */
export function addMany(list: StudyItem[], refs: StudyRef[], at: Date = new Date(), cap: number = STUDY_CAP): StudyItem[] {
  const seen = new Set(list.map(termKey));
  const added: StudyItem[] = [];
  for (const ref of refs) {
    if (!ref.promptId || !ref.answer || seen.has(termKey(ref))) continue;
    seen.add(termKey(ref));
    added.push({ promptId: ref.promptId, answer: ref.answer, addedAt: at.toISOString(), learned: false });
  }
  return added.length ? trim([...list, ...added], cap) : list;
}
export function addOne(list: StudyItem[], ref: StudyRef, at: Date = new Date(), cap: number = STUDY_CAP): StudyItem[] {
  return addMany(list, [ref], at, cap);
}
export function remove(list: StudyItem[], ref: StudyRef): StudyItem[] {
  return list.filter((i) => !same(i, ref));
}
export function toggleLearned(list: StudyItem[], ref: StudyRef): StudyItem[] {
  return list.map((i) => (same(i, ref) ? { ...i, learned: !i.learned } : i));
}
export function removeLearned(list: StudyItem[]): StudyItem[] {
  return list.filter((i) => !i.learned);
}
export function clear(): StudyItem[] {
  return [];
}

/** How many of these terms are not on the list yet (the same term twice counts once). */
export function countNew(list: StudyItem[], refs: StudyRef[]): number {
  const seen = new Set(list.map(termKey));
  return new Set(refs.map(termKey).filter((k) => !seen.has(k))).size;
}

const isObject = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v);

/** Reads whatever was saved and keeps only well-formed items, each term once. */
export function sanitize(raw: unknown): StudyItem[] {
  if (!Array.isArray(raw)) return [];
  const out: StudyItem[] = [];
  const seen = new Set<string>();
  for (const r of raw) {
    if (!isObject(r) || typeof r.promptId !== "string" || !r.promptId || typeof r.answer !== "string" || !r.answer) continue;
    if (typeof r.addedAt !== "string" || Number.isNaN(Date.parse(r.addedAt))) continue;
    const item: StudyItem = { promptId: r.promptId, answer: r.answer, addedAt: r.addedAt, learned: r.learned === true };
    if (seen.has(termKey(item))) continue;
    seen.add(termKey(item));
    out.push(item);
  }
  return trim(out);
}

/* ---------- counts and grouping for the study page (pure) ---------- */

export interface StudyCounts {
  terms: number;
  learned: number;
  toLearn: number;
}
export function counts(list: StudyItem[]): StudyCounts {
  const learned = list.filter((i) => i.learned).length;
  return { terms: list.length, learned, toLearn: list.length - learned };
}

/** The answers of one board as terms. */
export function boardRefs(question: Question): StudyRef[] {
  return question.a.map((row) => ({ promptId: question.id, answer: row[0] }));
}

export interface StudyFilter {
  /** The prompt's own cluster, or "all". */
  cluster: ClusterId | "all";
  hideLearned: boolean;
}
export interface StudyTerm {
  item: StudyItem;
  /** The board row for this answer, or null if the answer is no longer on the board. */
  row: AnswerRow | null;
}
export interface StudyPromptGroup {
  promptId: string;
  /** Null if the prompt is no longer in the bank. */
  question: Question | null;
  terms: StudyTerm[];
}
export interface StudyClusterGroup {
  /** Null for prompts that are no longer in the bank. */
  cluster: ClusterId | null;
  prompts: StudyPromptGroup[];
  terms: number;
}

/** The list grouped by cluster, then by prompt (in bank order), with each prompt's rarest answers first. Terms whose
    prompt is gone come last, in a group of their own, and only when no cluster filter is on. */
export function groupTerms(list: StudyItem[], questions: Question[], filter: StudyFilter = { cluster: "all", hideLearned: false }): StudyClusterGroup[] {
  const order = new Map(questions.map((q, i) => [q.id, i]));
  const byId = new Map(questions.map((q) => [q.id, q]));
  const prompts = new Map<string, StudyPromptGroup>();
  for (const item of list) {
    if (filter.hideLearned && item.learned) continue;
    const question = byId.get(item.promptId) ?? null;
    if (filter.cluster !== "all" && question?.cluster !== filter.cluster) continue;
    let group = prompts.get(item.promptId);
    if (!group) prompts.set(item.promptId, (group = { promptId: item.promptId, question, terms: [] }));
    group.terms.push({ item, row: question?.a.find((r) => r[0] === item.answer) ?? null });
  }
  for (const g of prompts.values()) {
    g.terms.sort((a, b) => (b.row ? b.row[1] : 0) - (a.row ? a.row[1] : 0) || a.item.answer.localeCompare(b.item.answer));
  }
  const all = [...prompts.values()];
  const out: StudyClusterGroup[] = [];
  for (const cluster of [...CLUSTER_IDS, null]) {
    const mine = all
      .filter((g) => (g.question ? g.question.cluster : null) === cluster)
      .sort((a, b) => (cluster ? order.get(a.promptId)! - order.get(b.promptId)! : a.promptId.localeCompare(b.promptId)));
    if (mine.length) out.push({ cluster, prompts: mine, terms: mine.reduce((n, g) => n + g.terms.length, 0) });
  }
  return out;
}

/* ---------- storage ---------- */

/* `persistent` is false while storage cannot be read or the last save did not reach it. Until a save works again,
   the copy in memory is the newest one and is what loadStudy() returns. */
let persistent = true;
let memory: StudyItem[] | null = null;
export const isStudyPersistent = () => persistent;

/** The saved list, read fresh from storage every time (another tab may have changed it). */
export function loadStudy(): StudyItem[] {
  if (!persistent && memory) return memory;
  let raw: string | null;
  try {
    raw = localStorage.getItem(STUDY_KEY);
  } catch {
    persistent = false;
    return memory ?? [];
  }
  if (!raw) return [];
  try {
    return sanitize(JSON.parse(raw));
  } catch {
    return []; // a damaged save is not a storage problem: the next change saved replaces it
  }
}
function saveStudy(list: StudyItem[]): StudyItem[] {
  memory = list;
  try {
    localStorage.setItem(STUDY_KEY, JSON.stringify(list));
    persistent = true;
  } catch {
    persistent = false;
  }
  changed();
  return list;
}

/* A store React can subscribe to (useSyncExternalStore). */
let cached: StudyItem[] | null = null;
let watching = false;
const listeners = new Set<() => void>();
function changed() {
  cached = null;
  listeners.forEach((fn) => fn());
}
/** The saved list. Returns the same array until it changes in this tab or in another one. */
export function studySnapshot(): StudyItem[] {
  return (cached ??= loadStudy());
}
export function subscribeStudy(fn: () => void): () => void {
  if (!watching && typeof window !== "undefined") {
    watching = true;
    // fires when another tab saves or clears; `key` is null when all storage is cleared
    window.addEventListener("storage", (e) => {
      if (e.key === null || e.key === STUDY_KEY) changed();
    });
  }
  listeners.add(fn);
  return () => void listeners.delete(fn);
}

/* Each of these reads storage again first, so a change made in another tab is not overwritten. */
export function addTerms(refs: StudyRef[]): StudyItem[] {
  return saveStudy(addMany(loadStudy(), refs));
}
export function removeTerm(ref: StudyRef): StudyItem[] {
  return saveStudy(remove(loadStudy(), ref));
}
export function toggleTermLearned(ref: StudyRef): StudyItem[] {
  return saveStudy(toggleLearned(loadStudy(), ref));
}
export function removeLearnedTerms(): StudyItem[] {
  return saveStudy(removeLearned(loadStudy()));
}
export function clearStudy(): StudyItem[] {
  return saveStudy(clear());
}
