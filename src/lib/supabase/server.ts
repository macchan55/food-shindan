import "server-only";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

// Cookie-bound Supabase client for Route Handlers / Server Components: reads the caller's
// session (set by supabaseBrowser() auth calls) so we know *who* is asking. Still never
// used to touch app tables — Route Handlers pass the resolved user.id to supabaseAdmin()
// (service-role) for the actual read/write, same pattern as the diagnosis flow's sessionId.
export async function supabaseServer() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !publishableKey) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY must be set. See .env.example."
    );
  }
  const cookieStore = await cookies();
  return createServerClient(url, publishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Called from a Server Component render (no response to attach cookies to);
          // middleware refreshes the session on navigation, so this is safe to ignore.
        }
      },
    },
  });
}

/** Resolves the authenticated user for the current request, or null if not logged in. */
export async function getAuthUser() {
  const db = await supabaseServer();
  const {
    data: { user },
  } = await db.auth.getUser();
  return user;
}
