"use client";
import { useEffect, useRef } from "react";
import { ClusterIcon } from "./ClusterIcon";
import { CLUSTER_CHOICES, clusterInfo } from "@/lib/questions";
import type { ClusterChoice } from "@/types";

/* Each icon bobs at its own pace: [seconds per swing, start offset in seconds]. */
const BOB: [number, number][] = [[2.6, 0], [3.3, -1.1], [2.9, -2], [3.6, -0.6], [2.4, -1.6], [3.1, -2.6]];

/** Step one: five cluster icons plus All clusters, floating over the scene. */
export function ClusterPicker({ focus, onPick }: { focus: ClusterChoice | null; onPick: (cluster: ClusterChoice) => void }) {
  const grid = useRef<HTMLDivElement>(null);
  const first = useRef(focus);
  useEffect(() => {
    // coming back from the mode step: put focus where the player left it
    if (first.current) grid.current?.querySelector<HTMLButtonElement>(`[data-cluster="${first.current}"]`)?.focus();
  }, []);

  function onKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    const buttons = Array.from(grid.current?.querySelectorAll<HTMLButtonElement>("button") ?? []);
    const at = buttons.indexOf(document.activeElement as HTMLButtonElement);
    if (at < 0) return;
    const cols = buttons.filter((b) => b.offsetTop === buttons[0].offsetTop).length || 1;
    const step: Record<string, number> = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -cols, ArrowDown: cols };
    let to = at;
    if (e.key in step) to = at + step[e.key];
    else if (e.key === "Home") to = 0;
    else if (e.key === "End") to = buttons.length - 1;
    else return;
    e.preventDefault();
    if (to >= 0 && to < buttons.length) buttons[to].focus();
  }

  return (
    <div className="view pick">
      <div className="pickhead">
        <div className="lbl">Step 1 of 2</div>
        <h2 id="pickTitle">Choose a career cluster</h2>
      </div>
      <div className="cgrid" id="clusterGrid" ref={grid} role="group" aria-labelledby="pickTitle" onKeyDown={onKeyDown}>
        {CLUSTER_CHOICES.map((c, i) => {
          const info = clusterInfo(c);
          const style = { "--cc": info.color, "--bd": `${BOB[i % BOB.length][0]}s`, "--bdl": `${BOB[i % BOB.length][1]}s` } as React.CSSProperties;
          return (
            <button type="button" key={c} className="cbtn" data-cluster={c} style={style} onClick={() => onPick(c)}>
              <span className="float"><ClusterIcon cluster={c} /></span>
              <span className="nm">{info.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
