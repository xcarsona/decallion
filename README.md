# Decallion

Rare-answer business trivia for DECA competitors. Every prompt has many correct answers; you type one, and the answer
fewer competitors would give climbs higher. Unofficial: not affiliated with or endorsed by DECA Inc.

## What is here

| Path | What it is |
|---|---|
| `app/` | Next.js App Router pages: the game (`/`, in `app/(game)`, a full-height layout), the leaderboard (`/leaderboard`) and the training log (`/log`) (both in `app/(site)`, a scrolling page layout), and the scores API (`/api/scores`) |
| `components/game/` | The game screens as React components, plus `scene.ts`, the canvas animation and sound |
| `lib/questions/bank/` | The question bank, one file per career cluster. Data only |
| `lib/questions/clusters.ts` | The five clusters: names, colours and icons |
| `lib/game-engine/` | Answer matching, round building, the daily seed, bank checks |
| `lib/scoring/` | The six answer levels and their points |
| `lib/stats/`, `lib/log/` | Personal stats and the training log, both saved in the browser |
| `lib/leaderboard/` | Name rules and the checks on a posted round |
| `lib/supabase/`, `supabase/` | Leaderboard database client (server only), the table definition and its migrations |
| `docs/QUESTION_REVIEW.md` | Notes from the review of the question bank |
| `tests/` | Unit tests for the bank, matching, rounds, stats, the log and leaderboard submissions |
| `prototype/` | The original plain HTML/JS version, kept as a reference |

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
npm test           # unit tests, including checks on the question bank
npm run build      # production build
```

The game works with no setup. The leaderboard shows "not set up yet" until the environment variables below exist.

## How the game works

You pick a career cluster, then a mode.

- **Clusters:** Business Management + Administration, Entrepreneurship, Finance, Hospitality + Tourism, Marketing,
  or All clusters (a mix of the five).
- **Daily climb:** seven prompts, 25 seconds each. An answer that is not on the board can be tried again until the
  clock runs out; the first answer that is on the board is final. Each cluster has its own daily round.
- **Practice:** seven prompts. You choose the difficulty and whether the timer runs.
- **Unlimited:** keeps going until three misses.
- **Levels:** Roll Call 10, Club Meeting 25, Districts 45, State 65, ICDC 80, DECA Glass 100. One point is 10 ft.
- Answer boards stay hidden until the round ends. The results screen then has a Review answers button that opens
  every board.

The game screen fills the window: altitude and score at the top, the prompt in the middle, the answer bar at the
bottom. A round opens with a short intro card (click, Enter or Space skips it) and the clock starts when the first
prompt appears. How to play, the answer levels and a short stats summary are in the How to play panel. Opening it
does not pause the clock.

The daily round is seeded from the calendar date and the cluster. Each player gets the round for the date on their
own clock, so it changes at their midnight, and everyone playing a cluster on the same date gets the same seven
prompts. A prompt is not repeated within three days. For that reason a cluster needs
at least 21 prompts before its daily round opens.

## Training log

Every finished round is saved in the browser and listed at `/log`. It keeps the latest 500 rounds and can be
exported as a CSV file.

## Leaderboard

There is one board per cluster, with tabs for today, yesterday and all-time best. One entry per name, per day, per
cluster. `/leaderboard?cluster=fin` opens a cluster's tab directly.

How scores stay honest: the browser posts the cluster and the seven answers it typed, not a score. The server
rebuilds that cluster's round for that day from the same seed and scores the answers with the same engine. A score
sent by the browser is ignored. The table allows public reads and no public writes.

### Setup (Supabase)

1. Create a Supabase project.
2. Open the SQL editor and run `supabase/schema.sql`.
3. Then run `supabase/migrations/20261117_add_cluster.sql`. It adds the cluster column.
4. Copy the project URL and the **secret** key (`sb_secret_...`, or the legacy service role key) from the project's
   API settings.
5. Put them in `.env.local` for local work (see `.env.example`), and in the host's environment variables for
   production:

   ```
   SUPABASE_URL=...
   SUPABASE_SERVICE_ROLE_KEY=...
   ```

**Already have the leaderboard running?** Run only step 3. It is safe to run more than once, and scores already
saved are kept on the All clusters board. Until it is run, the leaderboard says it needs a database update.

If you ever run `schema.sql` again after the migration, run the migration again too. `schema.sql` puts back the old
one-entry-per-name-per-day rule, and the migration removes it.

### Environment variables

| Value | Names the server accepts |
|---|---|
| Project URL | `SUPABASE_URL` or `NEXT_PUBLIC_SUPABASE_URL` |
| Secret key | `SUPABASE_SERVICE_ROLE_KEY` or `SUPABASE_SECRET_KEY` |

The key must be the secret key (`sb_secret_...`) or the legacy service role key. The publishable key cannot save
scores. The secret key is read only on the server: never prefix it with `NEXT_PUBLIC_` and never commit it.

## Deploy (Vercel) and custom domain

1. Import this repository as a new Vercel project. The defaults for Next.js work.
2. Add the project URL and the secret key in the project's environment variables, then redeploy.
3. Add your domain in the project's domain settings and create the DNS records Vercel shows you at your registrar.

## Adding prompts

Add an entry to the cluster's file in `lib/questions/bank/`, following the format described at the top of
`lib/questions/index.ts`, then run `npm test`. The tests fail if an id is duplicated, an alias matches two answers,
a board has too few answers, or a prompt has no ICDC or DECA Glass answer.

## Known limits

- Answer levels are editorial estimates, not measured from players.
- The question bank ships to the browser, so a determined player can read the boards. The server check stops made-up
  scores, not looked-up answers. The 25-second limit is enforced in the browser only.
- Leaving the game page in the middle of a prompt counts that prompt as a timeout.
- The post rate limit (30 a minute per address) is per server instance, so it slows abuse but is not a hard cap on serverless hosting.
- Personal stats and the training log live in one browser. There are no accounts.
