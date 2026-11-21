"use client";
import { useEffect, useSyncExternalStore } from "react";
import { loadDefinitions, type Definitions } from "@/lib/questions/defs";
import type { ClusterId } from "@/types";

/* The definitions loaded so far, per cluster. A cluster that is missing here is still loading (or was never asked for). */
type Loaded = Partial<Record<ClusterId, Definitions>>;
let loaded: Loaded = {};
const asked = new Set<ClusterId>();
const listeners = new Set<() => void>();

function request(cluster: ClusterId) {
  if (asked.has(cluster)) return;
  asked.add(cluster);
  loadDefinitions(cluster).then(
    (defs) => {
      loaded = { ...loaded, [cluster]: defs };
      listeners.forEach((fn) => fn());
    },
    // could not load (offline, say): forget the attempt, so the next card or page that needs it tries again
    () => asked.delete(cluster),
  );
}
function subscribe(fn: () => void) {
  listeners.add(fn);
  return () => void listeners.delete(fn);
}
const snapshot = () => loaded;

/** Loads the definitions of the given clusters the first time they are needed. `clusters` is a comma-separated list
    such as "fin" or "fin,mkt" (a string, so it can be an effect dependency). */
export function useDefinitions(clusters: string): Loaded {
  useEffect(() => {
    for (const c of clusters.split(",")) if (c) request(c as ClusterId);
  }, [clusters]);
  return useSyncExternalStore(subscribe, snapshot, snapshot);
}
