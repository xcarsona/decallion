"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Chip } from "@/components/ui/Chip";
import { ft } from "@/lib/scoring";
import type { ScoreRow } from "@/types";

type Scope = "today" | "yesterday" | "all";
type State = { status: "loading" } | { status: "ready"; rows: ScoreRow[] } | { status: "error"; message: string };
const SCOPES: [Scope, string][] = [["today", "Today"], ["yesterday", "Yesterday"], ["all", "All-time best"]];

function savedName(): string {
  try {
    return (localStorage.getItem("decallion-name") ?? "").toLowerCase();
  } catch {
    return "";
  }
}

export function Board() {
  const [scope, setScope] = useState<Scope>("today");
  const [state, setState] = useState<State>({ status: "loading" });
  const [me, setMe] = useState("");

  useEffect(() => {
    let live = true;
    fetch(`/api/scores?scope=${scope}`)
      .then(async (res) => {
        const data = await res.json();
        if (!live) return;
        setMe(savedName());
        setState(res.ok ? { status: "ready", rows: data.rows } : { status: "error", message: data.error ?? "Could not load the leaderboard." });
      })
      .catch(() => live && setState({ status: "error", message: "Could not reach the leaderboard. Check your connection and reload." }));
    return () => {
      live = false;
    };
  }, [scope]);

  return (
    <section className="card">
      <div className="headrow">
        <h2>Daily leaderboard</h2>
        <div className="chips">
          {SCOPES.map(([s, label]) => (
            <Chip key={s} label={label} pressed={scope === s} onClick={() => { setState({ status: "loading" }); setScope(s); }} />
          ))}
        </div>
      </div>
      <p className="mute">One entry per name per day. Scores are worked out on the server from the answers you typed. The round changes at midnight UTC.</p>
      {state.status === "loading" && <p className="mute" aria-busy="true">Loading scores</p>}
      {state.status === "error" && <p id="lbPageError" style={{ color: "var(--miss)" }}>{state.message}</p>}
      {state.status === "ready" && state.rows.length === 0 && <p>No scores yet. <Link href="/">Play the daily climb</Link> and post the first one.</p>}
      {state.status === "ready" && state.rows.length > 0 && (
        <div className="tablewrap">
          <table className="board">
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
                  <td><span className="sq">{r.levels.map((l, j) => <i key={j} className={l ? `c${l}` : undefined} />)}</span></td>
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
