"use client";
import { createContext, useContext, useEffect, useId, useLayoutEffect, useMemo, useState, useSyncExternalStore } from "react";
import { AnswerCard } from "./AnswerCard";
import { LEVELS } from "@/lib/scoring";
import { addTerms, boardRefs, countNew, studySnapshot, subscribeStudy, termKey } from "@/lib/study";
import type { AnswerRow, Question } from "@/types";

/* Answer boards are shown only after a round has ended: in the round review and in the training log. Nothing in this
   file may be rendered while a round is being played. */

interface OpenCard {
  /** The board the open answer card belongs to. */
  board: string;
  answer: string;
}
const OpenContext = createContext<{ open: OpenCard | null; setOpen: (next: OpenCard | null) => void }>({ open: null, setOpen: () => {} });

const openButton = () => document.querySelector<HTMLElement>('.ans[aria-expanded="true"]');

/** Wraps every board of a review, so that only one answer card is open at a time. Esc closes the open card (before it
    closes a panel the boards are in) and puts focus back on its answer. */
export function AnswerBoards({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState<OpenCard | null>(null);
  const value = useMemo(() => ({ open, setOpen }), [open]);
  // Next.js keeps a page in memory while another one is shown: do not come back to a card left open
  useLayoutEffect(() => () => setOpen(null), []);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      const button = openButton();
      if (!button) return; // the board was taken away with its card open
      e.preventDefault();
      e.stopPropagation();
      button.focus();
      setOpen(null);
    };
    document.addEventListener("keydown", onKey, true);
    return () => document.removeEventListener("keydown", onKey, true);
  }, [open]);
  return <OpenContext.Provider value={value}>{children}</OpenContext.Provider>;
}

/** One prompt's answer board. Every answer is a button that opens its answer card under the board. `mine` is the row
    the player's answer matched. Must be inside <AnswerBoards>. */
export function AnswerBoard({ question, mine }: { question: Question; mine: AnswerRow | null }) {
  const board = useId();
  const { open, setOpen } = useContext(OpenContext);
  const list = useSyncExternalStore(subscribeStudy, studySnapshot);
  const rows = useMemo(() => question.a.slice().sort((a, b) => b[1] - a[1]), [question]);
  const onList = useMemo(() => new Set(list.map(termKey)), [list]);
  const openRow = open?.board === board ? rows.find((r) => r[0] === open.answer) ?? null : null;
  const refs = boardRefs(question);
  const left = countNew(list, refs);
  const close = () => {
    openButton()?.focus();
    setOpen(null);
  };
  return (
    <div className="aboard" data-board={question.id}>
      <ul className="bank">
        {rows.map((r) => {
          const isOpen = r === openRow;
          const saved = onList.has(termKey({ promptId: question.id, answer: r[0] }));
          return (
            <li key={r[0]}>
              <button type="button" className={`ans c${r[1]}${r === mine ? " mine" : ""}`} data-answer={r[0]} data-saved={saved || undefined} title={LEVELS[r[1]].name}
                aria-expanded={isOpen} aria-controls={isOpen ? "answerCard" : undefined} onClick={() => setOpen(isOpen ? null : { board, answer: r[0] })}>
                {r[0]} · {LEVELS[r[1]].pts}
              </button>
            </li>
          );
        })}
      </ul>
      {openRow && (
        <AnswerCard key={openRow[0]} question={question} row={openRow} mine={openRow === mine} onList={onList.has(termKey({ promptId: question.id, answer: openRow[0] }))} onClose={close} />
      )}
      <div className="boardtools">
        <button type="button" className="ghost mini addBoard" aria-disabled={left === 0} onClick={() => left > 0 && addTerms(refs)}>{left === 0 ? "Whole board added" : "Add whole board"}</button>
      </div>
    </div>
  );
}

/** "Add every board I missed": puts every answer of the given boards (the prompts the player got no credit for) on
    the study list. Renders nothing when there were no misses. */
export function AddMissedBoards({ id, className, questions }: { id?: string; className?: string; questions: Question[] }) {
  const list = useSyncExternalStore(subscribeStudy, studySnapshot);
  if (!questions.length) return null;
  const refs = questions.flatMap(boardRefs);
  const left = countNew(list, refs);
  return (
    <div className="missedtools">
      <button type="button" className={`ghost mini${className ? ` ${className}` : ""}`} id={id} aria-disabled={left === 0} onClick={() => left > 0 && addTerms(refs)}>
        {left === 0 ? "Missed boards added" : `Add every board I missed (${left} ${left === 1 ? "term" : "terms"})`}
      </button>
    </div>
  );
}
