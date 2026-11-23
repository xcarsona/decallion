-- Decallion leaderboard: a way to take a name off the board without deleting the row.
-- Run this once in the Supabase SQL editor. It is safe to run again.
--
-- To hide a row afterwards, open the daily_scores table in the Supabase dashboard and tick `hidden` on it, or run:
--   update public.daily_scores set hidden = true where name_key = 'the name in lower case';
-- A hidden row stays in the table (so the same name cannot simply be posted again that day) but is never shown.

begin;

alter table public.daily_scores add column if not exists hidden boolean not null default false;

-- The site's server filters hidden rows itself. This makes the public read rule match, so a hidden row cannot be
-- read straight from the database with the public key either.
drop policy if exists "Public read" on public.daily_scores;
create policy "Public read" on public.daily_scores for select using (not hidden);

-- The all-time board sorts one cluster by score across every day. Without this it reads the whole cluster.
create index if not exists daily_scores_cluster_score on public.daily_scores (cluster, score desc, created_at);

commit;

-- Tell the API layer (PostgREST) about the new column straight away.
notify pgrst, 'reload schema';
