import { LevelIcon } from "./LevelIcon";
import { LEVELS, ft } from "@/lib/scoring";
import type { LogEntry } from "@/types";

export function RevealView({ entry, missNote, last, onNext }: { entry: LogEntry; missNote: string; last: boolean; onNext: () => void }) {
  const hit = entry.level !== -1;
  const tier = entry.level !== -1 ? LEVELS[entry.level].name : entry.timedOut && !entry.typed ? "Out of time" : "No credit";
  /* Focus lands on the button, and the result above it is already on the page when this mounts, so a screen reader
     often says only the button. Its spoken name therefore carries the result, then its visible words. */
  const action = last ? "See results" : "Ascend";
  const spoken = hit ? `${tier}, plus ${entry.pts} points. ${action}` : `${tier}. ${action}`;
  return (
    <div className="view">
      <div className="vbody">
        <div className={`reveal ${hit ? `c${entry.level}` : "cx"}`} aria-live="polite">
          <LevelIcon level={entry.level} />
          <strong id="bTier">{tier}</strong>
          <div className="ans">{hit ? `“${entry.row![0]}”` : entry.typed ? `“${entry.typed}”` : ""}</div>
          <div className="gain"><b>+{entry.pts} PTS</b> · climb {ft(entry.pts)} ft</div>
          <div className="note">{entry.level !== -1 ? LEVELS[entry.level].note : missNote}</div>
        </div>
      </div>
      <div className="dock">
        <button type="button" className="ghost" id="next" aria-label={spoken} autoFocus onClick={onNext}>{last ? "See results" : "Ascend ▲"}</button>
      </div>
    </div>
  );
}
