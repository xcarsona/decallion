/* Daily leaderboard API, one board per cluster.
   GET  /api/scores?scope=today|yesterday|all&cluster=all|bma|ent|fin|ht|mkt&day=20261117   top 50 scores
        day is the viewer's own calendar date (today for them). Without it the UTC date is used.
   POST /api/scores  { name, day, cluster, answers }                           submit a daily round

   The browser sends the answers it typed, never a score. The server rebuilds that cluster's round for that day from
   the shared seed and scores it with the same engine the game uses, so a posted score cannot be invented. */
import { NextResponse } from "next/server";
import { dayIso, isPlayableDay, prevDayKey, utcDayKey } from "@/lib/game-engine";
import { createLimiter } from "@/lib/leaderboard/ratelimit";
import { parseCluster, parseSubmission, scoreSubmission } from "@/lib/leaderboard/submission";
import { getServerClient } from "@/lib/supabase/server";

const NOT_CONFIGURED = { error: "The leaderboard is not set up yet." };
const NEEDS_MIGRATION = { error: "The leaderboard needs a database update. See supabase/migrations in the repository." };
const fail = (status: number, error: string) => NextResponse.json({ error }, { status });
/** True when the database has no cluster column yet: Postgres "undefined column", or PostgREST's schema cache miss. */
const columnMissing = (error: { code?: string }) => error.code === "42703" || error.code === "PGRST204";

/** True when the insert hit the unique index from before clusters (one entry per name per day), which the cluster
    migration removes. It is back if schema.sql was run again after the migration. */
const oldNameIndex = (error: { message?: string }) => (error.message ?? "").includes('"daily_scores_one_per_name"');

/* Small per-server-instance limiter: 30 posts a minute per address, enough for a class behind one school address.
   Refused posts are not counted. It slows abuse; it is not a hard guarantee on serverless hosting, where instances
   come and go. */
const limited = createLimiter(30, 60_000);

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const scope = params.get("scope") ?? "today";
  if (scope !== "today" && scope !== "yesterday" && scope !== "all") return fail(400, "Unknown scope.");
  const cluster = parseCluster(params.get("cluster"));
  if (!cluster.ok) return fail(400, cluster.error);

  const db = getServerClient();
  if (!db) return NextResponse.json(NOT_CONFIGURED, { status: 503 });

  // "Today" is the viewer's own date, because that is the round they are playing. It can be a day either side of UTC.
  const asked = params.get("day");
  const today = asked === null ? utcDayKey() : Number(asked);
  if (!isPlayableDay(today)) return fail(400, "Unknown day.");
  let query = db.from("daily_scores").select("name, score, levels, day, cluster").eq("cluster", cluster.cluster);
  if (scope === "today") query = query.eq("day", dayIso(today));
  else if (scope === "yesterday") query = query.eq("day", dayIso(prevDayKey(today)));

  const { data, error } = await query.order("score", { ascending: false }).order("created_at", { ascending: true }).limit(50);
  if (error) {
    if (columnMissing(error)) return NextResponse.json(NEEDS_MIGRATION, { status: 503 });
    return fail(502, "The leaderboard could not be read. Try again in a moment.");
  }
  return NextResponse.json({ rows: data });
}

export async function POST(request: Request) {
  const ip = (request.headers.get("x-forwarded-for") ?? "unknown").split(",")[0].trim();
  if (limited(ip)) return fail(429, "Too many attempts. Wait a minute and try again.");

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return fail(400, "The request was not valid JSON.");
  }

  // Only name, day, cluster and answers are read. Any score, levels or points in the body are ignored.
  const parsed = parseSubmission(body);
  if (!parsed.ok) return fail(400, parsed.error);
  const { name, day, cluster } = parsed.submission;

  const scored = scoreSubmission(parsed.submission);
  if (!scored.ok) return fail(400, scored.error);
  const { score, levels } = scored;

  const db = getServerClient();
  if (!db) return NextResponse.json(NOT_CONFIGURED, { status: 503 });

  const { error } = await db.from("daily_scores").insert({ day: dayIso(day), cluster, name, name_key: name.toLowerCase(), score, levels });
  if (error) {
    if (error.code === "23505") {
      if (oldNameIndex(error)) return NextResponse.json(NEEDS_MIGRATION, { status: 503 });
      return fail(409, "That name already has a score for this cluster and day. Use a different name.");
    }
    if (columnMissing(error)) return NextResponse.json(NEEDS_MIGRATION, { status: 503 });
    return fail(502, "Your score could not be saved. Try again in a moment.");
  }

  /* The board sorts by score, then by time posted. This row is the newest, so every row with the same score or a
     better one sits at or above it: counting them (this row included) gives the row number the board shows.
     If the count fails the score is still saved, so the reply just leaves the rank out. */
  const ahead = await db.from("daily_scores").select("id", { count: "exact", head: true }).eq("day", dayIso(day)).eq("cluster", cluster).gte("score", score);
  const rank = ahead.error || !ahead.count ? undefined : ahead.count;
  return NextResponse.json({ name, cluster, score, levels, day: dayIso(day), rank });
}
