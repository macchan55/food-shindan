"use client";
import { createBrowserClient } from "@supabase/ssr";

// Publishable (anon) key client for the browser: used only for Supabase Auth
// (sign up / log in / log out). It is never used to read or write app tables directly —
// those all go through Next.js Route Handlers using the service-role client, matching the
// pattern in supabase/migrations/0001_init.sql.
export function supabaseBrowser() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !publishableKey) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY must be set. See .env.example."
    );
  }
  return createBrowserClient(url, publishableKey);
}
