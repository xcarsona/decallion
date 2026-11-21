import { beforeEach, describe, expect, it } from "vitest";
import { LOG_KEY, clearLog } from "@/lib/log";
import { QUESTIONS } from "@/lib/questions";
import { reset } from "@/lib/stats";
import {
  STUDY_CAP, STUDY_KEY, addMany, addOne, addTerms, boardRefs, clear, clearStudy, countNew, counts, groupTerms, hasTerm, isStudyPersistent, loadStudy, remove,
  removeLearned, removeLearnedTerms, removeTerm, sanitize, studySnapshot, subscribeStudy, toggleLearned, toggleTermLearned, trim, type StudyItem,
} from "@/lib/study";

const fin = QUESTIONS.filter((q) => q.cluster === "fin");
const mkt = QUESTIONS.filter((q) => q.cluster === "mkt");
const T0 = new Date("2026-11-17T15:00:00.000Z");
const T1 = new Date("2026-11-18T15:00:00.000Z");
const ref = (promptId: string, answer: string) => ({ promptId, answer });
const item = (promptId: string, answer: string, addedAt: string, learned = false): StudyItem => ({ promptId, answer, addedAt, learned });
const day = (n: number) => new Date(Date.UTC(2026, 0, 1 + n)).toISOString();

describe("study list", () => {
  it("adds one term with its date, not learned, and never twice", () => {
    const one = addOne([], ref("FIN-01", "Stocks"), T0);
    expect(one).toEqual([{ promptId: "FIN-01", answer: "Stocks", addedAt: "2026-11-17T15:00:00.000Z", learned: false }]);
    const again = addOne(one, ref("FIN-01", "Stocks"), T1);
    expect(again).toBe(one); // nothing changed: the first date is kept
    // the same answer on another prompt is a different term
    expect(addOne(one, ref("FIN-02", "Stocks"), T1)).toHaveLength(2);
    expect(hasTerm(one, ref("FIN-01", "Stocks"))).toBe(true);
    expect(hasTerm(one, ref("FIN-01", "Bonds"))).toBe(false);
    expect(addOne(one, ref("", "x"), T1)).toBe(one);
    expect(addOne(one, ref("FIN-01", ""), T1)).toBe(one);
  });

  it("adds many terms without duplicates and keeps what was there", () => {
    const start = toggleLearned(addOne([], ref("FIN-01", "Stocks"), T0), ref("FIN-01", "Stocks"));
    const refs = [ref("FIN-01", "Stocks"), ref("FIN-01", "Bonds"), ref("FIN-01", "Bonds"), ref("FIN-01", "Gold")];
    expect(countNew(start, refs)).toBe(2);
    const list = addMany(start, refs, T1);
    expect(list.map((i) => i.answer)).toEqual(["Stocks", "Bonds", "Gold"]);
    expect(list[0]).toEqual({ promptId: "FIN-01", answer: "Stocks", addedAt: T0.toISOString(), learned: true });
    expect(list[1].addedAt).toBe(T1.toISOString());
    expect(countNew(list, refs)).toBe(0);
    // a whole board
    const board = addMany([], boardRefs(fin[0]), T0);
    expect(board.map((i) => i.answer)).toEqual(fin[0].a.map((r) => r[0]));
    expect(board.every((i) => i.promptId === fin[0].id)).toBe(true);
  });

  it("removes, toggles learned, removes learned and clears", () => {
    let list = addMany([], [ref("A-1", "one"), ref("A-1", "two"), ref("B-1", "one")], T0);
    list = toggleLearned(list, ref("A-1", "two"));
    expect(list.map((i) => i.learned)).toEqual([false, true, false]);
    expect(counts(list)).toEqual({ terms: 3, learned: 1, toLearn: 2 });
    expect(toggleLearned(list, ref("A-1", "two")).map((i) => i.learned)).toEqual([false, false, false]);
    expect(toggleLearned(list, ref("nope", "two"))).toEqual(list);
    expect(remove(list, ref("A-1", "one")).map((i) => `${i.promptId}:${i.answer}`)).toEqual(["A-1:two", "B-1:one"]);
    expect(remove(list, ref("nope", "one"))).toEqual(list);
    expect(removeLearned(list).map((i) => i.answer)).toEqual(["one", "one"]);
    expect(clear()).toEqual([]);
    expect(counts([])).toEqual({ terms: 0, learned: 0, toLearn: 0 });
  });

  it("drops the oldest learned terms first when the list is full, then the oldest", () => {
    const list = [item("P", "a", day(0)), item("P", "b", day(1), true), item("P", "c", day(2)), item("P", "d", day(3), true)];
    expect(trim(list, 4)).toBe(list);
    expect(trim(list, 3).map((i) => i.answer)).toEqual(["a", "c", "d"]); // oldest learned
    expect(trim(list, 2).map((i) => i.answer)).toEqual(["a", "c"]); // both learned
    expect(trim(list, 1).map((i) => i.answer)).toEqual(["c"]); // then the oldest
    // adding past the cap keeps the new term
    const added = addOne(list, ref("P", "e"), new Date(day(4)), 4);
    expect(added.map((i) => i.answer)).toEqual(["a", "c", "d", "e"]);
    const none = addOne([item("P", "a", day(0)), item("P", "b", day(1))], ref("P", "c"), new Date(day(2)), 2);
    expect(none.map((i) => i.answer)).toEqual(["b", "c"]);
    // the real cap
    const full = Array.from({ length: STUDY_CAP }, (_, i) => item("P", `t${i}`, day(i), i === 7));
    const over = addOne(full, ref("P", "new"), new Date(day(STUDY_CAP)));
    expect(over).toHaveLength(STUDY_CAP);
    expect(hasTerm(over, ref("P", "t7"))).toBe(false);
    expect(hasTerm(over, ref("P", "t0"))).toBe(true);
    expect(over[over.length - 1].answer).toBe("new");
  });

  it("keeps only well-formed items from storage", () => {
    for (const bad of [null, undefined, 7, "x", {}, { promptId: "A", answer: "b" }]) expect(sanitize(bad)).toEqual([]);
    const good = item("FIN-01", "Stocks", T0.toISOString(), true);
    const raw = [
      good,
      null, 7, "text", [],
      { promptId: "FIN-01", answer: "Bonds" }, // no date
      { promptId: "FIN-01", answer: "Bonds", addedAt: "not a date", learned: false },
      { promptId: 5, answer: "Bonds", addedAt: T0.toISOString() },
      { promptId: "FIN-01", answer: "", addedAt: T0.toISOString() },
      { promptId: "", answer: "Bonds", addedAt: T0.toISOString() },
      { ...good, learned: false }, // the same term again
      { promptId: "FIN-02", answer: "Cash", addedAt: T1.toISOString(), learned: "yes", extra: 1 },
    ];
    expect(sanitize(raw)).toEqual([good, { promptId: "FIN-02", answer: "Cash", addedAt: T1.toISOString(), learned: false }]);
    expect(sanitize(Array.from({ length: STUDY_CAP + 5 }, (_, i) => item("P", `t${i}`, day(i))))).toHaveLength(STUDY_CAP);
  });

  it("groups terms by cluster, then by prompt, rarest answers first", () => {
    const [f0, f1] = fin;
    const m0 = mkt[0];
    const low = f0.a.slice().sort((a, b) => a[1] - b[1])[0];
    const high = f0.a.slice().sort((a, b) => b[1] - a[1])[0];
    let list = addMany([], [ref(m0.id, m0.a[0][0]), ref(f1.id, f1.a[0][0]), ref(f0.id, low[0]), ref(f0.id, high[0]), ref(f0.id, "Not on the board"), ref("GONE-99", "Old term")], T0);
    list = toggleLearned(list, ref(f0.id, high[0]));

    const groups = groupTerms(list, QUESTIONS);
    expect(groups.map((g) => g.cluster)).toEqual(["fin", "mkt", null]);
    expect(groups.map((g) => g.terms)).toEqual([4, 1, 1]);
    expect(groups[0].prompts.map((p) => p.promptId)).toEqual([f0.id, f1.id]); // bank order
    expect(groups[0].prompts[0].question).toBe(f0);
    expect(groups[0].prompts[0].terms.map((t) => t.item.answer)).toEqual([high[0], low[0], "Not on the board"]);
    expect(groups[0].prompts[0].terms.map((t) => t.row)).toEqual([high, low, null]);
    expect(groups[2].prompts).toEqual([{ promptId: "GONE-99", question: null, terms: [{ item: list[5], row: null }] }]);

    // filters: the prompt's own cluster, and hide learned
    const onlyMkt = groupTerms(list, QUESTIONS, { cluster: "mkt", hideLearned: false });
    expect(onlyMkt.map((g) => g.cluster)).toEqual(["mkt"]);
    const hidden = groupTerms(list, QUESTIONS, { cluster: "fin", hideLearned: true });
    expect(hidden[0].prompts[0].terms.map((t) => t.item.answer)).toEqual([low[0], "Not on the board"]);
    expect(hidden[0].terms).toBe(3);
    expect(groupTerms(list, QUESTIONS, { cluster: "ht", hideLearned: false })).toEqual([]);
    expect(groupTerms([], QUESTIONS)).toEqual([]);
  });
});

