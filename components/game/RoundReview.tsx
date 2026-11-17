"use client";
import { useState } from "react";
import { MODE_NAME } from "./EndView";
import { DIFFS } from "@/lib/game-engine";
import { LEVELS, MAX_PER_PROMPT, ft } from "@/lib/scoring";
import type { LogEntry, Mode } from "@/types";

export function RoundReview({ mode, log, score }: { mode: Mode; log: LogEntry[] | null; score: number }) {
  const [copied, setCopied] = useState("Copy result");
  if (!log) {
    return (
      <section className="card">
        <h2>Round review</h2>
        <p className="mute">Sealed until you finish a round. Every answer board opens here, with an explanation.</p>
      </section>
    );
  }
  const date = new Date().toLocaleDateString(undefined, { month: "short", day: "numeric", timeZone: "UTC" });
  const share = `Decallion ${MODE_NAME[mode].toLowerCase()}${mode === "daily" ? ` ${date}` : ""}\n${log.map((l) => (l.level === -1 ? "⬛" : LEVELS[l.level].emoji)).join("")}\n${ft(score)} ft · ${score}${mode === "unlimited" ? " pts" : ` / ${log.length * MAX_PER_PROMPT}`}`;
  const copy = () => navigator.clipboard.writeText(share).then(() => setCopied("Copied"), () => setCopied("Select and copy the text above"));
  return (
    <section className="card" id="results">
      <h2>Round review</h2>
      <textarea id="share" rows={3} readOnly aria-label="Shareable result" value={share} />
      <div><button type="button" className="mini" onClick={copy}>{copied}</button></div>
      {log.map((l, i) => (
        <div className="rev" key={i}>
          <div className="q">{l.question.q}</div>
          <div className={`you ${l.level === -1 ? "cx" : `c${l.level}`}`}>
            {l.level === -1 ? `You: ${l.typed || "no answer"} · No credit` : `You: ${l.row![0]} · ${LEVELS[l.level].name} +${l.pts}`}
          </div>
          <ul className="bank">
            {l.question.a.slice().sort((a, b) => b[1] - a[1]).map((r) => (
              <li key={r[0]} className={`c${r[1]}${r === l.row ? " mine" : ""}`} title={LEVELS[r[1]].name}>{r[0]} · {LEVELS[r[1]].pts}</li>
            ))}
          </ul>
          <div className="why">{l.question.why}</div>
          <div className="tag">{l.question.topic} · {l.question.area} · {DIFFS[l.question.diff]} · {l.question.id}</div>
        </div>
      ))}
    </section>
  );
}
