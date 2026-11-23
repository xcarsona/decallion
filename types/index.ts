export type Level = 1 | 2 | 3 | 4 | 5 | 6;
export type Difficulty = 1 | 2 | 3;
/** [display answer, level, ...accepted aliases] */
export type AnswerRow = [string, Level, ...string[]];

/** DECA's five career clusters. */
export type ClusterId = "bma" | "ent" | "fin" | "ht" | "mkt";
/** What the player picks: one cluster, or every cluster mixed. */
export type ClusterChoice = ClusterId | "all";

export interface Question {
  id: string;
  cluster: ClusterId;
  /** Sub-topic inside the cluster, for example "Accounting" inside Finance. */
  topic: string;
  area: string;
  diff: Difficulty;
  q: string;
  why: string;
  a: AnswerRow[];
  /** First day (a day key such as 20261124) the prompt may appear in a daily round. Set on prompts added after
      launch, so that adding them does not change the daily rounds of earlier days, today's included. Practice and
      Unlimited use a prompt as soon as it is in the bank. */
  since?: number;
}

export type Mode = "daily" | "practice" | "unlimited";

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
  /** Clusters to draw from. Only editable when the player chose All clusters. */
  clusters: ClusterId[];
  diff: 0 | Difficulty;
  timer: boolean;
}

export interface ScoreRow {
  name: string;
  score: number;
  levels: number[];
  day: string;
  cluster: ClusterChoice;
}
