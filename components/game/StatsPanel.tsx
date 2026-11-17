"use client";
import { useState } from "react";
import { CLUSTERS } from "@/lib/questions";
import { LEVELS, LEVEL_KEYS, ft } from "@/lib/scoring";
import { bestOf, dailyOf, isPersistent, liveStreak, type Stats } from "@/lib/stats";
import type { ClusterChoice, ClusterId } from "@/types";

export function StatsPanel({ stats, cluster, today, yesterday, onReset }: { stats: Stats; cluster: ClusterChoice; today: number; yesterday: number; onReset: () => void }) {
  const [armed, setArmed] = useState(false);
  const figs: [string | number, string][] = [
    [liveStreak(stats, cluster, today, yesterday), "Daily streak"],
    [dailyOf(stats, cluster).bestStreak, "Best streak"],
    [ft(bestOf(stats, cluster, "daily")), "Best daily ft"],
    [ft(bestOf(stats, cluster, "practice")), "Best practice ft"],
    [ft(bestOf(stats, cluster, "unlimited")), "Best unlimited ft"],
    [stats.games, "Rounds played"],
    [stats.prompts ? Math.round(stats.pts / stats.prompts) : 0, "Avg pts / prompt"],
    [stats.levels[6] ?? 0, "Glass answers"],
  ];
  const bars = [...LEVEL_KEYS.map((k) => ({ cls: `c${k}`, name: LEVELS[k].name, n: stats.levels[k] ?? 0 })), { cls: "cx", name: "No credit", n: stats.levels.miss ?? 0 }];
  const played = Object.keys(stats.topics).sort((a, b) => stats.topics[b].pts / stats.topics[b].n - stats.topics[a].pts / stats.topics[a].n);
  const label = (key: string) => { const [c, topic] = key.split("|"); return `${CLUSTERS[c as ClusterId]?.short ?? c} · ${topic}`; };
  const reset = () => {
    if (armed) {
      onReset();
      setArmed(false);
    } else {
      setArmed(true);
      setTimeout(() => setArmed(false), 4000);
    }
  };
  return (
    <section className="card" id="statsCard">
      <div className="headrow">
        <h2>Your stats</h2>
        <button type="button" className="ghost mini" onClick={reset}>{armed ? "Click again to erase" : "Reset stats"}</button>
      </div>
      <div className="figs" id="figs">
        {figs.map(([v, label]) => <div key={label}><b>{v}</b><span>{label}</span></div>)}
      </div>
      <div className="field">
        <span>Answers by level</span>
        <div className="dist">{stats.prompts > 0 && bars.filter((b) => b.n).map((b) => <i key={b.name} className={b.cls} style={{ width: `${(b.n / stats.prompts) * 100}%` }} title={`${b.name}: ${b.n}`} />)}</div>
        <div className="legend">{bars.map((b) => <span key={b.name} className={b.cls}>{b.name} {b.n}</span>)}</div>
      </div>
      <div className="field">
        <span>By topic</span>
        <div className="tablewrap">
          <table>
            <thead><tr><th>Topic</th><th className="num">Prompts</th><th className="num">Avg pts</th><th className="num">Glass</th></tr></thead>
            <tbody id="catRows">
              {played.length === 0 && <tr><td colSpan={4} className="mute">No rounds played yet.</td></tr>}
              {played.map((c) => (
                <tr key={c}><td>{label(c)}</td><td className="num">{stats.topics[c].n}</td><td className="num">{Math.round(stats.topics[c].pts / stats.topics[c].n)}</td><td className="num">{stats.topics[c].glass || 0}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <p className="mute">{isPersistent() ? "Stats are saved in this browser only." : "This browser is blocking storage, so stats last only until you close the page."}</p>
    </section>
  );
}
