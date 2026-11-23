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
  // a timer does not always fire on time on a phone that was asleep, so look again whenever the page is shown
  const look = () => {
    if (document.visibilityState === "visible") fn();
  };
  document.addEventListener("visibilitychange", look);
  window.addEventListener("focus", fn);
  return () => {
    clearTimeout(id);
    document.removeEventListener("visibilitychange", look);
    window.removeEventListener("focus", fn);
  };
}
const now = () => dayKey();

/** Today's day key (the date in Eastern Time). It moves on at midnight Eastern, and is checked again whenever a page
    kept in memory is shown. */
export function useToday(): number {
  return useSyncExternalStore(subscribe, now, now);
}
