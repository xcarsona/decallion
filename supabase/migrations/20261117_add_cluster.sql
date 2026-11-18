-- Decallion leaderboard: one board per career cluster.
-- Adds a cluster column to daily_scores so there is one entry per name, per day, per cluster.
-- Run this once in the Supabase SQL editor, after schema.sql (or on a database that already has the table).
-- It is safe to run again. Scores saved before this change were the mixed round, so they are kept as 'all'.

begin;

alter table public.daily_scores add column if not exists cluster text not null default 'all';

alter table public.daily_scores drop constraint if exists daily_scores_cluster_check;
alter table public.daily_scores add constraint daily_scores_cluster_check
  check (cluster in ('all', 'bma', 'ent', 'fin', 'ht', 'mkt'));

-- One entry per name, per day, per cluster (was: per name, per day).
drop index if exists public.daily_scores_one_per_name;
create unique index if not exists daily_scores_one_per_name_cluster on public.daily_scores (day, cluster, name_key);

-- The index the board reads with.
drop index if exists public.daily_scores_day_score;
create index if not exists daily_scores_day_cluster_score on public.daily_scores (day, cluster, score desc, created_at);

commit;

-- Tell the API layer (PostgREST) about the new column straight away, so inserts do not fail on a stale schema cache.
notify pgrst, 'reload schema';

-- Row level security and the "Public read" policy from schema.sql are unchanged.
