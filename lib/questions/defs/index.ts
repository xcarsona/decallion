/* A short definition for every answer on every board, shown when a player opens an answer in the round review, the
   training log or the study list. One JSON file per cluster:

     { "FIN-01": { "Stocks": "Shares of ownership in a company ...", "Bonds": "..." }, "FIN-02": { ... } }

   The outer key is the prompt id and the inner key is the answer exactly as it is displayed on the board. A definition
   explains the answer in the setting of that prompt. The files are loaded only when a definition is first needed, so
   they do not slow the game down. `npm test` checks that every answer has a definition and that none is left over. */
import type { ClusterId } from "@/types";

/** prompt id -> displayed answer -> definition */
export type Definitions = Record<string, Record<string, string>>;

const loaders: Record<ClusterId, () => Promise<{ default: unknown }>> = {
  bma: () => import("./bma.json"),
  ent: () => import("./ent.json"),
  fin: () => import("./fin.json"),
  ht: () => import("./ht.json"),
  mkt: () => import("./mkt.json"),
};
const cache = new Map<ClusterId, Promise<Definitions>>();

/** The definitions for one cluster. Rejects if they cannot be loaded (for example offline); a failure is not
    remembered, so the next call tries again. */
export function loadDefinitions(cluster: ClusterId): Promise<Definitions> {
  let pending = cache.get(cluster);
  if (!pending) {
    pending = loaders[cluster]().then((m) => m.default as Definitions);
    cache.set(cluster, pending);
    pending.catch(() => cache.delete(cluster));
  }
  return pending;
}

export function definitionOf(defs: Definitions | null | undefined, promptId: string, answer: string): string | null {
  return defs?.[promptId]?.[answer] ?? null;
}
