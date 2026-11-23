"use client";
import { useRef, useState } from "react";
import { Clock } from "./Clock";
import { DIFFS, MAX_ANSWER_LENGTH, SECONDS, matchDetail } from "@/lib/game-engine";
import { CLUSTERS } from "@/lib/questions";
import type { Question } from "@/types";

/* One prompt. An answer that is not on the board does not end the prompt: the player may try again until the clock
   runs out, or skip. The first answer that is on the board is final.

   A near miss (a typing slip) is not taken silently. The game asks "Did you mean ...?" above the answer box, and the
   player accepts it (Enter again, or a tap) or types something else. */
export function PromptView({ question, timed, onAnswer, onLastSeconds, onWrongTry }: { question: Question; timed: boolean; onAnswer: (text: string, timedOut: boolean) => void; onLastSeconds: () => void; onWrongTry: () => void }) {
  const input = useRef<HTMLInputElement>(null);
  /** Answers tried so far that were not on the board, oldest first. */
  const [tries, setTries] = useState<string[]>([]);
  const lastTry = tries[tries.length - 1] ?? "";
  /** The answer the typed text is close to, and the text it was offered for. */
  const [suggestion, setSuggestion] = useState<{ typed: string; answer: string } | null>(null);

  function submit() {
    const v = (input.current?.value ?? "").trim();
    if (!v) return;
    const found = matchDetail(question, v);
    if (found?.exact) return onAnswer(v, false);
    if (found) {
      // submitting the same text a second time accepts the suggestion
      if (suggestion && suggestion.typed === v) return onAnswer(suggestion.answer, false);
      setSuggestion({ typed: v, answer: found.row[0] });
      input.current?.focus();
      return;
    }
    setSuggestion(null);
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
      {/* sits right above the answer box, in smaller text */}
      <div className="suggest" id="suggest" role="status" aria-live="polite">
        {suggestion && (
          <>
            <span>Did you mean</span>
            <button type="button" id="suggestYes" onClick={() => onAnswer(suggestion.answer, false)}>{suggestion.answer}?</button>
            <span>Enter to accept, or keep typing.</span>
          </>
        )}
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
        <input
          ref={input}
          id="answer"
          key={tries.length % 2}
          className={tries.length ? "nope" : undefined}
          type="text"
          aria-label="Your answer"
          aria-describedby="q"
          maxLength={MAX_ANSWER_LENGTH}
          autoCapitalize="off"
          autoCorrect="on"
          spellCheck
          autoFocus
          // the suggestion belongs to the text it was made for: once that text changes, it goes
          onInput={(e) => {
            if (suggestion && e.currentTarget.value.trim() !== suggestion.typed) setSuggestion(null);
          }}
        />
        <button type="submit" id="submit">Climb</button>
      </form>
    </div>
  );
}
