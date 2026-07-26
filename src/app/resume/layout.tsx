"use client";

import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { linkPendingResumeSessionIfAny } from "@/lib/resume/pending-session";

// Every /resume/* page needs *some* signed-in user to own the data it reads/writes, but
// registration itself is only required at download time (see /resume/preview). So this
// silently starts a Supabase anonymous session on first visit if there's no session yet —
// same auth.users row, same RLS, same API routes as a real account; upgraded in place via
// auth.updateUser() when the user actually registers.
export default function ResumeLayout({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function ensureSession() {
      const supabase = supabaseBrowser();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        const { error: anonError } = await supabase.auth.signInAnonymously();
        if (anonError) {
          if (!cancelled) setError(anonError.message);
          return;
        }
      }
      await linkPendingResumeSessionIfAny();
      if (!cancelled) setReady(true);
    }
    ensureSession();
    return () => {
      cancelled = true;
    };
  }, []);

  if (error) {
    return (
      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center gap-2 px-6 py-16 text-center">
        <p className="text-red-600">{error}</p>
        <p className="text-sm text-foreground/60">
          時間をおいて再度お試しください。
        </p>
      </main>
    );
  }

  if (!ready) {
    return (
      <main className="mx-auto flex w-full max-w-xl flex-1 items-center justify-center px-6 py-16 text-foreground/60">
        読み込み中…
      </main>
    );
  }

  return <>{children}</>;
}
