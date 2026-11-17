/* The five career clusters the game is organised around, plus the "All clusters" mix.
   Colours are chosen to read on the navy background and to stay apart from the answer-level colours in lib/scoring.
   `icon` names an original pixel icon drawn in components/game/ClusterIcon.tsx. */
import type { ClusterChoice, ClusterId } from "@/types";

export interface ClusterInfo {
  id: ClusterChoice;
  name: string;
  /** Short label for tight spaces such as the HUD and tabs. */
  short: string;
  color: string;
  icon: "briefcase" | "lightbulb" | "dollar" | "globe" | "phone" | "all";
}

export const CLUSTERS: Record<ClusterId, ClusterInfo> = {
  bma: { id: "bma", name: "Business Management + Administration", short: "Business Mgmt", color: "#ffd43b", icon: "briefcase" },
  ent: { id: "ent", name: "Entrepreneurship", short: "Entrepreneurship", color: "#c9d1dd", icon: "lightbulb" },
  fin: { id: "fin", name: "Finance", short: "Finance", color: "#4fdb82", icon: "dollar" },
  ht: { id: "ht", name: "Hospitality + Tourism", short: "Hospitality", color: "#4f9dff", icon: "globe" },
  mkt: { id: "mkt", name: "Marketing", short: "Marketing", color: "#ff5562", icon: "phone" },
};
export const CLUSTER_IDS: ClusterId[] = ["bma", "ent", "fin", "ht", "mkt"];
export const ALL_CLUSTERS: ClusterInfo = { id: "all", name: "All clusters", short: "All clusters", color: "#7fe3f2", icon: "all" };
export const CLUSTER_CHOICES: ClusterChoice[] = [...CLUSTER_IDS, "all"];

export function clusterInfo(choice: ClusterChoice): ClusterInfo {
  return choice === "all" ? ALL_CLUSTERS : CLUSTERS[choice];
}
export function isClusterChoice(value: unknown): value is ClusterChoice {
  return typeof value === "string" && (CLUSTER_CHOICES as string[]).includes(value);
}

/** The twelve categories the game used before clusters, mapped to their cluster. Used to migrate saved stats. */
export const LEGACY_CATEGORY_CLUSTER: Record<string, ClusterId> = {
  "Business Management": "bma",
  "Business Administration": "bma",
  "Principles of Business": "bma",
  Economics: "bma",
  "Business Law": "bma",
  Entrepreneurship: "ent",
  Finance: "fin",
  Accounting: "fin",
  "Personal Financial Literacy": "fin",
  "Hospitality and Tourism": "ht",
  Marketing: "mkt",
  "Professional Selling": "mkt",
};
