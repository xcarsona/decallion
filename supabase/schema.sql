-- Decallion daily leaderboard. Run this once in the Supabase SQL editor.

create table if not exists public.daily_scores (
  id         bigint generated always as identity primary key,
  day        date        not null,                 -- UTC date of the daily round
  name       text        not null check (char_length(name) between 3 and 16),
  name_key   text        not null,                 -- lower-cased name, for one entry per name per day
  score      integer     not null check (score between 0 and 700),
  levels     integer[]   not null,                 -- level reached on each of the seven prompts, 0 for a miss
  created_at timestamptz not null default now()
);

create unique index if not exists daily_scores_one_per_name on public.daily_scores (day, name_key);
create index if not exists daily_scores_day_score on public.daily_scores (day, score desc, created_at);

-- Anyone may read the board. Nobody may write through the public API:
-- rows are inserted only by the site's server, which uses the service role key and bypasses row level security.
alter table public.daily_scores enable row level security;

drop policy if exists "Public read" on public.daily_scores;
create policy "Public read" on public.daily_scores for select using (true);
