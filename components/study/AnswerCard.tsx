"use client";
import { useEffect, useRef } from "react";
import { useDefinitions } from "./useDefinitions";
import { definitionOf } from "@/lib/questions/defs";
import { LEVELS } from "@/lib/scoring";
import { addTerms, removeTerm } from "@/lib/study";
import type { AnswerRow, Question } from "@/types";

export const NO_DEFINITION = "No definition yet.";

/** What one answer on a board means, with the button that puts it on the study list. Shown under the board it belongs
    to. Focus moves to the card when it opens, and the definition is announced when it has loaded. */
export function AnswerCard({ question, row, mine, onList, onClose }: { question: Question; row: AnswerRow; mine: boolean; onList: boolean; onClose: () => void }) {
  const box = useRef<HTMLDivElement>(null);
  const defs = useDefinitions(question.cluster)[question.cluster];
  const text = defs ? definitionOf(defs, question.id, row[0]) : null;
  const ref = { promptId: question.id, answer: row[0] };
  useEffect(() => {
    box.current?.focus({ preventScroll: true });
    box.current?.scrollIntoView({ block: "nearest" });
  }, []);
  return (
    <div className={`acard c${row[1]}`} id="answerCard" ref={box} tabIndex={-1} role="group" aria-label={`About the answer ${row[0]}`}>
      <div className="achead">
        <b id="answerName">{row[0]}</b>
        <span className="aclevel">{LEVELS[row[1]].name} · {LEVELS[row[1]].pts} pts</span>
        {mine && <span className="acmine">Your answer</span>}
      </div>
      <p id="answerDef" aria-live="polite" aria-busy={!defs} className={text ? undefined : "mute"}>{!defs ? "Loading" : text ?? NO_DEFINITION}</p>
      <div className="acrow">
        {onList && <span className="aclisted" key="on">On your study list</span>}
        <button type="button" className="ghost mini" id="studyToggle" key="toggle" onClick={() => (onList ? removeTerm(ref) : addTerms([ref]))}>{onList ? "Remove" : "Add to study list"}</button>
        <button type="button" className="ghost mini" id="answerClose" key="close" onClick={onClose}>Close</button>
      </div>
    </div>
  );
}
