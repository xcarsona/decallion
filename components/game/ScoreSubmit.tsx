"use client";
import Link from "next/link";
import { useState } from "react";
import { useToday } from "@/components/ui/useToday";
import { clusterInfo } from "@/lib/questions";
import type { ClusterChoice } from "@/types";

type State = { kind: "idle" } | { kind: "sending" } | { kind: "done"; rank: number | null } | { kind: "error"; message: string };

function savedName(): string {
  try {
    return localStorage.getItem("decallion-name") ?? "";
  } catch {
    return "";
  }
}

/** Posts the typed answers, not the score: the server rebuilds that cluster's round and re-scores them. */
export function ScoreSubmit({ day, cluster, answers }: { day: number; cluster: ClusterChoice; answers: string[] }) {
  const [name, setName] = useState(savedName);
  const [state, setState] = useState<State>({ kind: "idle" });
  const board = clusterInfo(cluster).short;
  const today = useToday();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setState({ kind: "sending" });
    try {
      const res = await fetch("/api/scores", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, day, cluster, answers }) });
      const data = await res.json();
      if (!res.ok) return setState({ kind: "error", message: data.error ?? "Could not post your score." });
      try {
        localStorage.setItem("decallion-name", data.name);
      } catch { /* storage blocked */ }
      setState({ kind: "done", rank: typeof data.rank === "number" ? data.rank : null });
    } catch {
      setState({ kind: "error", message: "Could not reach the leaderboard. Check your connection and try again." });
    }
  }

  // The score goes under the day the round was started on. If midnight has passed since, that is yesterday's board.
  const isToday = day === today;
  if (state.kind === "done") {
    return (
      <p id="lbDone">
        Posted{state.rank ? `. You are #${state.rank} in ${board}` : ` to the ${board} board`} {isToday ? "today" : "for yesterday's round"}.{" "}
        <Link href={`/leaderboard?cluster=${cluster}`}>See the leaderboard</Link>{!isToday && ". It is under Yesterday."}
      </p>
    );
  }
  return (
    <form className="lbform" onSubmit={submit}>
      <label htmlFor="lbName" className="mute" id="lbLabel">Post to {isToday ? "today" : "yesterday"}&apos;s {board} leaderboard</label>
      <div className="row" style={{ justifyContent: "flex-start" }}>
        <input id="lbName" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Display name" maxLength={16} autoComplete="nickname" />
        <button type="submit" className="mini" disabled={state.kind === "sending"}>{state.kind === "sending" ? "Posting" : "Post score"}</button>
      </div>
      {state.kind === "error" && <p className="cx" id="lbError" style={{ color: "var(--c)" }}>{state.message}</p>}
    </form>
  );
}
