"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { RESUME_STYLES } from "@/lib/resume/pdf/theme";
import { ResumeTemplateThumb } from "@/components/ResumeTemplateThumb";
import { AddonPanel } from "@/components/AddonPanel";
import type { ResumeStyleId } from "@/lib/resume/pdf/types";

const DOCS = [
  { type: "rirekisho", label: "履歴書" },
  { type: "shokumu", label: "職務経歴書" },
] as const;

export default function PreviewPage() {
  const [active, setActive] = useState<(typeof DOCS)[number]["type"]>("rirekisho");
  const [styleId, setStyleId] = useState<ResumeStyleId>("traditional");
  const [isAnonymous, setIsAnonymous] = useState<boolean | null>(null);

  useEffect(() => {
    supabaseBrowser()
      .auth.getUser()
      .then(({ data }) => setIsAnonymous(data.user?.is_anonymous ?? true));
  }, []);

  const style = RESUME_STYLES.find((s) => s.id === styleId) ?? RESUME_STYLES[0];
  const template = active === "rirekisho" ? style.rirekishoTemplate : style.shokumuTemplate;

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-6 py-10">
      <div>
        <Link href="/resume" className="text-sm text-foreground/60 underline">
          ← 履歴書作成に戻る
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-brand-dark">プレビュー</h1>
      </div>

      <div>
        <p className="mb-2 text-sm font-bold text-brand-dark">デザインを選ぶ</p>
        <div className="flex flex-wrap justify-center gap-4 rounded-2xl border border-border bg-surface p-4 sm:justify-start">
          {RESUME_STYLES.map((s) => (
            <button
              key={s.id}
              onClick={() => setStyleId(s.id)}
              className={`flex flex-col items-center gap-2 rounded-2xl border-2 p-3 text-center transition-colors ${
                styleId === s.id
                  ? "border-brand bg-brand-soft"
                  : "border-transparent hover:border-brand/40"
              }`}
            >
              <ResumeTemplateThumb id={s.rirekishoTemplate} label={s.label} />
              <span className="max-w-[9rem] text-xs font-normal text-foreground/60">
                {s.description}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {DOCS.map((d) => (
          <button
            key={d.type}
            onClick={() => setActive(d.type)}
            className={`rounded-full border px-4 py-2 text-sm font-bold transition-colors ${
              active === d.type
                ? "border-brand bg-brand-soft text-brand-dark"
                : "border-border text-foreground/60 hover:border-brand/60"
            }`}
          >
            {d.label}
          </button>
        ))}
        {isAnonymous === false && (
          <a
            href={`/api/resume/pdf?type=${active}&template=${template}&download=1`}
            className="ml-auto rounded-full bg-brand px-4 py-2 text-center text-sm font-bold text-white shadow-sm transition-opacity hover:opacity-90"
          >
            PDFをダウンロード
          </a>
        )}
        {isAnonymous === true && (
          <Link
            href="/register?next=/resume/preview"
            className="ml-auto rounded-full bg-brand px-4 py-2 text-center text-sm font-bold text-white shadow-sm transition-opacity hover:opacity-90"
          >
            会員登録してダウンロード
          </Link>
        )}
      </div>
      {isAnonymous === true && (
        <p className="-mt-3 text-xs text-foreground/50">
          プレビューはこのまま自由にご覧いただけます。PDFのダウンロードにはメールアドレスの登録が必要です（入力した内容はそのまま引き継がれます）。
        </p>
      )}

      <div className="overflow-hidden rounded-2xl border border-border shadow-sm">
        <iframe
          key={`${active}-${template}`}
          src={`/api/resume/pdf?type=${active}&template=${template}`}
          title={DOCS.find((d) => d.type === active)?.label}
          className="h-[80vh] w-full"
        />
      </div>

      {isAnonymous === false && <AddonPanel />}
    </main>
  );
}
