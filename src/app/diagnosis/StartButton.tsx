"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function StartButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleStart() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/diagnosis/sessions", { method: "POST" });
      if (!res.ok) throw new Error("診断セッションの作成に失敗しました");
      const { session } = await res.json();
      router.push(`/diagnosis/${session.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "エラーが発生しました");
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <button
        onClick={handleStart}
        disabled={loading}
        className="inline-flex h-14 w-full max-w-xs items-center justify-center rounded-full bg-brand px-8 text-lg font-semibold text-white shadow-lg shadow-brand/20 transition-transform hover:scale-[1.02] active:scale-95 disabled:opacity-60"
      >
        {loading ? "準備中…" : "診断をはじめる"}
      </button>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
