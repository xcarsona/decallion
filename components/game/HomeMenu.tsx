"use client";
import { useEffect, useState } from "react";
import { msUntilNextDay } from "@/lib/game-engine";
import { ft } from "@/lib/scoring";
import type { Mode } from "@/types";

function NextRound() {
  const [ms, setMs] = useState(() => msUntilNextDay());
  useEffect(() => {
    const id = setInterval(() => setMs(msUntilNextDay()), 30000);
    return () => clearInterval(id);
  }, []);
  const h = Math.floor(ms / 3600000), m = Math.floor((ms % 3600000) / 60000);
  return <>Next round in {h}h {m}m</>;
}

export function HomeMenu({ dailyScore, onStart, onPractice }: { dailyScore: number | null; onStart: (mode: Mode) => void; onPractice: () => void }) {
  return (
    <div className="view">
      <div className="panel tall">
        <div className="lbl">Choose a climb</div>
        <h2>The answer nobody else gives climbs highest.</h2>
        <div className="menu">
          <button type="button" id="mDaily" onClick={() => onStart("daily")}>
            <b>Daily climb</b>
            <span>
              {dailyScore === null ? "7 prompts, the same for everyone today. " : `Logged today: ${ft(dailyScore)} ft. Replays do not count. `}
              <NextRound />
            </span>
          </button>
          <button type="button" id="mPractice" onClick={onPractice}>
            <b>Practice</b>
            <span>Pick categories, difficulty and timer</span>
          </button>
          <button type="button" id="mEndless" onClick={() => onStart("endless")}>
            <b>Endless</b>
            <span>Keep climbing until three misses</span>
          </button>
        </div>
      </div>
    </div>
  );
}
