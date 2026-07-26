"use client";

import { useState } from "react";
import Link from "next/link";

const DOCS = [
  { type: "rirekisho", label: "履歴書" },
  { type: "shokumu", label: "職務経歴書" },
] as const;

export default function PreviewPage() {
  const [active, setActive] = useState<(typeof DOCS)[number]["type"]>("rirekisho");

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 px-6 py-10">
      <div>
        <Link href="/resume" className="text-sm text-foreground/60 underline">
          ← 履歴書作成に戻る
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-brand-dark">プレビュー</h1>
      </div>

      <div className="flex gap-2">
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
        <a
          href={`/api/resume/pdf?type=${active}&download=1`}
          className="ml-auto rounded-full bg-brand px-4 py-2 text-center text-sm font-bold text-white shadow-sm transition-opacity hover:opacity-90"
        >
          PDFをダウンロード
        </a>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border shadow-sm">
        <iframe
          key={active}
          src={`/api/resume/pdf?type=${active}`}
          title={DOCS.find((d) => d.type === active)?.label}
          className="h-[80vh] w-full"
        />
      </div>
    </main>
  );
}
