"use client";
import { useState } from "react";
import { CATEGORIES } from "@/lib/questions";
import { LEVELS, LEVEL_KEYS, ft } from "@/lib/scoring";
import { isPersistent, liveStreak, type Stats } from "@/lib/stats";

export function StatsPanel({ stats, today, yesterday, onReset }: { stats: Stats; today: number; yesterday: number; onReset: () => void }) {
  const [armed, setArmed] = useState(false);
  const figs: [string | number, string][] = [
    [liveStreak(stats, today, yesterday), "Daily streak"],
    [stats.daily.bestStreak, "Best streak"],
    [ft(stats.best.daily), "Best daily ft"],
    [ft(stats.best.practice), "Best practice ft"],
    [ft(stats.best.endless), "Best endless ft"],
    [stats.games, "Rounds played"],
    [stats.prompts ? Math.round(stats.pts / stats.prompts) : 0, "Avg pts / prompt"],
    [stats.levels[6] ?? 0, "Glass answers"],
  ];
  const bars = [...LEVEL_KEYS.map((k) => ({ cls: `c${k}`, name: LEVELS[k].name, n: stats.levels[k] ?? 0 })), { cls: "cx", name: "No credit", n: stats.levels.miss ?? 0 }];
  const played = CATEGORIES.filter((c) => stats.cats[c]).sort((a, b) => stats.cats[b].pts / stats.cats[b].n - stats.cats[a].pts / stats.cats[a].n);
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
        <span>By category</span>
        <div className="tablewrap">
          <table>
            <thead><tr><th>Category</th><th className="num">Prompts</th><th className="num">Avg pts</th><th className="num">Glass</th></tr></thead>
            <tbody id="catRows">
              {played.length === 0 && <tr><td colSpan={4} className="mute">No rounds played yet.</td></tr>}
              {played.map((c) => (
                <tr key={c}><td>{c}</td><td className="num">{stats.cats[c].n}</td><td className="num">{Math.round(stats.cats[c].pts / stats.cats[c].n)}</td><td className="num">{stats.cats[c].glass || 0}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <p className="mute">{isPersistent() ? "Stats are saved in this browser only." : "This browser is blocking storage, so stats last only until you close the page."}</p>
    </section>
  );
}
