"use client";
import { useEffect, useState } from "react";
import { ClusterIcon } from "./ClusterIcon";
import { DAILY_MIN, ROUND_SIZE, STRIKES, dailyEnabled, inCluster, msUntilNextDay } from "@/lib/game-engine";
import { QUESTIONS, clusterInfo } from "@/lib/questions";
import { ft } from "@/lib/scoring";
import { bestOf, dailyOf, liveStreak, type Stats } from "@/lib/stats";
import type { ClusterChoice, Mode } from "@/types";

function NextRound() {
  const [ms, setMs] = useState(() => msUntilNextDay());
  useEffect(() => {
    const id = setInterval(() => setMs(msUntilNextDay()), 30000);
    return () => clearInterval(id);
  }, []);
  const h = Math.floor(ms / 3600000), m = Math.floor((ms % 3600000) / 60000);
  return <span id="nextRound">Next round in {h}h {m}m.</span>;
}

/** Step two: the three modes for the chosen cluster, with today's daily status and the player's best in each. */
export function ModePicker({ cluster, stats, today, yesterday, onStart, onPractice, onBack }: { cluster: ClusterChoice; stats: Stats; today: number; yesterday: number; onStart: (mode: Mode) => void; onPractice: () => void; onBack: () => void }) {
  const info = clusterInfo(cluster);
  const count = inCluster(QUESTIONS, cluster).length;
  const open = dailyEnabled(QUESTIONS, cluster);
  const daily = dailyOf(stats, cluster);
  const streak = liveStreak(stats, cluster, today, yesterday);
  const best = (mode: Mode) => {
    const b = bestOf(stats, cluster, mode);
    return <em className="best" id={`best-${mode}`}>{b ? `Best: ${ft(b)} ft` : "No runs yet"}</em>;
  };
  let status = `${ROUND_SIZE} prompts, the same for everyone today.`;
  if (!open) status = `Opens when this cluster has ${DAILY_MIN} prompts (${count} so far).`;
  else if (daily.last === today) status = `Logged today: ${ft(daily.score)} ft. Replays do not count.`;
  return (
    <div className="view modes">
      <div className="panel tall">
        <div className="modehead">
          <ClusterIcon cluster={cluster} />
          <div>
            <div className="lbl">Step 2 of 2<span className="more"> · choose a climb</span></div>
            <h2 id="modeTitle">{info.name}</h2>
          </div>
        </div>
        <div className="menu">
          <button type="button" id="mDaily" disabled={!open} autoFocus={open} onClick={() => onStart("daily")}>
            <b>Daily climb</b>
            <span>
              <span id="dailyStatus">{status}</span> <NextRound />
              {streak > 0 && <> <span id="dailyStreak">Streak: {streak} day{streak === 1 ? "" : "s"}.</span></>}
              {best("daily")}
            </span>
          </button>
          <button type="button" id="mPractice" disabled={!count} autoFocus={!open} onClick={onPractice}>
            <b>Practice</b>
            <span>
              {cluster === "all" ? "Pick clusters, difficulty and timer." : "Pick difficulty and timer."}
              {best("practice")}
            </span>
          </button>
          <button type="button" id="mUnlimited" disabled={!count} onClick={() => onStart("unlimited")}>
            <b>Unlimited</b>
            <span>
              Keep climbing until {STRIKES} misses.
              {best("unlimited")}
            </span>
          </button>
        </div>
      </div>
      <div className="dock wrapok">
        <button type="button" className="ghost" id="modeBack" onClick={onBack}>Back</button>
      </div>
    </div>
  );
}
