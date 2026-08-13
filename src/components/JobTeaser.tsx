"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type JobPostingView = {
  id: string;
  storeName: string;
  storeNameRevealed: boolean;
  isMichelin: boolean;
  area: string | null;
  businessFormat: string | null;
  role: string | null;
  annualIncomeMin: number | null;
  annualIncomeMax: number | null;
  summary: string;
  isConfidential: boolean;
};

function incomeLabel(min: number | null, max: number | null): string | null {
  if (!min && !max) return null;
  const fmt = (n: number) => `${Math.round(n / 10000)}万円`;
  if (min && max) return `年収 ${fmt(min)}〜${fmt(max)}`;
  if (min) return `年収 ${fmt(min)}〜`;
  return `〜年収 ${fmt(max as number)}`;
}

// ④ shown right below the diagnosis result: a few Michelin-leaning postings, store name
// hidden, to make "この診断、転職にも使えるかも" concrete before asking for anything.
export function JobTeaser() {
  const [postings, setPostings] = useState<JobPostingView[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/jobs")
      .then((r) => r.json())
      .then((d) => {
        if (!cancelled) setPostings(d.postings ?? []);
      })
      .catch(() => {
        if (!cancelled) setPostings([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!postings || postings.length === 0) return null;

  return (
    <section className="space-y-3 rounded-3xl border border-border bg-surface p-5 shadow-sm">
      <div>
        <h2 className="text-lg font-bold text-brand-dark">あなたに合いそうな求人</h2>
        <p className="text-xs text-foreground/60">JSTARs提携のミシュラン掲載店を含む非公開求人</p>
      </div>
      <ul className="flex flex-col gap-2">
        {postings.map((p) => (
          <li key={p.id} className="rounded-2xl border border-border bg-background p-4">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              {p.isMichelin && (
                <span className="rounded-full bg-amber-100 px-2 py-0.5 font-bold text-amber-800">
                  ミシュラン掲載
                </span>
              )}
              {p.area && <span className="text-foreground/60">{p.area}</span>}
              {p.businessFormat && <span className="text-foreground/60">・{p.businessFormat}</span>}
            </div>
            <p className="mt-1 text-sm font-bold text-foreground/50">{p.storeName}</p>
            <p className="mt-1 text-sm leading-relaxed text-foreground/80">{p.summary}</p>
            <div className="mt-1 flex flex-wrap gap-2 text-xs text-foreground/60">
              {p.role && <span>{p.role}</span>}
              {incomeLabel(p.annualIncomeMin, p.annualIncomeMax) && (
                <span>{incomeLabel(p.annualIncomeMin, p.annualIncomeMax)}</span>
              )}
            </div>
          </li>
        ))}
      </ul>
      <Link
        href="/jobs"
        className="block w-full rounded-full bg-brand px-6 py-3 text-center text-sm font-bold text-white shadow-sm transition-opacity hover:opacity-90"
      >
        無料登録して全ての求人を見る
      </Link>
      <p className="text-center text-xs text-foreground/50">
        登録しただけで推薦・応募されることはありません
      </p>
    </section>
  );
}
