"use client";
import { useState } from "react";
import { MODE_NAME } from "./EndView";
import { AddMissedBoards, AnswerBoard, AnswerBoards } from "@/components/study/AnswerBoard";
import { DIFFS, dayIso } from "@/lib/game-engine";
import { clusterInfo } from "@/lib/questions";
import { LEVELS, MAX_PER_PROMPT, ft } from "@/lib/scoring";
import type { ClusterChoice, LogEntry, Mode } from "@/types";

/** The share text and every prompt of a finished round with its full answer board. Shown in the Round review panel,
    which opens only from the results screen: boards stay hidden while a round is being played. Each answer opens a
    card with its definition and can be put on the study list. */
export function RoundReview({ cluster, mode, log, score, day }: { cluster: ClusterChoice; mode: Mode; log: LogEntry[]; score: number; day: number }) {
  const [copied, setCopied] = useState("Copy result");
  // the day the round belongs to, which is not always today: the review can be opened after midnight
  const date = new Date(dayIso(day) + "T12:00:00Z").toLocaleDateString(undefined, { month: "short", day: "numeric", timeZone: "UTC" });
  const share = `Decallion ${MODE_NAME[mode].toLowerCase()} · ${clusterInfo(cluster).short}${mode === "daily" ? ` ${date}` : ""}\n${log.map((l) => (l.level === -1 ? "⬛" : LEVELS[l.level].emoji)).join("")}\n${ft(score)} ft · ${score}${mode === "unlimited" ? " pts" : ` / ${log.length * MAX_PER_PROMPT}`}`;
  const copy = () => navigator.clipboard.writeText(share).then(() => setCopied("Copied"), () => setCopied("Select and copy the text above"));
  return (
    <div className="review" id="results">
      {/* four rows: on a phone the first line wraps. Browsers with field-sizing fit the box to the text instead. */}
      <textarea id="share" rows={4} readOnly aria-label="Shareable result" value={share} />
      <div><button type="button" className="mini" onClick={copy}>{copied}</button></div>
      <div className="reviewtools">
        <p className="mute">Pick an answer to see what it means and add it to your study list.</p>
        <AddMissedBoards id="addMissed" questions={log.filter((l) => l.level === -1).map((l) => l.question)} />
      </div>
      <AnswerBoards>
      {log.map((l, i) => (
        <div className="rev" key={i}>
          <div className="q">{l.question.q}</div>
          <div className={`you ${l.level === -1 ? "cx" : `c${l.level}`}`}>
            {l.level === -1 ? `You: ${l.typed || "no answer"} · No credit` : `You: ${l.row![0]} · ${LEVELS[l.level].name} +${l.pts}`}
          </div>
          <AnswerBoard question={l.question} mine={l.row} />
          <div className="why">{l.question.why}</div>
          <div className="tag">{l.question.topic} · {l.question.area} · {DIFFS[l.question.diff]} · {l.question.id}</div>
        </div>
      ))}
      </AnswerBoards>
    </div>
  );
}
