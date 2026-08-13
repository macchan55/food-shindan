"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ProgressBar } from "@/components/ProgressBar";
import { ResumeTemplateThumb } from "@/components/ResumeTemplateThumb";
import { RIREKISHO_TEMPLATES } from "@/lib/resume/pdf/theme";

const PROFILE_STEP = { href: "/resume/profile", label: "基本情報", icon: "👤", key: "profile" as const };
const EDUCATION_STEP = { href: "/resume/education", label: "学歴", icon: "🎓", key: "education" as const };
const WORK_STEP = { href: "/resume/work", label: "職歴", icon: "💼", key: "work" as const };
const QUALIFICATIONS_STEP = {
  href: "/resume/qualifications",
  label: "資格",
  icon: "📜",
  key: "qualifications" as const,
};
const SELF_PR_STEP = {
  href: "/resume/self-pr",
  label: "自己PR・職務要約（AI作成）",
  icon: "✍️",
  key: "selfPr" as const,
};

type StepKey = "profile" | "education" | "work" | "qualifications" | "selfPr";
type Done = Record<StepKey, boolean>;
type EntryOrder = "education_first" | "work_first";

// ⑧ 飲食業界は学歴の重みが軽いので、職歴から先に埋めたい人向けに順序を選べるようにする。
// 入力するフィールド自体は変えず、ダッシュボードの提示順だけ切り替える。
function stepsFor(entryOrder: EntryOrder) {
  const historySteps = entryOrder === "work_first" ? [WORK_STEP, EDUCATION_STEP] : [EDUCATION_STEP, WORK_STEP];
  return [PROFILE_STEP, ...historySteps, QUALIFICATIONS_STEP, SELF_PR_STEP];
}

export default function ResumeDashboardPage() {
  const [done, setDone] = useState<Done | null>(null);
  const [entryOrder, setEntryOrder] = useState<EntryOrder>("education_first");

  useEffect(() => {
    Promise.all([
      fetch("/api/resume/profile").then((r) => r.json()),
      fetch("/api/resume/education").then((r) => r.json()),
      fetch("/api/resume/work-experiences").then((r) => r.json()),
      fetch("/api/resume/qualifications").then((r) => r.json()),
      fetch("/api/resume").then((r) => r.json()),
    ]).then(([p, e, w, q, r]) => {
      setDone({
        profile: Boolean(p.profile?.full_name && p.profile?.address),
        education: (e.education ?? []).length > 0,
        work: (w.workExperiences ?? []).length > 0,
        qualifications: (q.qualifications ?? []).length > 0,
        selfPr: Boolean(r.resume?.self_pr),
      });
      if (r.resume?.entry_order) setEntryOrder(r.resume.entry_order);
    });
  }, []);

  async function handleEntryOrderChange(next: EntryOrder) {
    setEntryOrder(next);
    await fetch("/api/resume", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ entry_order: next }),
    });
  }

  const STEPS = stepsFor(entryOrder);
  const completedCount = done ? Object.values(done).filter(Boolean).length : 0;
  const started = completedCount > 0;
  const nextStep = STEPS.find((s) => !done?.[s.key]) ?? STEPS[0];

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-10 px-6 py-10">
      <section className="flex flex-col items-center gap-5 text-center">
        <span className="rounded-full bg-brand-soft px-4 py-1 text-xs font-bold text-brand-dark">
          飲食業界特化の履歴書作成
        </span>
        <h1 className="text-2xl font-bold leading-snug text-brand-dark sm:text-3xl">
          AIがあなたの強みを言語化。
          <br />
          3分でプロ品質の履歴書が完成
        </h1>
        <p className="max-w-md text-sm leading-relaxed text-foreground/60">
          診断結果と職歴から、AIが自己PR・職務要約を下書き。お好みのデザインを選ぶだけで、そのまま履歴書・職務経歴書のPDFになります。
        </p>

        <div className="flex w-full justify-center gap-4 overflow-x-auto px-1 py-2">
          {RIREKISHO_TEMPLATES.map((t) => (
            <ResumeTemplateThumb key={t.id} id={t.id} label={t.label} />
          ))}
        </div>

        <div className="flex w-full flex-col items-center gap-2">
          <Link
            href={nextStep.href}
            className="w-full rounded-full bg-brand px-6 py-3.5 text-center text-base font-bold text-white shadow-md transition-opacity hover:opacity-90 sm:w-auto sm:px-10"
          >
            {started ? "続きから入力する" : "履歴書を作りはじめる ✨"}
          </Link>
          <Link
            href="/resume/preview"
            className="text-xs font-bold text-foreground/50 underline underline-offset-4"
          >
            サンプルをプレビューで見る
          </Link>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-bold text-foreground/70">入力状況</p>
          <p className="text-xs font-bold text-brand-dark">
            {done ? `${completedCount} / ${STEPS.length} 完了` : "…"}
          </p>
        </div>
        <ProgressBar current={completedCount} total={STEPS.length} />

        <div className="flex items-center gap-2 text-xs">
          <span className="font-bold text-foreground/50">入力の順番：</span>
          <button
            onClick={() => handleEntryOrderChange("education_first")}
            className={`rounded-full border px-3 py-1 font-bold transition-colors ${
              entryOrder === "education_first"
                ? "border-brand bg-brand-soft text-brand-dark"
                : "border-border text-foreground/60"
            }`}
          >
            学歴から
          </button>
          <button
            onClick={() => handleEntryOrderChange("work_first")}
            className={`rounded-full border px-3 py-1 font-bold transition-colors ${
              entryOrder === "work_first"
                ? "border-brand bg-brand-soft text-brand-dark"
                : "border-border text-foreground/60"
            }`}
          >
            職歴から
          </button>
        </div>

        <ul className="mt-1 flex flex-col gap-3">
          {STEPS.map((step) => (
            <li key={step.key}>
              <Link
                href={step.href}
                className="flex items-center gap-3 rounded-2xl border border-border bg-surface px-4 py-3 shadow-sm transition-colors hover:border-brand/60"
              >
                <span className="text-lg" aria-hidden>
                  {step.icon}
                </span>
                <span className="flex-1 font-medium">{step.label}</span>
                {done?.[step.key] ? (
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand text-xs font-bold text-white">
                    ✓
                  </span>
                ) : (
                  <span className="text-xs font-bold text-foreground/40">
                    {done ? "未入力" : "…"}
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
