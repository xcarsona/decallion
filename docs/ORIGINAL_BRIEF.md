# Decallion: turn the working prototype into a deployed site with a leaderboard

## What you are starting from

This repository contains a working browser game called **Decallion** in `prototype/`. It is a rare-answer trivia game for DECA competitors, modelled on the daily game Krillion: each prompt has many correct answers, the player types one, and rarer answers score more. The prototype is plain HTML, CSS and JavaScript with no build step. Open `prototype/index.html` in a browser and play a full round before changing anything.

| File | What it holds |
|---|---|
| `prototype/js/questions.js` | The question bank: 39 prompts in 12 categories. Each has `id`, `cat`, `area`, `diff`, `q`, `why`, and an answer board `a` of `[answer, level 1-6, ...aliases]`. Data only. |
| `prototype/js/engine.js` | Pure rules with no DOM access: the six answer levels and their points, answer matching (aliases, plurals, typo tolerance), round building for each mode, the daily seed, and `validate()` for the bank. |
| `prototype/js/stats.js` | Player stats in `localStorage`: bests per mode, daily streak, answers by level, per-category totals. |
| `prototype/js/scene.js` | The animated climb on canvas (elevator, skyline, altitude ruler, confetti) and the sound effects. |
| `prototype/js/app.js` | Screens and game flow: home, practice setup, prompt, climb, level reveal, results, round review, stats panel. |
| `prototype/css/game.css` | The retro pixel look. |

## The goal

A production website on my own domain, with a global leaderboard for the daily round. Everything the prototype does today must still work.

## Stack

- Next.js (App Router) with React and TypeScript
- Tailwind CSS for new UI; keep the existing retro look
- Supabase (Postgres) for the leaderboard
- Vercel for hosting

Use the current stable versions and check their documentation instead of relying on memory.

## Rules that must not change

1. **The mechanic stays typed answers scored by rarity.** Do not convert it to multiple choice.
2. **One answer per prompt, 25 seconds, seven prompts in a daily round.** Levels and points are Roll Call 10, Club Meeting 25, Districts 45, State 65, ICDC 80, DECA Glass 100. One point is 10 ft of altitude.
3. **The flow stays: prompt, then the climb animation, then the level reveal, then a button to continue.** Answer boards stay hidden until the round ends.
4. **Original art and names only.** Do not copy Krillion's artwork, mascot, colours or level names, and do not use DECA's logo or branding. Keep the footer line saying the game is unofficial and not affiliated with DECA Inc.
5. **Do not rewrite the answer levels or invent new scoring** (bonuses, multipliers) unless I ask.

## Work in this order

### 1. Scaffold and port
- Create the Next.js project at the repository root. Leave `prototype/` untouched as the reference.
- Move the rules into typed modules: `lib/questions/` (data plus types), `lib/game-engine/` (matching, round building), `lib/scoring/`, `lib/stats/`.
- Port the scene to a client component that owns the canvas. Port the screens to React components under `components/game/`. Do not put the whole game in one component.
- Keep `validate()` and run it in a unit test so a bad edit to the bank fails the test run.
- Routes: `/` home and game, `/leaderboard`, and `/results` only if it earns its place.

### 2. Make the daily round the same for everyone
- The prototype seeds the daily round from the **player's local date**. Change it to a single shared date (UTC) so every player worldwide gets the same seven prompts and the leaderboard is fair.
- Show the player when the next daily round starts.

### 3. Leaderboard
- Table `daily_scores`: `id`, `day` (date), `name` (text, 3 to 16 characters), `score` (int), `levels` (int array, one entry per prompt), `created_at`.
- Players enter a display name after finishing the daily round. No accounts and no passwords.
- **Do not trust a score sent by the browser.** Submit the seven typed answers to a server route. The server rebuilds that day's round from the same seed, scores the answers with the shared engine, and writes the result. The browser never writes to the table directly.
- Row Level Security: public read, no public insert or update. The server route writes with the service role key, which must never reach the client bundle.
- One entry per name per day. Rate-limit the route. Filter display names for profanity.
- `/leaderboard` shows today's top scores, with tabs for yesterday and all-time best. Highlight the player's own row.
- Keep personal stats in `localStorage` as they are now.

### 4. Deploy
- Deploy to Vercel. Put the Supabase URL and keys in environment variables, and commit a `.env.example` with the names only.
- Tell me exactly which values I need to create or paste and where: the Supabase project, the two keys, and the DNS records for my domain.

### 5. Test before calling anything done
- Unit tests for answer matching, round building, the daily seed and server-side scoring.
- Play each mode in a real browser: Daily, Practice (with a category filter, a difficulty filter and the timer off) and Endless (three misses ends it).
- Check a wrong answer, a timeout, quitting mid-round, replaying the daily round (must not count twice), a phone-width screen, and reduced-motion.
- Submit a leaderboard score, then try to submit a forged one and confirm the server rejects it.
- `npm run build` must pass with no type errors.

## Things to know

- Answer levels are editorial estimates, not real player data. Later, the leaderboard table could feed real answer frequencies back into the levels. Do not build that now, but do not make it harder.
- The bank is small (three prompts per category, six for Marketing). Make adding prompts easy; do not pad it with weak ones.
- Sound must start only after a click, and the Sound on/off choice must persist.

## When you finish, report

- What works, and how you tested each part.
- Anything that differs from the prototype, and why.
- The exact steps left for me: accounts to create, keys to paste, DNS records to add.
- Known limits.
