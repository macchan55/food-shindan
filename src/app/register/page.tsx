"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { linkPendingResumeSessionIfAny } from "@/lib/resume/pending-session";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [needsConfirmation, setNeedsConfirmation] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const { data, error: signUpError } = await supabaseBrowser().auth.signUp({
        email,
        password,
      });
      if (signUpError) {
        setError(signUpError.message);
        return;
      }
      if (data.session) {
        await linkPendingResumeSessionIfAny();
        router.push("/resume");
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
          {email} 宛に届いたメールのリンクを開いて登録を完了してください。完了後、こちらから
          <Link href="/login" className="mx-1 font-bold text-brand-dark underline">
            ログイン
          </Link>
          できます。
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-6 px-6 py-16">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-brand-dark">会員登録</h1>
        <p className="mt-1 text-sm text-foreground/60">
          診断結果を反映した履歴書を作成できます
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
