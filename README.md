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
| `lib/questions/defs/` | A short definition for every answer, one JSON file per cluster, loaded only when first needed |
| `lib/game-engine/` | Answer matching, round building, the daily seed, bank checks |
| `lib/scoring/` | The six answer levels and their points |
| `lib/stats/`, `lib/log/`, `lib/study/` | Personal stats, the training log and the study list, all saved in the browser |
| `components/study/` | The answer boards with their definition cards, and the study list page (`/study`) |
| `public/splash/` | The four tiles behind the loading screen (see Loading screen below) |
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

The daily round is seeded from the date and the cluster. The date is always the date in US Eastern Time, wherever
the player is, so the round changes for everyone at midnight Eastern and everyone playing a cluster gets the same
seven prompts. The server uses the same clock, so it accepts only today's round (and yesterday's for an hour after
midnight): tomorrow's round cannot be posted early. A prompt is not repeated within three days. For that reason a cluster needs
at least 21 prompts before its daily round opens.

## Training log

Every finished round is saved in the browser and listed at `/log`. It keeps the latest 500 rounds and can be
exported as a CSV file.

## Definitions and the study list

In the round review and in the training log, every answer on a board can be opened to read what it is. The
definitions live in `lib/questions/defs/`, keyed by prompt id and by the answer as displayed. `npm test` fails if an
answer has no definition or a definition is left over, so add one whenever you add an answer.

From an answer's card a player can add it to their study list, add a whole board, or add every board they missed in
that round. The list is at `/study`: terms grouped by cluster and prompt, with a learned toggle and filters. It is
saved in the browser only, up to 2,000 terms, and clearing the log does not clear it.

## Loading screen

The game opens on a short loading screen that cuts between four tiles in `public/splash/`. Each tile is a photo
shrunk to between 50 and 72 blocks across: enough to see that there are people and a place, too coarse to recognise
a face or read a name badge. Areas holding a logo are drawn four times coarser. Only those
tiles are in the repository, not the photos. Replace a tile with any small PNG of the same name to change it.

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
