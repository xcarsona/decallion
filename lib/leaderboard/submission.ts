/* The checks on a posted daily round that need no database, so they can be unit tested.
   Only name, day, cluster and answers are read from the request. A score, levels or points sent by the browser are
   never looked at: the server rebuilds the round and scores the typed answers itself. */
import { MAX_ANSWER_LENGTH, ROUND_SIZE, buildRound, isPlayableDay, scoreAnswers, utcDayKey } from "@/lib/game-engine";
import { cleanName } from "@/lib/leaderboard/names";
import { QUESTIONS, isClusterChoice } from "@/lib/questions";
import type { ClusterChoice, Question } from "@/types";

export interface Submission {
  name: string;
  day: number;
  cluster: ClusterChoice;
  answers: string[];
}
export type Parsed<T> = ({ ok: true } & T) | { ok: false; error: string };

/** The cluster from a request. Missing means the mixed round ("all"), which is what a page from before clusters sends. */
export function parseCluster(value: unknown): Parsed<{ cluster: ClusterChoice }> {
  if (value === undefined || value === null) return { ok: true, cluster: "all" };
  if (!isClusterChoice(value)) return { ok: false, error: "Unknown cluster." };
  return { ok: true, cluster: value };
}

/** Checks a POST body. `today` is the current UTC day key; it is a parameter so tests can fix the date. */
export function parseSubmission(body: unknown, today: number = utcDayKey()): Parsed<{ submission: Submission }> {
  if (typeof body !== "object" || body === null || Array.isArray(body)) return { ok: false, error: "The request was not valid JSON." };
  const { name: rawName, day, cluster: rawCluster, answers } = body as Record<string, unknown>;

  const name = cleanName(rawName);
  if (!name.ok) return { ok: false, error: name.reason };

  // The day is the player's own calendar date. Around the world that is the UTC date or one day either side of it,
  // which also covers a round started just before the player's midnight and posted just after.
  if (!isPlayableDay(day, today)) {
    return { ok: false, error: "That daily round has closed. Play today's round to post a score." };
  }

  const cluster = parseCluster(rawCluster);
  if (!cluster.ok) return cluster;

  if (!Array.isArray(answers) || answers.length !== ROUND_SIZE || !answers.every((a) => typeof a === "string")) {
    return { ok: false, error: "A daily round has seven answers." };
  }
  // No answer on any board is this long, so an over-long one is a miss. It is not a reason to refuse the other six.
  const kept = (answers as string[]).map((a) => (a.length <= MAX_ANSWER_LENGTH ? a : ""));
  return { ok: true, submission: { name: name.name, day, cluster: cluster.cluster, answers: kept } };
}

/** Rebuilds that cluster's daily round from the shared seed and scores the typed answers with the game's engine. */
export function scoreSubmission(submission: Pick<Submission, "day" | "cluster" | "answers">, questions: Question[] = QUESTIONS): Parsed<{ score: number; levels: number[] }> {
  const round = buildRound(questions, { mode: "daily", cluster: submission.cluster, seed: submission.day });
  if (round.length === 0) return { ok: false, error: "That cluster has no daily round yet." };
  return { ok: true, ...scoreAnswers(round, submission.answers) };
}
