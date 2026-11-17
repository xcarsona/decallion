/* Daily leaderboard API.
   GET  /api/scores?scope=today|yesterday|all   top 50 scores
   POST /api/scores  { name, day, answers }     submit a daily round

   The browser sends the answers it typed, never a score. The server rebuilds that day's round from the shared seed
   and scores it with the same engine the game uses, so a posted score cannot be invented. */
import { NextResponse } from "next/server";
import { ROUND_SIZE, buildRound, dayIso, dayKey, prevDayKey, scoreAnswers } from "@/lib/game-engine";
import { cleanName } from "@/lib/leaderboard/names";
import { QUESTIONS } from "@/lib/questions";
import { getServerClient } from "@/lib/supabase/server";

const NOT_CONFIGURED = { error: "The leaderboard is not set up yet." };
const fail = (status: number, error: string) => NextResponse.json({ error }, { status });

/* Small per-server-instance limiter: 6 posts a minute per address. It slows abuse; it is not a hard guarantee on
   serverless hosting, where instances come and go. */
const hits = new Map<string, number[]>();
function limited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < 60_000);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear();
  return recent.length > 6;
}

export async function GET(request: Request) {
  const scope = new URL(request.url).searchParams.get("scope") ?? "today";
  const db = getServerClient();
  if (!db) return NextResponse.json(NOT_CONFIGURED, { status: 503 });

  const today = dayKey();
  let query = db.from("daily_scores").select("name, score, levels, day").order("score", { ascending: false }).order("created_at", { ascending: true }).limit(50);
  if (scope === "today") query = query.eq("day", dayIso(today));
  else if (scope === "yesterday") query = query.eq("day", dayIso(prevDayKey(today)));
  else if (scope !== "all") return fail(400, "Unknown scope.");

  const { data, error } = await query;
  if (error) return fail(502, "The leaderboard could not be read. Try again in a moment.");
  return NextResponse.json({ rows: data });
}

export async function POST(request: Request) {
  const ip = (request.headers.get("x-forwarded-for") ?? "unknown").split(",")[0].trim();
  if (limited(ip)) return fail(429, "Too many attempts. Wait a minute and try again.");

  let body: { name?: unknown; day?: unknown; answers?: unknown };
  try {
    body = await request.json();
  } catch {
    return fail(400, "The request was not valid JSON.");
  }

  const name = cleanName(body.name);
  if (!name.ok) return fail(400, name.reason);

  // A round started just before midnight UTC may be submitted just after it, so yesterday's key is accepted too.
  const today = dayKey();
  if (body.day !== today && body.day !== prevDayKey(today)) return fail(400, "That daily round has closed. Play today's round to post a score.");
  const day = body.day as number;

  const answers = body.answers;
  if (!Array.isArray(answers) || answers.length !== ROUND_SIZE || !answers.every((a) => typeof a === "string" && a.length <= 80)) {
    return fail(400, "A daily round has seven answers.");
  }

  const db = getServerClient();
  if (!db) return NextResponse.json(NOT_CONFIGURED, { status: 503 });

  const round = buildRound(QUESTIONS, { mode: "daily", seed: day });
  const { score, levels } = scoreAnswers(round, answers as string[]);

  const { error } = await db.from("daily_scores").insert({ day: dayIso(day), name: name.name, name_key: name.name.toLowerCase(), score, levels });
  if (error) {
    if (error.code === "23505") return fail(409, "That name already has a score for this round. Use a different name.");
    return fail(502, "Your score could not be saved. Try again in a moment.");
  }

  const { count } = await db.from("daily_scores").select("id", { count: "exact", head: true }).eq("day", dayIso(day)).gt("score", score);
  return NextResponse.json({ name: name.name, score, levels, rank: (count ?? 0) + 1 });
}
