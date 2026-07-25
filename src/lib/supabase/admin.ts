import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Service-role Supabase client for server-only use (Route Handlers). RLS is enabled with
// no policies on every app table (see supabase/migrations/0001_init.sql), so this is
// deliberately the only way the app talks to the diagnosis tables — the browser never
// receives a Supabase key that can read/write them directly.
let cached: SupabaseClient | null = null;

export function supabaseAdmin(): SupabaseClient {
  if (cached) return cached;

  const url = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) {
    throw new Error(
      "SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set. See .env.example."
    );
  }

  cached = createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cached;
}
