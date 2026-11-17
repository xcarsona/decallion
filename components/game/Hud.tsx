import { ClusterIcon } from "./ClusterIcon";
import { ft } from "@/lib/scoring";
import type { ClusterChoice } from "@/types";

export type Pip = "done" | "now" | "";

/** `cluster` is the chosen cluster, or null while the player is still picking one. */
export function Hud({ shown, pips, label, cluster }: { shown: number; pips: Pip[]; label: string; cluster: ClusterChoice | null }) {
  return (
    <div className="hud">
      <div className="box">
        <span>ALTITUDE</span>
        <b>{ft(shown)} ft</b>
      </div>
      <div className="mid">
        <div className="pips">{pips.map((p, i) => <i key={i} className={p} />)}</div>
        <div className="count" id="hudCount" data-cluster={cluster ?? undefined}>
          {cluster && <ClusterIcon cluster={cluster} />}
          <span>{label}</span>
        </div>
      </div>
      <div className="box r">
        <span>SCORE</span>
        <b>{shown}</b>
      </div>
    </div>
  );
}
