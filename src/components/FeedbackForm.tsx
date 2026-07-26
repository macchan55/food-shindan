"use client";

import { useState } from "react";

const OPTIONS = [
  { value: "very_accurate", label: "とても当たっている" },
  { value: "somewhat_accurate", label: "まあ当たっている" },
  { value: "neutral", label: "どちらともいえない" },
  { value: "somewhat_inaccurate", label: "あまり当たっていない" },
  { value: "very_inaccurate", label: "全く当たっていない" },
];

export function FeedbackForm({ sessionId }: { sessionId: string }) {
  const [rating, setRating] = useState<string | null>(null);
  const [comment, setComment] = useState("");
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  async function submit(selected: string) {
    setRating(selected);
    setSending(true);
    try {
      await fetch(`/api/diagnosis/sessions/${sessionId}/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating: selected, comment: comment || undefined }),
      });
      setSent(true);
    } finally {
      setSending(false);
    }
  }

  if (sent) {
    return (
      <div className="rounded-3xl border border-border bg-surface p-4 text-center text-sm font-medium text-foreground/70 shadow-sm">
        フィードバックありがとうございました！
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-border bg-surface p-4 shadow-sm">
      <p className="mb-3 text-sm font-bold">今回の診断は自分に当たっていましたか？</p>
      <div className="flex flex-wrap gap-2">
        {OPTIONS.map((opt) => (
          <button
            key={opt.value}
            disabled={sending}
            onClick={() => submit(opt.value)}
            className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
              rating === opt.value
                ? "border-brand bg-brand-soft text-brand-dark"
                : "border-border hover:border-brand/60"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="任意コメント"
        rows={2}
        className="mt-3 w-full rounded-lg border border-border bg-background p-2 text-sm outline-none focus:border-brand"
      />
    </div>
  );
}
