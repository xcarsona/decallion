"use client";
import { useEffect, useRef, useState } from "react";
import { ClusterIcon } from "./ClusterIcon";
import { ScoreSubmit } from "./ScoreSubmit";
import { reducedMotion } from "@/components/ui/motion";
import { ROUND_SIZE, STRIKES } from "@/lib/game-engine";
import { clusterInfo } from "@/lib/questions";
import { LEVELS, LEVEL_KEYS, MAX_PER_PROMPT, ft } from "@/lib/scoring";
import type { RecordOutcome } from "@/lib/stats";
import type { ClusterChoice, LogEntry, Mode } from "@/types";

export const MODE_NAME: Record<Mode, string> = { daily: "Daily climb", practice: "Practice", unlimited: "Unlimited" };

const COUNT_MS = 1200;
const TICK_MS = 55;

/** The results screen. The score and altitude count up from zero; the tally, the note and the buttons follow.
    `onTick` is called with the progress (0 to 1) for each tick of the count, `onLand` once when the final score shows. */
export function EndView({ cluster, mode, log, score, outcome, day, onTick, onLand, onAgain, onReview, onHome }: { cluster: ClusterChoice; mode: Mode; log: LogEntry[]; score: number; outcome: RecordOutcome | null; day: number; onTick: (progress: number) => void; onLand: () => void; onAgain: () => void; onReview: () => void; onHome: () => void }) {
  const [n, setN] = useState(() => (reducedMotion() ? score : 0));
  const done = n === score;
  const tick = useRef(onTick);
  const land = useRef(onLand);
  const landed = useRef(false);
  useEffect(() => {
    tick.current = onTick;
    land.current = onLand;
  });
  useEffect(() => {
    if (!done || landed.current) return;
    landed.current = true;
    land.current();
  }, [done]);
  useEffect(() => {
    if (done) return;
    const t0 = performance.now();
    let id = 0, lastTick = 0;
    const step = (now: number) => {
      const p = Math.min(1, (now - t0) / COUNT_MS);
      if (p < 1 && now - lastTick >= TICK_MS) {
        lastTick = now;
        tick.current(p);
      }
      setN(p >= 1 ? score : Math.min(score - 1, Math.floor(score * (1 - (1 - p) ** 2)))); // ease out; only the last frame lands
      if (p < 1) id = requestAnimationFrame(step);
    };
    id = requestAnimationFrame(step);
    return () => cancelAnimationFrame(id);
  }, [done, score]);

  const prompts = log.length, max = prompts * MAX_PER_PROMPT;
  const glass = log.filter((l) => l.level === 6).length, miss = log.filter((l) => l.level === -1).length;
  const perfect = mode !== "unlimited" && prompts === ROUND_SIZE && score >= max;
  let note = "Answer boards are open: see Review answers.";
  if (!outcome) note = "Today's daily was already started or logged, so this run was not added to your stats.";
  else if (mode === "daily") note = `Daily streak: ${outcome.streak} day${outcome.streak === 1 ? "" : "s"}. ${note}`;
  else if (outcome.previousBest && !outcome.newBest) note = `Your best in this mode is ${ft(outcome.previousBest)} ft. ${note}`;
  // Unlimited normally ends on the third miss. If it ended with misses to spare, the cluster ran out of prompts.
  if (mode === "unlimited" && miss < STRIKES) note = `You answered every prompt in this cluster. ${note}`;
  const alt = <span className="endft">{ft(n)} ft</span>;
  return (
    <div className="view end" data-done={done}>
      <div className="vbody">
        <div className="panel tall">
          <div className="headrow">
            <div className="lbl endlbl" id="endLabel"><ClusterIcon cluster={cluster} size={24} />{clusterInfo(cluster).short} · {MODE_NAME[mode]} · final altitude</div>
            {done && outcome?.newBest && outcome.previousBest > 0 && <span className="newbest">New personal best</span>}
          </div>
          <h2 id="endTitle" data-score={score} data-done={done}>{perfect ? <>{alt}. You took the glass.</> : <>You topped out at {alt}.</>}</h2>
          <p id="endLine">
            <span id="endScore">{n}</span>{mode === "unlimited" ? ` points across ${prompts} prompt${prompts === 1 ? "" : "s"}` : ` of ${max} points`}, with {glass ? `${glass} DECA Glass answer${glass > 1 ? "s" : ""}` : "no DECA Glass answers"}.
          </p>
          <div className="after">
            <div className="tally">
              {LEVEL_KEYS.slice().reverse().map((k) => {
                const c = log.filter((l) => l.level === k).length;
                return c ? <span key={k} className={`c${k}`}>{c} × {LEVELS[k].name}</span> : null;
              })}
              {miss > 0 && <span className="cx">{miss} × No credit</span>}
            </div>
            <p className="mute" id="endNote">{note}</p>
            {/* every cluster has its own board; only a counted daily round can be posted */}
            {mode === "daily" && outcome && <ScoreSubmit day={day} cluster={cluster} answers={log.map((l) => l.typed)} />}
          </div>
        </div>
      </div>
      <div className="dock wrapok after">
        <button type="button" id="again" onClick={onAgain}>Play again</button>
        <button type="button" className="ghost" id="reviewBtn" aria-haspopup="dialog" onClick={onReview}>Review answers</button>
        <button type="button" className="ghost" id="endHome" onClick={onHome}>Home</button>
      </div>
    </div>
  );
}
