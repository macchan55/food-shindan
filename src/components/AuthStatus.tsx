"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/browser";

type AuthState =
  | { kind: "loading" }
  | { kind: "signed_out" }
  | { kind: "anonymous" }
  | { kind: "registered"; email: string };

// Site-wide "am I logged in?" indicator + logout. Anonymous resume-builder sessions and
// fully signed-out visitors both render nothing loud — this is only meant to answer "am I
// logged in as a real account right now" at a glance, not to be a full nav bar.
export function AuthStatus() {
  const router = useRouter();
  const pathname = usePathname();
  const [state, setState] = useState<AuthState>({ kind: "loading" });
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    const supabase = supabaseBrowser();

    function refresh() {
      supabase.auth.getUser().then(({ data }) => {
        const user = data.user;
        if (!user) setState({ kind: "signed_out" });
        else if (user.is_anonymous) setState({ kind: "anonymous" });
        else setState({ kind: "registered", email: user.email ?? "" });
      });
    }

    refresh();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => refresh());
    return () => subscription.unsubscribe();
  }, []);

  async function handleLogout() {
    setSigningOut(true);
    try {
      // Anonymous sessions have no password to log back in with — signing one out would
      // just orphan its data, so logout is only offered for real (registered) accounts.
      await supabaseBrowser().auth.signOut();
      router.push("/");
      router.refresh();
    } finally {
      setSigningOut(false);
    }
  }

  // /resume/* has its own richer account banner (ResumeAccountBanner in
  // src/app/resume/layout.tsx) with the same info plus resume-specific actions — showing
  // both there would just be duplicate chrome.
  if (state.kind === "loading" || state.kind === "signed_out" || pathname?.startsWith("/resume")) {
    return null;
  }

  return (
    <div className="flex items-center justify-end gap-3 border-b border-border bg-surface/80 px-4 py-1.5 text-xs backdrop-blur">
      {state.kind === "anonymous" ? (
        <span className="text-foreground/50">ゲストとして利用中（未登録）</span>
      ) : (
        <>
          <span className="font-bold text-foreground/70">{state.email}</span>
          <button
            onClick={handleLogout}
            disabled={signingOut}
            className="font-bold text-brand-dark underline underline-offset-2 disabled:opacity-60"
          >
            {signingOut ? "ログアウト中…" : "ログアウト"}
          </button>
        </>
      )}
    </div>
  );
}
