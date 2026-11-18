"use client";
import { useEffect, useRef } from "react";
import { ClusterIcon } from "./ClusterIcon";
import { MODE_NAME } from "./EndView";
import { reducedMotion } from "@/components/ui/motion";
import { SECONDS, STRIKES } from "@/lib/game-engine";
import { clusterInfo } from "@/lib/questions";
import type { ClusterChoice, Mode } from "@/types";

const SHOW_MS = 1400;
const SHOW_MS_STILL = 900; // reduced motion: a still card, shown briefly
const ARM_MS = 250; // a double-click on the mode button must not skip the card

/** The card shown when a round starts. The first prompt, and its clock, wait until this is done.
    It is one big button, so a click, Enter or Space skips it. */
export function Intro({ cluster, mode, prompts, timed, onDone }: { cluster: ClusterChoice; mode: Mode; prompts: number; timed: boolean; onDone: () => void }) {
  const done = useRef(onDone);
  const shownAt = useRef(0);
  useEffect(() => {
    done.current = onDone;
  });
  useEffect(() => {
    shownAt.current = performance.now();
    const id = setTimeout(() => done.current(), reducedMotion() ? SHOW_MS_STILL : SHOW_MS);
    return () => clearTimeout(id);
  }, []);

  const info = clusterInfo(cluster);
  let line = `${prompts} prompt${prompts === 1 ? "" : "s"} · ${timed ? `${SECONDS} seconds each` : "No time limit"}`;
  if (mode === "unlimited") line = `Climb until ${STRIKES === 3 ? "three" : STRIKES} misses`;
  return (
    <div className="view">
      <button type="button" className="intro" id="intro" autoFocus onClick={() => { if (performance.now() - shownAt.current > ARM_MS) onDone(); }}>
        <span className="introcard">
          <span className="introicon"><ClusterIcon cluster={cluster} /></span>
          <span className="lbl" id="introMode">{MODE_NAME[mode]}</span>
          <span className="introname" id="introCluster">{info.name}</span>
          <span className="introline" id="introLine">{line}</span>
          <span className="introbar" aria-hidden="true" style={{ "--ms": `${SHOW_MS}ms` } as React.CSSProperties}><i /></span>
          <span className="introskip">Tap or press Enter to skip</span>
        </span>
      </button>
    </div>
  );
}
