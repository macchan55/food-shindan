"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { prefetchQuestions } from "@/lib/diagnosis/questionsCache";

type Gender = "male" | "female";

const GENDER_OPTIONS: { value: Gender; label: string; emoji: string }[] = [
  { value: "female", label: "女性", emoji: "🙋‍♀️" },
  { value: "male", label: "男性", emoji: "🙋‍♂️" },
];

export function StartButton() {
  const router = useRouter();
  const [gender, setGender] = useState<Gender | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Kicks off the question-bank fetch the moment this page is on screen — well before the
  // user finishes reading the intro and taps 診断をはじめる — so handleStart below usually
  // finds it already resolved instead of paying for it after session creation too.
  useEffect(() => {
    prefetchQuestions().catch(() => {});
  }, []);

  async function handleStart(selected: Gender | null) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/diagnosis/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(selected ? { gender: selected } : {}),
      });
      if (!res.ok) throw new Error("診断セッションの作成に失敗しました");
      const { session } = await res.json();
      router.push(`/diagnosis/${session.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "エラーが発生しました");
      setLoading(false);
    }
  }

  return (
    <div className="flex w-full max-w-xs flex-col items-center gap-4">
      <div className="w-full space-y-2 text-center">
        <p className="text-sm font-bold text-foreground/70">結果のキャラクターを選んでね</p>
        <div className="grid grid-cols-2 gap-3">
          {GENDER_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setGender(opt.value)}
              className={`flex flex-col items-center gap-1 rounded-3xl border-2 py-4 transition-all ${
                gender === opt.value
                  ? "border-brand bg-brand-soft shadow-md"
                  : "border-border bg-surface hover:border-brand/60"
              }`}
            >
              <span className="text-3xl">{opt.emoji}</span>
              <span className="font-bold">{opt.label}</span>
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={() => handleStart(gender)}
        disabled={loading || !gender}
        className="inline-flex h-14 w-full items-center justify-center rounded-full bg-brand px-8 text-lg font-bold text-white shadow-lg shadow-brand/30 transition-transform hover:scale-[1.02] active:scale-95 disabled:opacity-40"
      >
        {loading ? "準備中…" : "診断をはじめる"}
      </button>
      <button
        onClick={() => handleStart(null)}
        disabled={loading}
        className="text-xs font-medium text-foreground/40 underline underline-offset-4 disabled:opacity-40"
      >
        選ばずにはじめる
      </button>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
