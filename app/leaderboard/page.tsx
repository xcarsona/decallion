import type { Metadata } from "next";
import { Board } from "./Board";

export const metadata: Metadata = { title: "Leaderboard · Decallion" };

export default function LeaderboardPage() {
  return <Board />;
}
