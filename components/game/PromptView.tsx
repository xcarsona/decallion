"use client";
import { useRef } from "react";
import { Clock } from "./Clock";
import { DIFFS, SECONDS } from "@/lib/game-engine";
import { CLUSTERS } from "@/lib/questions";
import type { Question } from "@/types";

export function PromptView({ question, timed, onAnswer, onLastSeconds }: { question: Question; timed: boolean; onAnswer: (text: string, timedOut: boolean) => void; onLastSeconds: () => void }) {
  const input = useRef<HTMLInputElement>(null);
  return (
    <div className="view">
      <div className="panel">
        <div className="lbl" id="qLabel">{CLUSTERS[question.cluster].short} · {question.topic} · {DIFFS[question.diff]}</div>
        <h2 id="q">{question.q}</h2>
        <div className="hint">▲ rarer answers climb higher ▲</div>
      </div>
      <form
        className="dock"
        autoComplete="off"
        onSubmit={(e) => {
          e.preventDefault();
          const v = input.current?.value ?? "";
          if (v.trim()) onAnswer(v, false);
        }}
      >
        <Clock seconds={SECONDS} timed={timed} onExpire={() => onAnswer(input.current?.value ?? "", true)} onLastSeconds={onLastSeconds} />
        <input ref={input} id="answer" type="text" aria-label="Your answer" autoCapitalize="off" spellCheck={false} autoFocus />
        <button type="submit" id="submit">Climb</button>
      </form>
    </div>
  );
}
