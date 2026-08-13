"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { linkPendingResumeSessionIfAny } from "@/lib/resume/pending-session";

function RegisterForm() {
  const router = useRouter();
  const next = useSearchParams().get("next") || "/resume";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [needsConfirmation, setNeedsConfirmation] = useState(false);

  // Scores the registration event (⑤) then routes through the mandatory 5-item
  // preferences step (②③) before continuing on to wherever the caller wanted to go.
  async function goToPreferences() {
    await fetch("/api/account/register-complete", { method: "POST" }).catch(() => {});
    router.push(`/register/preferences?next=${encodeURIComponent(next)}`);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const supabase = supabaseBrowser();
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();

      // Where Supabase sends the user after clicking the email confirmation link. Passed
      // explicitly (rather than relying on the Supabase dashboard's Site URL) so it always
      // matches wherever this app is actually running — the dashboard's Site URL still has
      // to allow-list this origin under Authentication > URL Configuration, though.
      const emailRedirectTo = `${window.location.origin}/register/preferences?next=${encodeURIComponent(next)}`;

      // Coming from the resume builder means an anonymous session already exists with the
      // user's entered data attached to it — upgrade that session in place (same user id,
      // same rows) instead of creating a brand new account.
      if (currentUser?.is_anonymous) {
        const { data, error: updateError } = await supabase.auth.updateUser(
          { email, password },
          { emailRedirectTo }
        );
        if (updateError) {
          setError(updateError.message);
          return;
        }
        if (data.user && !data.user.is_anonymous) {
          await goToPreferences();
        } else {
          setNeedsConfirmation(true);
        }
        return;
      }

      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo },
      });
      if (signUpError) {
        setError(signUpError.message);
        return;
      }
      if (data.session) {
        await linkPendingResumeSessionIfAny();
        await goToPreferences();
      } else {
        setNeedsConfirmation(true);
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (needsConfirmation) {
    return (
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-4 px-6 py-16 text-center">
        <h1 className="text-xl font-bold text-brand-dark">確認メールを送りました</h1>
        <p className="text-sm text-foreground/70">
          {email} 宛に届いたメールのリンクを開いて登録を完了してください。入力していただいた内容はそのまま引き継がれます。
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-6 px-6 py-16">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-brand-dark">会員登録</h1>
        <p className="mt-1 text-sm text-foreground/60">
          ここまで入力した内容はそのまま引き継がれます。ダウンロードにはメールアドレスの登録が必要です。
        </p>
        <p className="mt-3 rounded-2xl bg-brand-soft/60 px-4 py-2.5 text-xs leading-relaxed text-brand-dark">
          登録しただけで企業への推薦・応募が行われることはありません。営業電話もありません。すべてあなたの操作が起点です。
        </p>
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1 text-sm font-bold text-foreground/70">
          メールアドレス
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-xl border border-border bg-surface px-3 py-2 text-base font-normal outline-none focus:border-brand"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-bold text-foreground/70">
          パスワード（8文字以上）
          <input
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded-xl border border-border bg-surface px-3 py-2 text-base font-normal outline-none focus:border-brand"
          />
        </label>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="rounded-full bg-brand px-6 py-3 text-center font-bold text-white shadow-sm transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {submitting ? "登録中…" : "登録する"}
        </button>
      </form>
      <p className="text-center text-sm text-foreground/60">
        すでにアカウントをお持ちの方は{" "}
        <Link href="/login" className="font-bold text-brand-dark underline">
          ログイン
        </Link>
      </p>
    </main>
  );
}

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterForm />
    </Suspense>
  );
}
