/* Server-only Supabase client. Uses the service role key, which must never be sent to the browser:
   only import this file from route handlers. */
import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null = null;

/** Returns null when the leaderboard environment variables are not set. */
export function getServerClient(): SupabaseClient | null {
  // The URL is not a secret, so the NEXT_PUBLIC_ name Supabase suggests is accepted too. The key must be the
  // secret one (sb_secret_... or the legacy service_role key): the publishable key cannot insert scores.
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) return null;
  if (!client) client = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  return client;
}
