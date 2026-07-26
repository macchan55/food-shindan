"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { RESUME_FORMATS, FORMAT_LABELS, FORMAT_DESCRIPTIONS } from "@/lib/resume/pdf/theme";
import type { ResumeFormat } from "@/lib/resume/pdf/types";

const DOCS = [
  { type: "rirekisho", label: "履歴書" },
  { type: "shokumu", label: "職務経歴書" },
] as const;

export default function PreviewPage() {
  const [active, setActive] = useState<(typeof DOCS)[number]["type"]>("rirekisho");
  const [format, setFormat] = useState<ResumeFormat>("standard");
  const [isAnonymous, setIsAnonymous] = useState<boolean | null>(null);

  useEffect(() => {
    supabaseBrowser()
      .auth.getUser()
      .then(({ data }) => setIsAnonymous(data.user?.is_anonymous ?? true));
  }, []);

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 px-6 py-10">
      <div>
        <Link href="/resume" className="text-sm text-foreground/60 underline">
          ← 履歴書作成に戻る
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-brand-dark">プレビュー</h1>
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
            href={`/api/resume/pdf?type=${active}&format=${format}&download=1`}
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
        <p className="text-xs text-foreground/50">
          プレビューはこのまま自由にご覧いただけます。PDFのダウンロードにはメールアドレスの登録が必要です（入力した内容はそのまま引き継がれます）。
        </p>
      )}

      <div>
        <p className="mb-2 text-sm font-bold text-brand-dark">デザイン</p>
        <div className="flex flex-wrap gap-2">
          {RESUME_FORMATS.map((f) => (
            <button
              key={f}
              onClick={() => setFormat(f)}
              className={`rounded-2xl border px-4 py-2 text-left text-sm transition-colors ${
                format === f
                  ? "border-brand bg-brand-soft text-brand-dark"
                  : "border-border text-foreground/60 hover:border-brand/60"
              }`}
            >
              <span className="block font-bold">{FORMAT_LABELS[f]}</span>
              <span className="block text-xs font-normal opacity-80">{FORMAT_DESCRIPTIONS[f]}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border shadow-sm">
        <iframe
          key={`${active}-${format}`}
          src={`/api/resume/pdf?type=${active}&format=${format}`}
          title={DOCS.find((d) => d.type === active)?.label}
          className="h-[80vh] w-full"
        />
      </div>
    </main>
  );
}
