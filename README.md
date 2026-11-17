# Decallion

Rare-answer business trivia for DECA competitors. Every prompt has many correct answers; you type one, and the answer
fewer competitors would give climbs higher. Unofficial: not affiliated with or endorsed by DECA Inc.

## What is here

| Path | What it is |
|---|---|
| `app/` | Next.js App Router pages: the game (`/`), the leaderboard (`/leaderboard`) and the scores API (`/api/scores`) |
| `components/game/` | The game screens as React components, plus `scene.ts`, the canvas animation and sound |
| `lib/questions/data.ts` | The question bank. Data only: edit prompts here without touching game code |
| `lib/game-engine/` | Answer matching, round building, the shared daily seed, bank validation |
| `lib/scoring/` | The six answer levels and their points |
| `lib/stats/` | Personal stats, saved in the browser |
| `lib/supabase/`, `supabase/schema.sql` | Leaderboard database client (server only) and table definition |
| `tests/` | Unit tests for the bank, matching, rounds, server-side scoring, stats and names |
| `prototype/` | The original plain HTML/JS version, kept as a reference |

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
npm test           # unit tests, including checks on the question bank
npm run build      # production build
```

The game works with no setup. The leaderboard shows "not set up yet" until the two environment variables below exist.

## Rules of the game

- Seven prompts in a daily round, one typed answer each, 25 seconds per prompt.
- Levels: Roll Call 10, Club Meeting 25, Districts 45, State 65, ICDC 80, DECA Glass 100. One point is 10 ft.
- The daily round is seeded from the UTC date, so it is the same for every player and changes at midnight UTC.
- Practice lets you pick categories, difficulty and whether the timer runs. Endless continues until three misses.
- Answer boards stay hidden until the round ends.

## Leaderboard setup (Supabase)

1. Create a Supabase project.
2. Open the SQL editor and run `supabase/schema.sql`.
3. Copy the project URL and the **service role** key from the project's API settings.
4. Put them in `.env.local` for local work (see `.env.example`), and in the host's environment variables for production:

   ```
   SUPABASE_URL=...
   SUPABASE_SERVICE_ROLE_KEY=...
   ```

The service role key is a secret. It is read only on the server; never prefix it with `NEXT_PUBLIC_` or commit it.

How scores stay honest: the browser posts the seven answers it typed, not a score. The server rebuilds that day's round
from the same seed and scores the answers with the same engine. The table allows public reads and no public writes.

## Deploy (Vercel) and custom domain

1. Import this repository as a new Vercel project. The defaults for Next.js work.
2. Add `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in the project's environment variables, then redeploy.
3. Add your domain in the project's domain settings and create the DNS records Vercel shows you at your registrar.

## Adding prompts

Add an entry to `lib/questions/data.ts` following the format described at the top of that file, then run `npm test`.
The tests fail if an id is duplicated, an alias matches two answers, or a prompt has no DECA Glass answer.

## Known limits

- Answer levels are editorial estimates, not measured from players.
- The question bank ships to the browser, so a determined player can read the boards. The server check stops made-up
  scores, not looked-up answers. The 25-second limit is enforced in the browser only.
- The post rate limit is per server instance, so it slows abuse but is not a hard cap on serverless hosting.
- Personal stats live in one browser. There are no accounts.
