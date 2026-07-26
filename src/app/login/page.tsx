"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { linkPendingResumeSessionIfAny } from "@/lib/resume/pending-session";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const { error: signInError } = await supabaseBrowser().auth.signInWithPassword({
        email,
        password,
      });
      if (signInError) {
        setError(signInError.message);
        return;
      }
      await linkPendingResumeSessionIfAny();
      router.push("/resume");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-6 px-6 py-16">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-brand-dark">ログイン</h1>
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
          パスワード
          <input
            type="password"
            required
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
          {submitting ? "ログイン中…" : "ログイン"}
        </button>
      </form>
      <p className="text-center text-sm text-foreground/60">
        アカウントをお持ちでない方は{" "}
        <Link href="/register" className="font-bold text-brand-dark underline">
          会員登録
        </Link>
      </p>
    </main>
  );
}
