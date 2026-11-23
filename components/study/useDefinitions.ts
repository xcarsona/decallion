"use client";
import { useEffect, useSyncExternalStore } from "react";
import { loadDefinitions, type Definitions } from "@/lib/questions/defs";
import type { ClusterId } from "@/types";

/* The definitions loaded so far, per cluster. A cluster that is missing here is still loading (or was never asked for). */
type Loaded = Partial<Record<ClusterId, Definitions>>;
let loaded: Loaded = {};
const asked = new Set<ClusterId>();
/** Clusters whose definitions could not be loaded (offline, say). They are asked for again when the connection
    returns or the next card needs them. */
let failed: ReadonlySet<ClusterId> = new Set();
const listeners = new Set<() => void>();
let watchingOnline = false;

function request(cluster: ClusterId) {
  if (asked.has(cluster)) return;
  asked.add(cluster);
  loadDefinitions(cluster).then(
    (defs) => {
      loaded = { ...loaded, [cluster]: defs };
      listeners.forEach((fn) => fn());
    },
    // could not load (offline, say): say so, and forget the attempt so it can be tried again
    () => {
      asked.delete(cluster);
      failed = new Set([...failed, cluster]);
      listeners.forEach((fn) => fn());
    },
  );
}
/** Asks again for everything that failed. */
export function retryDefinitions() {
  const again = [...failed];
  failed = new Set();
  listeners.forEach((fn) => fn());
  for (const c of again) request(c);
}
function subscribe(fn: () => void) {
  if (!watchingOnline && typeof window !== "undefined") {
    watchingOnline = true;
    window.addEventListener("online", retryDefinitions);
  }
  listeners.add(fn);
  return () => void listeners.delete(fn);
}
const snapshot = () => loaded;
const failedSnapshot = () => failed;
/** The clusters whose definitions could not be loaded. */
export function useDefinitionsFailed(): ReadonlySet<ClusterId> {
  return useSyncExternalStore(subscribe, failedSnapshot, failedSnapshot);
}

/** Loads the definitions of the given clusters the first time they are needed. `clusters` is a comma-separated list
    such as "fin" or "fin,mkt" (a string, so it can be an effect dependency). */
export function useDefinitions(clusters: string): Loaded {
  useEffect(() => {
    for (const c of clusters.split(",")) if (c) request(c as ClusterId);
  }, [clusters]);
  return useSyncExternalStore(subscribe, snapshot, snapshot);
}
