"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type ResumeText = {
  target_job: string | null;
  work_summary: string | null;
  self_pr: string | null;
  strengths_text: string | null;
  motivation: string | null;
  career_direction: string | null;
};

const EMPTY: ResumeText = {
  target_job: "",
  work_summary: "",
  self_pr: "",
  strengths_text: "",
  motivation: "",
  career_direction: "",
};

export default function SelfPrPage() {
  const [text, setText] = useState<ResumeText>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/resume")
      .then((r) => r.json())
      .then((d) => {
        if (d.resume) setText({ ...EMPTY, ...d.resume });
      })
      .finally(() => setLoading(false));
  }, []);

  function set<K extends keyof ResumeText>(key: K, value: ResumeText[K]) {
    setText((t) => ({ ...t, [key]: value }));
    setSaved(false);
  }

  async function handleGenerate() {
    setGenerating(true);
    setError(null);
    try {
      const res = await fetch("/api/resume/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetJob: text.target_job || undefined }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => null);
        setError(d?.error ?? "AI生成に失敗しました");
        return;
      }
      const d = await res.json();
      setText((t) => ({
        ...t,
        work_summary: d.draft.workSummary,
        self_pr: d.draft.selfPr,
        strengths_text: d.draft.strengthsText,
        motivation: d.draft.motivation,
        career_direction: d.draft.careerDirection,
      }));
      setSaved(false);
    } finally {
      setGenerating(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    try {
      await fetch("/api/resume", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(text),
      });
      setSaved(true);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="mx-auto flex w-full max-w-xl flex-1 items-center justify-center px-6 py-16 text-foreground/60">
        読み込み中…
      </main>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-6 px-6 py-10">
      <div>
        <Link href="/resume" className="text-sm text-foreground/60 underline">
          ← 履歴書作成に戻る
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-brand-dark">自己PR・職務要約</h1>
        <p className="mt-1 text-sm text-foreground/60">
          診断結果と職歴をもとに、AIが文章の下書きを作成します。内容は自由に編集できます。
        </p>
      </div>

      <label className="flex flex-col gap-1 text-sm font-bold text-foreground/70">
        志望職種（任意・空欄でも作成できます）
        <input
          value={text.target_job ?? ""}
          onChange={(e) => set("target_job", e.target.value)}
          placeholder="例：ホールスタッフ、料理長 など"
          className="rounded-xl border border-border bg-surface px-3 py-2 text-base font-normal outline-none focus:border-brand"
        />
      </label>

      <button
        onClick={handleGenerate}
        disabled={generating}
        className="rounded-full border border-brand bg-brand-soft px-6 py-3 text-center text-sm font-bold text-brand-dark transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        {generating ? "AIが作成中…" : "AIで文章を作成する"}
      </button>
      {error && <p className="text-sm text-red-600">{error}</p>}

      <TextArea label="職務要約" value={text.work_summary} onChange={(v) => set("work_summary", v)} />
      <TextArea label="自己PR" value={text.self_pr} onChange={(v) => set("self_pr", v)} />
      <TextArea
        label="強み"
        value={text.strengths_text}
        onChange={(v) => set("strengths_text", v)}
      />
      <TextArea label="志望動機" value={text.motivation} onChange={(v) => set("motivation", v)} />
      <TextArea
        label="今後のキャリアの方向性"
        value={text.career_direction}
        onChange={(v) => set("career_direction", v)}
      />

      <button
        onClick={handleSave}
        disabled={saving}
        className="rounded-full bg-brand px-6 py-3 text-center text-sm font-bold text-white shadow-sm transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        {saving ? "保存中…" : saved ? "保存しました" : "保存する"}
      </button>
    </main>
  );
}

function TextArea({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string | null;
  onChange: (v: string) => void;
}) {
  return (
    <label className="flex flex-col gap-1 text-sm font-bold text-foreground/70">
      {label}
      <textarea
        rows={5}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-xl border border-border bg-surface px-3 py-2 text-base font-normal leading-relaxed outline-none focus:border-brand"
      />
    </label>
  );
}