describe("study list storage", () => {
  let data: Map<string, string>;
  beforeEach(() => {
    data = new Map<string, string>();
    (globalThis as { localStorage?: unknown }).localStorage = {
      getItem: (k: string) => data.get(k) ?? null,
      setItem: (k: string, v: string) => void data.set(k, v),
      removeItem: (k: string) => void data.delete(k),
    };
    clearStudy();
  });

  it("saves every change under its own key and reads it back", () => {
    addTerms([ref("FIN-01", "Stocks"), ref("FIN-01", "Bonds")]);
    expect(JSON.parse(localStorage.getItem(STUDY_KEY)!)).toEqual(loadStudy());
    expect(loadStudy().map((i) => i.answer)).toEqual(["Stocks", "Bonds"]);
    toggleTermLearned(ref("FIN-01", "Bonds"));
    expect(loadStudy()[1].learned).toBe(true);
    removeTerm(ref("FIN-01", "Stocks"));
    expect(loadStudy().map((i) => i.answer)).toEqual(["Bonds"]);
    addTerms([ref("FIN-02", "Cash")]);
    expect(removeLearnedTerms().map((i) => i.answer)).toEqual(["Cash"]);
    expect(clearStudy()).toEqual([]);
    expect(loadStudy()).toEqual([]);
    expect(isStudyPersistent()).toBe(true);
  });

  it("reads a damaged save as an empty list and replaces it on the next change", () => {
    for (const bad of ["{", "null", "7", '"x"', "{}", '[{"promptId":1}]']) {
      localStorage.setItem(STUDY_KEY, bad);
      expect(loadStudy()).toEqual([]);
    }
    expect(isStudyPersistent()).toBe(true);
    addTerms([ref("FIN-01", "Stocks")]);
    expect(JSON.parse(localStorage.getItem(STUDY_KEY)!)).toHaveLength(1);
  });

  it("reads storage again for every change, so another tab's terms are kept", () => {
    addTerms([ref("FIN-01", "Stocks")]);
    // another tab adds a term
    localStorage.setItem(STUDY_KEY, JSON.stringify([...loadStudy(), item("FIN-01", "Bonds", T0.toISOString())]));
    addTerms([ref("FIN-01", "Gold")]);
    expect(loadStudy().map((i) => i.answer)).toEqual(["Stocks", "Bonds", "Gold"]);
  });

  it("tells subscribers about every change and hands out a stable snapshot in between", () => {
    let calls = 0;
    const stop = subscribeStudy(() => calls++);
    const before = studySnapshot();
    expect(studySnapshot()).toBe(before);
    addTerms([ref("FIN-01", "Stocks")]);
    expect(calls).toBe(1);
    const after = studySnapshot();
    expect(after).not.toBe(before);
    expect(after).toHaveLength(1);
    expect(studySnapshot()).toBe(after);
    toggleTermLearned(ref("FIN-01", "Stocks"));
    removeTerm(ref("FIN-01", "Stocks"));
    expect(calls).toBe(3);
    stop();
    clearStudy();
    expect(calls).toBe(3);
  });

  it("is not touched when the log and the stats are cleared", () => {
    addTerms([ref("FIN-01", "Stocks")]);
    clearLog();
    reset();
    expect(localStorage.getItem(LOG_KEY)).toBe("[]");
    expect(loadStudy().map((i) => i.answer)).toEqual(["Stocks"]);
    expect(studySnapshot()).toHaveLength(1);
  });

  it("keeps the list in memory when storage is full or blocked", () => {
    let full = false;
    (globalThis as { localStorage?: unknown }).localStorage = {
      getItem: (k: string) => data.get(k) ?? null,
      setItem: (k: string, v: string) => {
        if (full) throw new Error("QuotaExceededError");
        data.set(k, v);
      },
    };
    addTerms([ref("FIN-01", "Stocks")]);
    full = true;
    addTerms([ref("FIN-01", "Bonds")]);
    expect(isStudyPersistent()).toBe(false);
    expect(loadStudy().map((i) => i.answer)).toEqual(["Stocks", "Bonds"]);
    full = false;
    addTerms([ref("FIN-01", "Gold")]);
    expect(isStudyPersistent()).toBe(true);
    expect(JSON.parse(localStorage.getItem(STUDY_KEY)!)).toHaveLength(3);

    (globalThis as { localStorage?: unknown }).localStorage = {
      getItem: () => { throw new Error("blocked"); },
      setItem: () => { throw new Error("blocked"); },
    };
    clearStudy();
    addTerms([ref("MKT-01", "Price")]);
    expect(loadStudy().map((i) => i.answer)).toEqual(["Price"]);
    expect(isStudyPersistent()).toBe(false);
  });
});
