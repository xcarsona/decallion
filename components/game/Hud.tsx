import { ft } from "@/lib/scoring";

export type Pip = "done" | "now" | "";

export function Hud({ shown, pips, label }: { shown: number; pips: Pip[]; label: string }) {
  return (
    <div className="hud">
      <div className="box">
        <span>ALTITUDE</span>
        <b>{ft(shown)} ft</b>
      </div>
      <div className="mid">
        <div className="pips">{pips.map((p, i) => <i key={i} className={p} />)}</div>
        <div>{label}</div>
      </div>
      <div className="box r">
        <span>SCORE</span>
        <b>{shown}</b>
      </div>
    </div>
  );
}
