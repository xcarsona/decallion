"use client";
import { useRef, useState } from "react";
import { Clock } from "./Clock";
import { DIFFS, MAX_ANSWER_LENGTH, SECONDS, match } from "@/lib/game-engine";
import { CLUSTERS } from "@/lib/questions";
import type { Question } from "@/types";

/* One prompt. An answer that is not on the board does not end the prompt: the player may try again until the clock
   runs out, or skip. The first answer that is on the board is final. */
export function PromptView({ question, timed, onAnswer, onLastSeconds, onWrongTry }: { question: Question; timed: boolean; onAnswer: (text: string, timedOut: boolean) => void; onLastSeconds: () => void; onWrongTry: () => void }) {
  const input = useRef<HTMLInputElement>(null);
  /** Answers tried so far that were not on the board, oldest first. */
  const [tries, setTries] = useState<string[]>([]);
  const lastTry = tries[tries.length - 1] ?? "";

  function submit() {
    const v = (input.current?.value ?? "").trim();
    if (!v) return;
    if (match(question, v)) return onAnswer(v, false);
    setTries([...tries, v]);
    onWrongTry();
    if (input.current) {
      input.current.value = "";
      input.current.focus();
    }
  }

  return (
    <div className="view">
      <div className="vbody">
        <div className="panel">
          <div className="lbl" id="qLabel">{CLUSTERS[question.cluster].short} · {question.topic} · {DIFFS[question.diff]}</div>
          <h2 id="q">{question.q}</h2>
          {tries.length === 0 ? (
            <div className="retry">
              <span className="hint">▲ rarer answers climb higher ▲</span>
              {/* with no clock there is no other way past a prompt the player cannot answer */}
              {!timed && <button type="button" className="ghost mini" id="skip" onClick={() => onAnswer("", false)}>Skip</button>}
            </div>
          ) : (
            <div className="retry" id="retry" role="status" aria-live="polite" key={tries.length}>
              <span>“{lastTry}” is not on the board. Try another answer{timed ? " before the clock runs out" : ""}.</span>
              <button type="button" className="ghost mini" id="skip" onClick={() => onAnswer(lastTry, false)}>Skip</button>
            </div>
          )}
        </div>
      </div>
      <form
        className="dock"
        autoComplete="off"
        data-tries={tries.length}
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        {/* when the clock runs out, whatever is in the box is the answer; an empty box falls back to the last try */}
        <Clock seconds={SECONDS} timed={timed} onExpire={() => onAnswer((input.current?.value ?? "").trim() || lastTry, true)} onLastSeconds={onLastSeconds} />
        <input ref={input} id="answer" key={tries.length % 2} className={tries.length ? "nope" : undefined} type="text" aria-label="Your answer" maxLength={MAX_ANSWER_LENGTH} autoCapitalize="off" autoCorrect="on" spellCheck autoFocus />
        <button type="submit" id="submit">Climb</button>
      </form>
    </div>
  );
}
