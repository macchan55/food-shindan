"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const STEPS = [
  { href: "/resume/profile", label: "基本情報", key: "profile" as const },
  { href: "/resume/education", label: "学歴", key: "education" as const },
  { href: "/resume/work", label: "職歴", key: "work" as const },
  { href: "/resume/qualifications", label: "資格", key: "qualifications" as const },
  { href: "/resume/self-pr", label: "自己PR・職務要約（AI作成）", key: "selfPr" as const },
];

type Done = Record<(typeof STEPS)[number]["key"], boolean>;

export default function ResumeDashboardPage() {
  const [done, setDone] = useState<Done | null>(null);

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
    });
  }, []);

  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-6 px-6 py-10">
      <div>
        <h1 className="text-2xl font-bold text-brand-dark">履歴書を作成</h1>
        <p className="mt-1 text-sm text-foreground/60">
          各項目を入力すると、履歴書と職務経歴書をいつでもプレビューできます。ダウンロード時のみ会員登録が必要です。
        </p>
      </div>

      <ul className="flex flex-col gap-3">
        {STEPS.map((step) => (
          <li key={step.key}>
            <Link
              href={step.href}
              className="flex items-center justify-between rounded-2xl border border-border bg-surface px-4 py-3 shadow-sm transition-colors hover:border-brand/60"
            >
              <span className="font-medium">{step.label}</span>
              <span
                className={`text-xs font-bold ${
                  done?.[step.key] ? "text-brand-dark" : "text-foreground/40"
                }`}
              >
                {done ? (done[step.key] ? "入力済み" : "未入力") : "…"}
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <Link
        href="/resume/preview"
        className="block w-full rounded-full bg-brand px-6 py-3 text-center text-sm font-bold text-white shadow-sm transition-opacity hover:opacity-90"
      >
        履歴書・職務経歴書をプレビュー
      </Link>
    </main>
  );
}
