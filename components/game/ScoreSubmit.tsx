"use client";
import Link from "next/link";
import { useState } from "react";

type State = { kind: "idle" } | { kind: "sending" } | { kind: "done"; rank: number; score: number } | { kind: "error"; message: string };

function savedName(): string {
  try {
    return localStorage.getItem("decallion-name") ?? "";
  } catch {
    return "";
  }
}

/** Posts the typed answers, not the score: the server re-scores them. */
export function ScoreSubmit({ day, answers }: { day: number; answers: string[] }) {
  const [name, setName] = useState(savedName);
  const [state, setState] = useState<State>({ kind: "idle" });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setState({ kind: "sending" });
    try {
      const res = await fetch("/api/scores", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, day, answers }) });
      const data = await res.json();
      if (!res.ok) return setState({ kind: "error", message: data.error ?? "Could not post your score." });
      try {
        localStorage.setItem("decallion-name", data.name);
      } catch { /* storage blocked */ }
      setState({ kind: "done", rank: data.rank, score: data.score });
    } catch {
      setState({ kind: "error", message: "Could not reach the leaderboard. Check your connection and try again." });
    }
  }

  if (state.kind === "done") {
    return <p id="lbDone">Posted. You are #{state.rank} today. <Link href="/leaderboard">See the leaderboard</Link></p>;
  }
  return (
    <form className="lbform" onSubmit={submit}>
      <label htmlFor="lbName" className="mute">Post to today&apos;s leaderboard</label>
      <div className="row" style={{ justifyContent: "flex-start" }}>
        <input id="lbName" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Display name" maxLength={16} autoComplete="nickname" />
        <button type="submit" className="mini" disabled={state.kind === "sending"}>{state.kind === "sending" ? "Posting" : "Post score"}</button>
      </div>
      {state.kind === "error" && <p className="cx" id="lbError" style={{ color: "var(--c)" }}>{state.message}</p>}
    </form>
  );
}
