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
  interviewRequested: boolean;
};

function incomeLabel(min: number | null, max: number | null): string | null {
  if (!min && !max) return null;
  const fmt = (n: number) => `${Math.round(n / 10000)}万円`;
  if (min && max) return `年収 ${fmt(min)}〜${fmt(max)}`;
  if (min) return `年収 ${fmt(min)}〜`;
  return `〜年収 ${fmt(max as number)}`;
}

export default function JobsPage() {
  const [postings, setPostings] = useState<JobPostingView[] | null>(null);
  const [gated, setGated] = useState(true);
  const [requesting, setRequesting] = useState<string | null>(null);

  function load() {
    return fetch("/api/jobs")
      .then((r) => r.json())
      .then((d) => {
        setPostings(d.postings ?? []);
        setGated(d.gated ?? true);
      });
  }

  useEffect(() => {
    load();
  }, []);

  async function handleInterview(id: string) {
    setRequesting(id);
    try {
      await fetch(`/api/jobs/${id}/interview`, { method: "POST" });
      await load();
    } finally {
      setRequesting(null);
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-6 px-6 py-10">
      <div>
        <h1 className="text-2xl font-bold text-brand-dark">飲食業界の求人</h1>
        <p className="mt-1 text-sm text-foreground/60">
          JSTARs提携の求人です。非公開求人は店名を伏せて掲載しています。
        </p>
        <p className="mt-3 rounded-2xl bg-brand-soft/60 px-4 py-2.5 text-xs leading-relaxed text-brand-dark">
          登録・閲覧しただけで企業への推薦・応募が行われることはありません。営業電話もありません。応募や面談はすべてあなたの操作が起点です。
        </p>
      </div>

      {!postings ? (
        <p className="text-center text-sm text-foreground/60">読み込み中…</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {postings.map((p) => (
            <li key={p.id} className="rounded-2xl border border-border bg-surface p-4 shadow-sm">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                {p.isMichelin && (
                  <span className="rounded-full bg-amber-100 px-2 py-0.5 font-bold text-amber-800">
                    ミシュラン掲載
                  </span>
                )}
                {p.isConfidential && (
                  <span className="rounded-full bg-neutral-100 px-2 py-0.5 font-bold text-neutral-600">
                    非公開求人
                  </span>
                )}
                {p.area && <span className="text-foreground/60">{p.area}</span>}
                {p.businessFormat && (
                  <span className="text-foreground/60">・{p.businessFormat}</span>
                )}
              </div>
              <p
                className={`mt-1 text-sm font-bold ${
                  p.storeNameRevealed ? "text-foreground" : "text-foreground/50"
                }`}
              >
                {p.storeName}
              </p>
              <p className="mt-1 text-sm leading-relaxed text-foreground/80">{p.summary}</p>
              <div className="mt-1 flex flex-wrap gap-2 text-xs text-foreground/60">
                {p.role && <span>{p.role}</span>}
                {incomeLabel(p.annualIncomeMin, p.annualIncomeMax) && (
                  <span>{incomeLabel(p.annualIncomeMin, p.annualIncomeMax)}</span>
                )}
              </div>

              {!gated && p.isConfidential && !p.storeNameRevealed && (
                <button
                  onClick={() => handleInterview(p.id)}
                  disabled={requesting === p.id}
                  className="mt-3 w-full rounded-full bg-brand px-4 py-2 text-center text-sm font-bold text-white shadow-sm transition-opacity hover:opacity-90 disabled:opacity-60"
                >
                  {requesting === p.id ? "設定中…" : "面談を希望する（店名を開示）"}
                </button>
              )}
              {!gated && p.interviewRequested && (
                <p className="mt-2 text-xs font-bold text-brand-dark">
                  面談希望を受け付けました。担当者からご連絡します。
                </p>
              )}
            </li>
          ))}
        </ul>
      )}

      {gated && (
        <Link
          href="/register?next=/jobs"
          className="block w-full rounded-full bg-brand px-6 py-3 text-center text-sm font-bold text-white shadow-sm transition-opacity hover:opacity-90"
        >
          無料登録して全ての求人を見る
        </Link>
      )}
    </main>
  );
}
