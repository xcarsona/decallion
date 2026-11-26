"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, useSyncExternalStore } from "react";
import { ClusterIcon } from "@/components/game/ClusterIcon";
import { useToday } from "@/components/ui/useToday";
// from the clusters file, not the "@/lib/questions" barrel, which would bring the whole question bank to this page
import { CLUSTER_IDS, clusterInfo, isClusterChoice } from "@/lib/questions/clusters";
import { LEVELS, ft } from "@/lib/scoring";
import type { ClusterChoice, ScoreRow } from "@/types";

type Scope = "today" | "yesterday" | "all";
type Result = { status: "ready"; rows: ScoreRow[] } | { status: "error"; message: string };
const SCOPES: [Scope, string][] = [["today", "Today"], ["yesterday", "Yesterday"], ["all", "All-time best"]];
const TABS: ClusterChoice[] = ["all", ...CLUSTER_IDS];
const CLUSTER_KEY = "decallion-board-cluster";

function read(key: string): string {
  try {
    return localStorage.getItem(key) ?? "";
  } catch {
    return "";
  }
}
const noSubscribe = () => () => {};
const savedCluster = () => read(CLUSTER_KEY);
const savedName = () => read("decallion-name").toLowerCase();
const nothing = () => "";
/** Where to report a name. Shown only when the site owner has set an address. */
const CONTACT_EMAIL = (process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "carson.alexander1@outlook.com").trim();
/** The words for one coloured square: the level's name, or "No credit" for a miss (stored as 0). */
const levelName = (level: number) => (level >= 1 && level <= 6 ? LEVELS[level as keyof typeof LEVELS].name : "No credit");

export function Board() {
  const params = useSearchParams();
  const [scope, setScope] = useState<Scope>("today");
  // Read after hydration, so the first render matches the server's.
  const stored = useSyncExternalStore(noSubscribe, savedCluster, nothing);
  const me = useSyncExternalStore(noSubscribe, savedName, nothing);
  /* ?cluster= in the address wins, then the tab remembered from last time. Clicking a tab rewrites the address
     (see pickCluster), so there is no separate "picked" state: this page is kept in memory between visits, and such
     a state would beat the ?cluster= of a later link to another cluster's board. */
  const fromUrl = params.get("cluster");
  const cluster: ClusterChoice = isClusterChoice(fromUrl) ? fromUrl : isClusterChoice(stored) ? stored : "all";

  // refetch when the day changes (midnight Eastern), so Today does not keep showing yesterday's scores
  const today = useToday();
  const want = `${scope}:${cluster}:${today}`;
  const [loaded, setLoaded] = useState<{ key: string; result: Result } | null>(null);
  const state: Result | { status: "loading" } = loaded && loaded.key === want ? loaded.result : { status: "loading" };

  useEffect(() => {
    let live = true;
    const key = `${scope}:${cluster}:${today}`;
    fetch(`/api/scores?scope=${scope}&cluster=${cluster}`)
      .then(async (res) => {
        const data = await res.json();
        if (!live) return;
        setLoaded({ key, result: res.ok ? { status: "ready", rows: data.rows } : { status: "error", message: data.error ?? "Could not load the leaderboard." } });
      })
      .catch(() => live && setLoaded({ key, result: { status: "error", message: "Could not reach the leaderboard. Check your connection and reload." } }));
    return () => {
      live = false;
    };
  }, [scope, cluster, today]);

  function pickCluster(c: ClusterChoice) {
    try {
      localStorage.setItem(CLUSTER_KEY, c);
    } catch { /* storage blocked */ }
    // Next.js picks this up in useSearchParams, which switches the tab; a reload or a shared link opens the same one
    window.history.replaceState(null, "", `/leaderboard?cluster=${c}`);
  }

  const info = clusterInfo(cluster);
  return (
    <section className="card">
      <div className="headrow">
        <h2>Daily leaderboard</h2>
        <span className="mute" id="lbCluster">{info.name}</span>
      </div>
      <div className="lbtabs">
        <div className="chips" id="lbClusters" role="group" aria-label="Cluster">
          {TABS.map((c) => {
            const tab = clusterInfo(c);
            return (
              <button type="button" key={c} data-cluster={c} aria-pressed={cluster === c} style={{ "--cc": tab.color } as React.CSSProperties} onClick={() => pickCluster(c)}>
                <ClusterIcon cluster={c} size={18} />
                {tab.short}
              </button>
            );
          })}
        </div>
        <div className="chips" id="lbScopes" role="group" aria-label="Day">
          {SCOPES.map(([s, label]) => (
            <button type="button" key={s} data-scope={s} aria-pressed={scope === s} onClick={() => setScope(s)}>{label}</button>
          ))}
        </div>
      </div>
      <p className="mute">One entry per name, per day, per cluster. Scores are worked out on the server from the answers you typed. Rounds change at midnight Eastern Time.</p>
      {CONTACT_EMAIL && <p className="mute" id="lbReport">To report a name, email <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a></p>}
      {state.status === "loading" && <p className="mute" aria-busy="true">Loading scores</p>}
      {state.status === "error" && <p id="lbPageError" style={{ color: "var(--miss)" }}>{state.message}</p>}
      {state.status === "ready" && state.rows.length === 0 && <p id="lbEmpty">No {info.short} scores here yet. <Link href="/">Play the daily climb</Link> and post the first one.</p>}
      {state.status === "ready" && state.rows.length > 0 && (
        <div className="tablewrap">
          <table className="board" id="lbTable">
            <thead>
              <tr><th>#</th><th>Name</th><th className="num">Altitude</th><th className="num">Score</th><th>Answers</th>{scope === "all" && <th>Day</th>}</tr>
            </thead>
            <tbody>
              {state.rows.map((r, i) => (
                <tr key={`${r.day}-${r.name}`} className={r.name.toLowerCase() === me ? "me" : undefined}>
                  <td className="rank">{i + 1}</td>
                  <td>{r.name}</td>
                  <td className="num">{ft(r.score)} ft</td>
                  <td className="num">{r.score}</td>
                  <td><span className="sq" role="img" aria-label={r.levels.map(levelName).join(", ")}>{r.levels.map((l, j) => <i key={j} className={l ? `c${l}` : undefined} />)}</span></td>
                  {scope === "all" && <td>{r.day}</td>}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
