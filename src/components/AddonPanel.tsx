"use client";

import { useEffect, useState } from "react";

type AddonType = "resume_review" | "interview_prep" | "translation";

const ADDONS: { type: AddonType; label: string; description: string; icon: string }[] = [
  { type: "resume_review", label: "プロによる添削", description: "履歴書・職務経歴書をプロが1対1で添削", icon: "📝" },
  { type: "interview_prep", label: "面接対策", description: "飲食業界特化の模擬面接・想定質問対策", icon: "🎤" },
  { type: "translation", label: "多言語代行", description: "海外就労向けに履歴書を多言語化", icon: "🌐" },
];

// ⑩ optional paid add-ons, always beside the free flow — never a gate on it. Interest
// capture only (no payment here); follow-up happens off-platform.
export function AddonPanel() {
  const [requested, setRequested] = useState<Set<AddonType>>(new Set());
  const [pending, setPending] = useState<AddonType | null>(null);

  useEffect(() => {
    fetch("/api/resume/addons")
      .then((r) => r.json())
      .then((d) => {
        const types = (d.requests ?? []).map((r: { addon_type: AddonType }) => r.addon_type);
        setRequested(new Set(types));
      })
      .catch(() => {});
  }, []);

  async function handleRequest(type: AddonType) {
    setPending(type);
    try {
      await fetch("/api/resume/addons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ addonType: type }),
      });
      setRequested((prev) => new Set(prev).add(type));
    } finally {
      setPending(null);
    }
  }

  return (
    <section className="space-y-3 rounded-2xl border border-dashed border-border bg-surface p-4">
      <div>
        <p className="text-sm font-bold text-brand-dark">もっと本気で転職したい方へ（任意）</p>
        <p className="text-xs text-foreground/50">
          履歴書・PDF作成は今後もずっと無料です。以下は希望者のみの有料オプションです。
        </p>
      </div>
      <ul className="grid gap-2 sm:grid-cols-3">
        {ADDONS.map((addon) => {
          const done = requested.has(addon.type);
          return (
            <li
              key={addon.type}
              className="flex flex-col gap-1.5 rounded-xl border border-border bg-background p-3"
            >
              <span className="text-lg" aria-hidden>
                {addon.icon}
              </span>
              <p className="text-xs font-bold">{addon.label}</p>
              <p className="text-[11px] leading-relaxed text-foreground/60">{addon.description}</p>
              <button
                onClick={() => handleRequest(addon.type)}
                disabled={done || pending === addon.type}
                className={`mt-1 rounded-full px-3 py-1.5 text-xs font-bold transition-opacity ${
                  done
                    ? "bg-brand-soft text-brand-dark"
                    : "bg-brand text-white hover:opacity-90 disabled:opacity-60"
                }`}
              >
                {done ? "申込み受付済み" : pending === addon.type ? "送信中…" : "相談を申し込む"}
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
