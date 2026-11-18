"use client";
import { useSyncExternalStore } from "react";
import { dayKey, msUntilNextDay } from "@/lib/game-engine";

function subscribe(fn: () => void): () => void {
  let id: ReturnType<typeof setTimeout>;
  const arm = () => {
    id = setTimeout(() => {
      fn();
      arm();
    }, msUntilNextDay() + 250);
  };
  arm();
  return () => clearTimeout(id);
}
const now = () => dayKey();

/** Today's UTC day key. It moves on at midnight UTC, and is checked again whenever a page kept in memory is shown. */
export function useToday(): number {
  return useSyncExternalStore(subscribe, now, now);
}
