/* Answer levels and points. One point is 10 ft of altitude. */
import type { AnswerRow, Level } from "@/types";

export interface LevelInfo {
  name: string;
  pts: number;
  emoji: string;
  color: string;
  note: string;
}

export const LEVELS: Record<Level, LevelInfo> = {
  1: { name: "Roll Call", pts: 10, emoji: "⬜", color: "#9db0cf", note: "Present. So was everyone else." },
  2: { name: "Club Meeting", pts: 25, emoji: "🟪", color: "#c7abff", note: "Solid. Half the chapter said it too." },
  3: { name: "Districts", pts: 45, emoji: "🟦", color: "#74a9ff", note: "Sharp. That one places." },
  4: { name: "State", pts: 65, emoji: "🟧", color: "#e3a071", note: "Rare. Judges look up for that." },
  5: { name: "ICDC", pts: 80, emoji: "🟨", color: "#f2c14e", note: "Elite. Few rooms ever hear it." },
  6: { name: "DECA Glass", pts: 100, emoji: "💎", color: "#7fe3f2", note: "One in a Decallion." },
};
export const LEVEL_KEYS: Level[] = [1, 2, 3, 4, 5, 6];
export const MISS_COLOR = "#ff8676";
export const MAX_PER_PROMPT = 100;

export function pointsFor(row: AnswerRow | null): number {
  return row ? LEVELS[row[1]].pts : 0;
}
/** Points to feet, formatted: 325 -> "3,250". */
export function ft(points: number): string {
  return (points * 10).toLocaleString("en-US");
}
