import { ClusterIcon } from "./ClusterIcon";
import { ScoreSubmit } from "./ScoreSubmit";
import { ROUND_SIZE } from "@/lib/game-engine";
import { clusterInfo } from "@/lib/questions";
import { LEVELS, LEVEL_KEYS, MAX_PER_PROMPT, ft } from "@/lib/scoring";
import type { RecordOutcome } from "@/lib/stats";
import type { ClusterChoice, LogEntry, Mode } from "@/types";

export const MODE_NAME: Record<Mode, string> = { daily: "Daily climb", practice: "Practice", unlimited: "Unlimited" };

export function EndView({ cluster, mode, log, score, outcome, day, onAgain, onHome }: { cluster: ClusterChoice; mode: Mode; log: LogEntry[]; score: number; outcome: RecordOutcome | null; day: number; onAgain: () => void; onHome: () => void }) {
  const n = log.length, max = n * MAX_PER_PROMPT;
  const glass = log.filter((l) => l.level === 6).length, miss = log.filter((l) => l.level === -1).length;
  const perfect = mode !== "unlimited" && n === ROUND_SIZE && score >= max;
  let note = "Answer boards are open in the round review below.";
  if (!outcome) note = "Today's daily was already logged, so this replay was not added to your stats.";
  else if (mode === "daily") note = `Daily streak: ${outcome.streak} day${outcome.streak === 1 ? "" : "s"}. ${note}`;
  else if (outcome.previousBest && !outcome.newBest) note = `Your best in this mode is ${ft(outcome.previousBest)} ft. ${note}`;
  return (
    <div className="view">
      <div className="panel tall">
        <div className="headrow">
          <div className="lbl endlbl" id="endLabel"><ClusterIcon cluster={cluster} size={24} />{clusterInfo(cluster).short} · {MODE_NAME[mode]} · final altitude</div>
          {outcome?.newBest && outcome.previousBest > 0 && <span className="newbest">New personal best</span>}
        </div>
        <h2 id="endTitle">{perfect ? "7,000 ft. You took the glass." : `You topped out at ${ft(score)} ft.`}</h2>
        <p id="endLine">
          {score}{mode === "unlimited" ? ` points across ${n} prompts` : ` of ${max} points`}, with {glass ? `${glass} DECA Glass answer${glass > 1 ? "s" : ""}` : "no DECA Glass answers"}.
        </p>
        <div className="tally">
          {LEVEL_KEYS.slice().reverse().map((k) => {
            const c = log.filter((l) => l.level === k).length;
            return c ? <span key={k} className={`c${k}`}>{c} × {LEVELS[k].name}</span> : null;
          })}
          {miss > 0 && <span className="cx">{miss} × No credit</span>}
        </div>
        <p className="mute" id="endNote">{note}</p>
        {/* the leaderboard only knows the mixed daily round for now */}
        {cluster === "all" && mode === "daily" && outcome && <ScoreSubmit day={day} answers={log.map((l) => l.typed)} />}
      </div>
      <div className="dock wrapok">
        <button type="button" id="again" onClick={onAgain}>Play again</button>
        <button type="button" className="ghost" id="endHome" onClick={onHome}>Home</button>
      </div>
    </div>
  );
}
