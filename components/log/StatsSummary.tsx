"use client";
import Link from "next/link";
import { clusterInfo } from "@/lib/questions";
import { ft } from "@/lib/scoring";
import { bestOf, isPersistent, liveStreak, totalsOf, type Stats } from "@/lib/stats";
import type { ClusterChoice } from "@/types";

const avg = (pts: number, n: number) => (n > 0 ? Math.round(pts / n) : 0);

/* The short stats card under the game. `cluster` is null on the cluster picker, where it shows overall figures.
   The full breakdown is on /log. */
export function StatsSummary({ stats, cluster, today, yesterday }: { stats: Stats; cluster: ClusterChoice | null; today: number; yesterday: number }) {
  let figs: [string | number, string][];
  if (cluster) {
    const t = totalsOf(stats, cluster);
    figs = [
      [t.games, "Rounds played"],
      [liveStreak(stats, cluster, today, yesterday), "Daily streak"],
      [ft(bestOf(stats, cluster, "daily")), "Best daily ft"],
      [avg(t.pts, t.prompts), "Avg pts / prompt"],
    ];
  } else {
    figs = [
      [stats.games, "Rounds played"],
      [stats.prompts, "Prompts answered"],
      [avg(stats.pts, stats.prompts), "Avg pts / prompt"],
      [stats.levels[6] ?? 0, "Glass answers"],
    ];
  }
  return (
    <section className="card" id="statsCard" data-cluster={cluster ?? "overall"}>
      <div className="headrow">
        <h2>Your stats</h2>
        <span className="mute">{cluster ? clusterInfo(cluster).short : "Every cluster"}</span>
      </div>
      <div className="figs" id="figs">
        {figs.map(([v, label]) => <div key={label}><b>{v}</b><span>{label}</span></div>)}
      </div>
      <p><Link href="/log" id="logLink">Open training log</Link></p>
      <p className="mute">{isPersistent() ? "Saved in this browser only." : "This browser is blocking storage, so stats last only until you close the page."}</p>
    </section>
  );
}
