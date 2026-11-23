import type { Metadata } from "next";
import { Suspense } from "react";
import { Board } from "./Board";
import { pageMetadata } from "@/app/site-info";

export const metadata: Metadata = pageMetadata("Leaderboard", "/leaderboard");

export default function LeaderboardPage() {
  // Board reads ?cluster= with useSearchParams, which needs a Suspense boundary on a prerendered page.
  return (
    <Suspense fallback={<section className="card"><h2>Daily leaderboard</h2><p className="mute" aria-busy="true">Loading scores</p></section>}>
      <Board />
    </Suspense>
  );
}
