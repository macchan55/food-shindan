"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { IndustryFitBadge } from "@/components/IndustryFitBadge";
import { RadarChart, RadarScoreLegend } from "@/components/RadarChart";
import { RankingList } from "@/components/RankingList";
import { FeedbackForm } from "@/components/FeedbackForm";
import { Sunburst } from "@/components/Sunburst";
import { familyColor } from "@/lib/family-colors";
import { setPendingResumeSession } from "@/lib/resume/pending-session";

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
  imageUrl: string | null;
  personalityAnalysis: string | null;
  abilityAnalysis: string | null;
  growthAdvice: string | null;
  careerPath: string | null;
  typeMoments: string[];
};

type CompatibleType = TypeSummary & { compatibleReason: string | null };

type ResultData = {
  sessionId: string;
  type: TypeSummary;
  hiddenType: TypeSummary | null;
  compatibleType: CompatibleType | null;
  industryFit: { score: number; tier: string };
  careerRanking: { id: string; name: string; matchScore: number }[];
  formatRanking: { id: string; name: string; matchScore: number }[];
  roleRanking: { id: string; name: string; matchScore: number }[];
  scores: Record<string, { raw: number; max: number; normalized: number; display: number }>;
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
  const colors = familyColor(type.family);

  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-8 px-6 py-10">
      {/* First view - a "reveal" moment, not just a header */}
      <section
        className="animate-pop-in relative -mx-6 space-y-3 overflow-hidden rounded-b-[2.5rem] px-6 pt-10 pb-8 text-center sm:mx-0 sm:rounded-[2.5rem]"
        style={{
          background: `radial-gradient(circle at 50% 8%, ${colors.glow}55, transparent 55%), linear-gradient(160deg, ${colors.heroFrom}, ${colors.heroTo})`,
        }}
      >
        {/* Sunburst rays behind the portrait */}
        <Sunburst
          glowColor={colors.glow}
          className="top-6 left-1/2 h-72 w-72 -translate-x-1/2 opacity-40"
        />

        {type.imageUrl && (
          <div className="relative mx-auto h-52 w-52">
            {/* Shimmering gradient ring */}
            <div
              className="absolute inset-0 rounded-full p-[5px] shadow-2xl"
              style={{
                background: `conic-gradient(from 0deg, ${colors.glow}, #ffffff, ${colors.heroTo}, ${colors.glow})`,
              }}
            >
              <div className="h-full w-full overflow-hidden rounded-full border-4 border-white bg-white">
                <Image
                  src={type.imageUrl}
                  alt={type.name}
                  width={208}
                  height={208}
                  className="h-full w-full object-cover"
                  priority
                />
              </div>
            </div>
            <span className="animate-sparkle absolute -top-1 -right-1 text-3xl drop-shadow">
              ✨
            </span>
            <span
              className="animate-sparkle absolute -bottom-1 -left-2 text-2xl drop-shadow"
              style={{ animationDelay: "0.6s" }}
            >
              ⭐
            </span>
          </div>
        )}
        <p className="relative text-sm font-bold tracking-wide text-white/90 drop-shadow">
          {type.family}
        </p>
        <h1 className="relative text-4xl font-extrabold text-white drop-shadow-md">
          {type.name}
        </h1>
        <p className="relative text-lg font-bold text-white/95 drop-shadow">{type.catchcopy}</p>
        <div className="relative">
          <IndustryFitBadge score={data.industryFit.score} tier={data.industryFit.tier} />
        </div>
        <button
          onClick={handleCopyLink}
          className="relative mt-2 inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/90 px-4 py-2 text-sm font-bold text-foreground backdrop-blur hover:bg-white"
        >
          {copied ? "コピーしました！" : "結果のURLをコピーして共有"}
        </button>
      </section>

      {/* Block 2: description & strengths */}
      <section className="space-y-3 rounded-3xl border border-border bg-surface p-5 shadow-sm">
        <h2 className="text-lg font-bold text-brand-dark">あなたのタイプ</h2>
        <p className="whitespace-pre-line text-sm leading-relaxed text-foreground/80">
          {type.description}
        </p>
        <div>
          <h3 className="mb-1 text-sm font-bold text-foreground/70">主な強み</h3>
          <ul className="flex flex-wrap gap-2">
            {type.strengths.map((s) => (
              <li
                key={s}
                className="rounded-full bg-brand-soft px-3 py-1 text-xs font-medium text-brand-dark"
              >
                {s}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Block 2.5: personality & ability deep-dive */}
      {(type.personalityAnalysis || type.abilityAnalysis) && (
        <section className="space-y-4 rounded-3xl border border-border bg-surface p-5 shadow-sm">
          {type.personalityAnalysis && (
            <div>
              <h2 className="mb-1 text-lg font-bold text-brand-dark">性格分析</h2>
              <p className="whitespace-pre-line text-sm leading-relaxed text-foreground/80">
                {type.personalityAnalysis}
              </p>
            </div>
          )}
          {type.abilityAnalysis && (
            <div>
              <h2 className="mb-1 text-lg font-bold text-brand-dark">能力分析</h2>
              <p className="whitespace-pre-line text-sm leading-relaxed text-foreground/80">
                {type.abilityAnalysis}
              </p>
            </div>
          )}
        </section>
      )}

      {/* Block 3: score breakdown */}
      <section className="space-y-3 rounded-3xl border border-border bg-surface p-5 shadow-sm">
        <h2 className="text-lg font-bold text-brand-dark">能力スコア</h2>
        <RadarChart scores={data.scores} color={colors.glow} />
        <RadarScoreLegend scores={data.scores} />
      </section>

      {/* Block 4: career / format / role ranking */}
      <section className="space-y-4 rounded-3xl border border-border bg-surface p-5 shadow-sm">
        <h2 className="text-lg font-bold text-brand-dark">適職・向いている環境</h2>
        <RankingList title="向いている職種" items={data.careerRanking} />
        <RankingList title="向いている業態" items={data.formatRanking} />
        <RankingList title="向いている役職" items={data.roleRanking} />
      </section>

      {/* Block 4.5: career path & growth advice */}
      {(type.careerPath || type.growthAdvice) && (
        <section className="space-y-4 rounded-3xl border border-border bg-surface p-5 shadow-sm">
          {type.careerPath && (
            <div>
              <h2 className="mb-1 text-lg font-bold text-brand-dark">キャリア提案</h2>
              <p className="whitespace-pre-line text-sm leading-relaxed text-foreground/80">
                {type.careerPath}
              </p>
            </div>
          )}
          {type.growthAdvice && (
            <div>
              <h2 className="mb-1 text-lg font-bold text-brand-dark">成長アドバイス</h2>
              <p className="whitespace-pre-line text-sm leading-relaxed text-foreground/80">
                {type.growthAdvice}
              </p>
            </div>
          )}
        </section>
      )}

      {/* Block 5: weaknesses */}
      <section className="space-y-3 rounded-3xl border border-border bg-surface p-5 shadow-sm">
        <h2 className="text-lg font-bold text-brand-dark">注意点・苦手になりやすい環境</h2>
        <ul className="flex flex-wrap gap-2">
          {type.weaknesses.map((w) => (
            <li
              key={w}
              className="rounded-full border border-border px-3 py-1 text-xs font-medium text-foreground/70"
            >
              {w}
            </li>
          ))}
        </ul>
      </section>

      {/* Block 5.5: type moments ("あるある") */}
      {type.typeMoments.length > 0 && (
        <section
          className="space-y-3 rounded-3xl p-5 shadow-sm"
          style={{ background: `linear-gradient(160deg, ${colors.heroFrom}14, ${colors.heroTo}14)` }}
        >
          <h2 className="text-lg font-bold text-brand-dark">{type.name}あるある</h2>
          <ul className="space-y-2">
            {type.typeMoments.map((m) => (
              <li key={m} className="flex items-start gap-2 text-sm leading-relaxed text-foreground/80">
                <span aria-hidden className="mt-0.5 text-brand">
                  💬
                </span>
                <span>{m}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Block 5.7: compatible type */}
      {data.compatibleType && (
        <section className="space-y-3 rounded-3xl border border-border bg-surface p-5 shadow-sm">
          <h2 className="text-lg font-bold text-brand-dark">相性の良いタイプ</h2>
          <div className="flex items-center gap-4">
            {data.compatibleType.imageUrl && (
              <div className="h-20 w-20 shrink-0 overflow-hidden rounded-full border-2 border-white bg-surface shadow">
                <Image
                  src={data.compatibleType.imageUrl}
                  alt={data.compatibleType.name}
                  width={80}
                  height={80}
                  className="h-full w-full object-cover"
                />
              </div>
            )}
            <div>
              <p className="font-bold">{data.compatibleType.name}</p>
              <p className="text-sm text-foreground/70">{data.compatibleType.catchcopy}</p>
            </div>
          </div>
          {data.compatibleType.compatibleReason && (
            <p className="whitespace-pre-line text-sm leading-relaxed text-foreground/80">
              {data.compatibleType.compatibleReason}
            </p>
          )}
        </section>
      )}

      {/* Block 6: hidden type */}
      {data.hiddenType && (
        <section className="flex items-center gap-4 rounded-3xl border border-dashed border-brand/40 bg-brand-soft/40 p-4">
          {data.hiddenType.imageUrl && (
            <div className="h-16 w-16 shrink-0 overflow-hidden rounded-full border-2 border-white bg-surface shadow">
              <Image
                src={data.hiddenType.imageUrl}
                alt={data.hiddenType.name}
                width={64}
                height={64}
                className="h-full w-full object-cover"
              />
            </div>
          )}
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-brand-dark">
              隠れタイプ
            </p>
            <p className="font-bold">{data.hiddenType.name}</p>
            <p className="text-sm text-foreground/70">{data.hiddenType.catchcopy}</p>
          </div>
        </section>
      )}

      <FeedbackForm sessionId={data.sessionId} />

      {/* Final CTA */}
      <a
        href="/register"
        onClick={() => setPendingResumeSession(data.sessionId)}
        className="block w-full rounded-full bg-brand px-6 py-3 text-center text-sm font-bold text-white shadow-sm transition-opacity hover:opacity-90"
      >
        あなたの診断結果を反映した履歴書を無料で作る
      </a>
    </main>
  );
}
