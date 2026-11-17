import { LevelIcon } from "./LevelIcon";
import { LEVELS, ft } from "@/lib/scoring";
import type { LogEntry } from "@/types";

export function RevealView({ entry, missNote, last, onNext }: { entry: LogEntry; missNote: string; last: boolean; onNext: () => void }) {
  const hit = entry.level !== -1;
  return (
    <div className="view">
      <div className={`reveal ${hit ? `c${entry.level}` : "cx"}`} aria-live="polite">
        <LevelIcon level={entry.level} />
        <strong id="bTier">{entry.level !== -1 ? LEVELS[entry.level].name : entry.timedOut && !entry.typed ? "Out of time" : "No credit"}</strong>
        <div className="ans">{hit ? `“${entry.row![0]}”` : entry.typed ? `“${entry.typed}”` : ""}</div>
        <div className="gain"><b>+{entry.pts} PTS</b> · climb {ft(entry.pts)} ft</div>
        <div className="note">{entry.level !== -1 ? LEVELS[entry.level].note : missNote}</div>
      </div>
      <div className="dock">
        <button type="button" className="ghost" id="next" autoFocus onClick={onNext}>{last ? "See results" : "Ascend ▲"}</button>
      </div>
    </div>
  );
}
