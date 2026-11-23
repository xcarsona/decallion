/* Daily leaderboard API, one board per cluster.
   GET  /api/scores?scope=today|yesterday|all&cluster=all|bma|ent|fin|ht|mkt   top 50 scores
        today and yesterday are dates in Eastern Time, the clock the daily rounds run on
   POST /api/scores  { name, day, cluster, answers }                           submit a daily round

   The browser sends the answers it typed, never a score. The server rebuilds that cluster's round for that day from
   the shared seed and scores it with the same engine the game uses, so a posted score cannot be invented. */
import { NextResponse } from "next/server";
import { dayIso, dayKey, prevDayKey } from "@/lib/game-engine";
import { createLimiter } from "@/lib/leaderboard/ratelimit";
import { parseCluster, parseSubmission, scoreSubmission } from "@/lib/leaderboard/submission";
import { getServerClient } from "@/lib/supabase/server";

/* What a visitor is told when the leaderboard cannot be used. The reason is for the owner, so it goes to the server
   log, not to the page. */
const UNAVAILABLE = "The leaderboard is unavailable right now. Your round is still saved in your log.";
function unavailable(reason: string) {
  console.error("[scores] " + reason);
  return NextResponse.json({ error: UNAVAILABLE }, { status: 503 });
}
const NOT_CONFIGURED = "not set up: the Supabase environment variables are missing";
const NEEDS_MIGRATION = "the database is behind the code: run the files in supabase/migrations";
/** The largest request body a real post can have is a few hundred bytes. */
const MAX_BODY = 4096;
const fail = (status: number, error: string) => NextResponse.json({ error }, { status });
/** True when the database lacks a column the code uses: Postgres "undefined column", or PostgREST's schema cache miss. */
const columnMissing = (error: { code?: string }) => error.code === "42703" || error.code === "PGRST204";
/** True when the missing column is `hidden`, added by the moderation migration. Until that migration has been run
    the board still works, just without the ability to hide a row. */
const hiddenMissing = (error: { code?: string; message?: string }) => columnMissing(error) && (error.message ?? "").includes("hidden");

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
  if (!db) return unavailable(NOT_CONFIGURED);

  // the server's own clock decides which day is today, so a device with a wrong clock still sees the right board
  const today = dayKey();
  const read = (skipHidden: boolean) => {
    let query = db.from("daily_scores").select("name, score, levels, day, cluster").eq("cluster", cluster.cluster);
    if (skipHidden) query = query.eq("hidden", false); // rows the owner has hidden are never shown
    if (scope === "today") query = query.eq("day", dayIso(today));
    else if (scope === "yesterday") query = query.eq("day", dayIso(prevDayKey(today)));
    return query.order("score", { ascending: false }).order("created_at", { ascending: true }).limit(50);
  };
  let { data, error } = await read(true);
  if (error && hiddenMissing(error)) ({ data, error } = await read(false));
  if (error) {
    if (columnMissing(error)) return unavailable(NEEDS_MIGRATION);
    console.error("[scores] read failed: " + (error.code ?? "unknown"));
    return fail(502, "The leaderboard could not be read. Try again in a moment.");
  }
  return NextResponse.json({ rows: data });
}

export async function POST(request: Request) {
  const ip = (request.headers.get("x-forwarded-for") ?? "unknown").split(",")[0].trim();
  if (limited(ip)) return fail(429, "Too many attempts. Wait a minute and try again.");

  // Only this site's own pages post scores, as JSON. This turns away another website posting from a visitor's
  // browser (which can only send a "simple" content type without asking first) and oversized bodies.
  if (!(request.headers.get("content-type") ?? "").toLowerCase().startsWith("application/json")) return fail(415, "Send the score as JSON.");
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) return fail(403, "Scores can only be posted from the game.");
  if (Number(request.headers.get("content-length") ?? 0) > MAX_BODY) return fail(413, "That request is too large.");

  let body: unknown;
  try {
    const text = await request.text();
    if (text.length > MAX_BODY) return fail(413, "That request is too large.");
    body = JSON.parse(text);
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
  if (!db) return unavailable(NOT_CONFIGURED);

  const { error } = await db.from("daily_scores").insert({ day: dayIso(day), cluster, name, name_key: name.toLowerCase(), score, levels });
  if (error) {
    if (error.code === "23505") {
      if (oldNameIndex(error)) return unavailable(NEEDS_MIGRATION);
      return fail(409, "That name already has a score on this board today. Use a different name.");
    }
    if (columnMissing(error)) return unavailable(NEEDS_MIGRATION);
    console.error("[scores] insert failed: " + (error.code ?? "unknown"));
    return fail(502, "Your score could not be saved. Try again in a moment.");
  }

  /* The board sorts by score, then by time posted. This row is the newest, so every row with the same score or a
     better one sits at or above it: counting them (this row included) gives the row number the board shows.
     If the count fails the score is still saved, so the reply just leaves the rank out. */
  const count = (skipHidden: boolean) => {
    const query = db.from("daily_scores").select("id", { count: "exact", head: true }).eq("day", dayIso(day)).eq("cluster", cluster).gte("score", score);
    return skipHidden ? query.eq("hidden", false) : query;
  };
  let ahead = await count(true);
  // a failed count carries no reason (it is a HEAD request), so the plain count is simply tried next: it is what
  // works on a database where the moderation migration has not been run
  if (ahead.error) ahead = await count(false);
  const rank = ahead.error || !ahead.count ? undefined : ahead.count;
  return NextResponse.json({ name, cluster, score, levels, day: dayIso(day), rank });
}
