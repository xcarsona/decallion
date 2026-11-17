export type Level = 1 | 2 | 3 | 4 | 5 | 6;
export type Difficulty = 1 | 2 | 3;
/** [display answer, level, ...accepted aliases] */
export type AnswerRow = [string, Level, ...string[]];

export interface Question {
  id: string;
  cat: string;
  area: string;
  diff: Difficulty;
  q: string;
  why: string;
  a: AnswerRow[];
}

export type Mode = "daily" | "practice" | "endless";

/** One answered prompt in a round. `level` is -1 for a wrong answer or timeout. */
export interface LogEntry {
  question: Question;
  row: AnswerRow | null;
  typed: string;
  pts: number;
  level: Level | -1;
  timedOut: boolean;
}

export interface PracticeSetup {
  cats: string[];
  diff: 0 | Difficulty;
  timer: boolean;
}

export interface ScoreRow {
  name: string;
  score: number;
  levels: number[];
  day: string;
}
