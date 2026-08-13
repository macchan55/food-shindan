"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { linkPendingResumeSessionIfAny } from "@/lib/resume/pending-session";

type Account = { kind: "anonymous" } | { kind: "registered"; email: string };

// Every /resume/* page needs *some* signed-in user to own the data it reads/writes, but
// registration itself is only required at download time (see /resume/preview). So this
// silently starts a Supabase anonymous session on first visit if there's no session yet —
// same auth.users row, same RLS, same API routes as a real account; upgraded in place via
// auth.updateUser() when the user actually registers.
export default function ResumeLayout({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [account, setAccount] = useState<Account | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function ensureSession() {
      const supabase = supabaseBrowser();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      let current = user;
      if (!current) {
        const { data, error: anonError } = await supabase.auth.signInAnonymously();
        if (anonError) {
          if (!cancelled) setError(anonError.message);
          return;
        }
        current = data.user;
      }
      await linkPendingResumeSessionIfAny();
      if (!cancelled) {
        setAccount(
          current?.is_anonymous
            ? { kind: "anonymous" }
            : { kind: "registered", email: current?.email ?? "" }
        );
        setReady(true);
      }
    }
    ensureSession();
    return () => {
      cancelled = true;
    };
    // This layout instance persists across navigation within /resume/* (Next.js keeps the
    // same layout mounted), so this only re-runs when leaving and re-entering the /resume
    // tree — which is exactly when the account can have changed (e.g. via /register).
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

  return (
    <>
      {account && <ResumeAccountBanner account={account} />}
      {children}
    </>
  );
}

// The履歴書作成 flow writes real personal data (name, address, phone, work history) over
// several separate pages, so "am I actually signed in, and as who?" needs to stay visible
// on every step here — not just as the thin site-wide bar (see AuthStatus), which people
// were missing entirely.
function ResumeAccountBanner({ account }: { account: Account }) {
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);

  async function handleLogout() {
    setSigningOut(true);
    try {
      await supabaseBrowser().auth.signOut();
      router.push("/");
      router.refresh();
    } finally {
      setSigningOut(false);
    }
  }

  if (account.kind === "registered") {
    return (
      <div className="mx-auto flex w-full max-w-xl items-center justify-between gap-2 px-6 pt-4 text-xs">
        <span className="rounded-full bg-brand-soft px-3 py-1 font-bold text-brand-dark">
          ✓ {account.email} でログイン中
        </span>
        <button
          onClick={handleLogout}
          disabled={signingOut}
          className="font-bold text-foreground/50 underline underline-offset-2 disabled:opacity-60"
        >
          {signingOut ? "ログアウト中…" : "ログアウト"}
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-xl items-center justify-between gap-2 px-6 pt-4 text-xs">
      <span className="rounded-full bg-neutral-100 px-3 py-1 font-bold text-neutral-600">
        ゲストとして利用中（この端末のみ・未保存の会員登録なし）
      </span>
      <Link
        href="/register?next=/resume"
        className="font-bold text-brand-dark underline underline-offset-2"
      >
        会員登録する
      </Link>
    </div>
  );
}
