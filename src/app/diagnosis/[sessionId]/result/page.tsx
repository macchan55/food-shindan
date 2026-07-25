"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { IndustryFitBadge } from "@/components/IndustryFitBadge";
import { ScoreBars } from "@/components/ScoreBars";
import { RankingList } from "@/components/RankingList";
import { FeedbackForm } from "@/components/FeedbackForm";

type TypeSummary = {
  typeCode: string;
  name: string;
  catchcopy: string;
  description: string;
  family: string;
  strengths: string[];
  weaknesses: string[];
  suitedJobs: string[];
  suitedFormats: string[];
  suitedRoles: string[];
};

type ResultData = {
  sessionId: string;
  type: TypeSummary;
  hiddenType: TypeSummary | null;
  industryFit: { score: number; tier: string };
  careerRanking: { id: string; name: string; matchScore: number }[];
  formatRanking: { id: string; name: string; matchScore: number }[];
  roleRanking: { id: string; name: string; matchScore: number }[];
  scores: Record<string, { raw: number; max: number; normalized: number }>;
};

export default function DiagnosisResultPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const [data, setData] = useState<ResultData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch(`/api/diagnosis/sessions/${sessionId}/result`);
        if (!res.ok) throw new Error("結果の取得に失敗しました");
        const json = await res.json();
        if (!cancelled) setData(json);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "エラーが発生しました");
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  function handleCopyLink() {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  if (error) {
    return (
      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center gap-4 px-6 py-16 text-center">
        <p className="text-red-600">{error}</p>
      </main>
    );
  }

  if (!data) {
    return (
      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center px-6 py-16 text-center text-foreground/60">
        読み込み中…
      </main>
    );
  }

  const { type } = data;

  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-8 px-6 py-10">
      {/* First view */}
      <section className="space-y-3 text-center">
        <p className="text-sm font-medium text-brand-dark">{type.family}</p>
        <h1 className="text-3xl font-bold">{type.name}</h1>
        <p className="text-lg text-foreground/80">{type.catchcopy}</p>
        <IndustryFitBadge score={data.industryFit.score} tier={data.industryFit.tier} />
        <button
          onClick={handleCopyLink}
          className="mt-2 inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2 text-sm hover:border-brand/60"
        >
          {copied ? "コピーしました！" : "結果のURLをコピーして共有"}
        </button>
      </section>

      {/* Block 2: description & strengths */}
      <section className="space-y-3">
        <h2 className="text-lg font-bold">あなたのタイプ</h2>
        <p className="whitespace-pre-line text-sm leading-relaxed text-foreground/80">
          {type.description}
        </p>
        <div>
          <h3 className="mb-1 text-sm font-semibold text-foreground/70">主な強み</h3>
          <ul className="flex flex-wrap gap-2">
            {type.strengths.map((s) => (
              <li key={s} className="rounded-full bg-brand-soft px-3 py-1 text-xs text-brand-dark">
                {s}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Block 3: score breakdown */}
      <section className="space-y-3">
        <h2 className="text-lg font-bold">能力スコア</h2>
        <ScoreBars scores={data.scores} />
      </section>

      {/* Block 4: career / format / role ranking */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold">適職・向いている環境</h2>
        <RankingList title="向いている職種" items={data.careerRanking} />
        <RankingList title="向いている業態" items={data.formatRanking} />
        <RankingList title="向いている役職" items={data.roleRanking} />
      </section>

      {/* Block 5: weaknesses */}
      <section className="space-y-3">
        <h2 className="text-lg font-bold">注意点・苦手になりやすい環境</h2>
        <ul className="flex flex-wrap gap-2">
          {type.weaknesses.map((w) => (
            <li
              key={w}
              className="rounded-full border border-border px-3 py-1 text-xs text-foreground/70"
            >
              {w}
            </li>
          ))}
        </ul>
      </section>

      {/* Block 6: hidden type */}
      {data.hiddenType && (
        <section className="space-y-2 rounded-2xl border border-dashed border-brand/40 bg-brand-soft/40 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-dark">
            隠れタイプ
          </p>
          <p className="font-bold">{data.hiddenType.name}</p>
          <p className="text-sm text-foreground/70">{data.hiddenType.catchcopy}</p>
        </section>
      )}

      <FeedbackForm sessionId={data.sessionId} />

      {/* Final CTA - resume builder ships in a later sprint */}
      <button
        disabled
        className="w-full cursor-not-allowed rounded-full border border-border bg-surface px-6 py-3 text-center text-sm text-foreground/40"
        title="履歴書作成機能は今後のアップデートで提供予定です"
      >
        あなたの診断結果を反映した履歴書を無料で作る（近日公開）
      </button>
    </main>
  );
}
