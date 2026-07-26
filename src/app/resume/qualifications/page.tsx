"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Qualification = {
  id: string;
  name: string;
  issuer: string | null;
  obtained_date: string | null;
};

const COMMON_QUALIFICATIONS = [
  "調理師",
  "専門調理師",
  "製菓衛生師",
  "栄養士",
  "管理栄養士",
  "ソムリエ",
  "ワインエキスパート",
  "SAKE DIPLOMA",
  "利酒師",
  "酒匠",
  "バリスタ関連資格",
  "レストランサービス技能士",
  "食品衛生責任者",
  "防火管理者",
  "HACCP関連",
  "フードコーディネーター",
  "野菜ソムリエ",
];

const EMPTY_FORM = { name: "", issuer: "", obtained_date: "" };

export default function QualificationsPage() {
  const [items, setItems] = useState<Qualification[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  function load() {
    return fetch("/api/resume/qualifications")
      .then((r) => r.json())
      .then((d) => setItems(d.qualifications ?? []));
  }

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await fetch("/api/resume/qualifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          issuer: form.issuer || null,
          obtained_date: form.obtained_date || null,
          expiry_date: null,
          certificate_number: null,
          image_url: null,
        }),
      });
      setForm(EMPTY_FORM);
      await load();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    await fetch(`/api/resume/qualifications/${id}`, { method: "DELETE" });
    await load();
  }

  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-6 px-6 py-10">
      <div>
        <Link href="/resume" className="text-sm text-foreground/60 underline">
          ← 履歴書作成に戻る
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-brand-dark">資格</h1>
      </div>

      {!loading && items.length > 0 && (
        <ul className="flex flex-col gap-2">
          {items.map((q) => (
            <li
              key={q.id}
              className="flex items-center justify-between rounded-2xl border border-border bg-surface px-4 py-3 shadow-sm"
            >
              <p className="text-sm font-bold">{q.name}</p>
              <button
                onClick={() => handleDelete(q.id)}
                className="text-xs font-bold text-foreground/40 hover:text-red-600"
              >
                削除
              </button>
            </li>
          ))}
        </ul>
      )}

      <form
        onSubmit={handleAdd}
        className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-4 shadow-sm"
      >
        <p className="text-sm font-bold text-brand-dark">資格を追加</p>
        <label className="flex flex-col gap-1 text-sm font-bold text-foreground/70">
          資格名
          <input
            list="qualification-options"
            required
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            className="rounded-xl border border-border bg-background px-3 py-2 text-base font-normal outline-none focus:border-brand"
          />
          <datalist id="qualification-options">
            {COMMON_QUALIFICATIONS.map((q) => (
              <option key={q} value={q} />
            ))}
          </datalist>
        </label>
        <label className="flex flex-col gap-1 text-sm font-bold text-foreground/70">
          発行団体
          <input
            value={form.issuer}
            onChange={(e) => setForm((f) => ({ ...f, issuer: e.target.value }))}
            className="rounded-xl border border-border bg-background px-3 py-2 text-base font-normal outline-none focus:border-brand"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-bold text-foreground/70">
          取得年月
          <input
            type="date"
            value={form.obtained_date}
            onChange={(e) => setForm((f) => ({ ...f, obtained_date: e.target.value }))}
            className="rounded-xl border border-border bg-background px-3 py-2 text-base font-normal outline-none focus:border-brand"
          />
        </label>
        <button
          type="submit"
          disabled={saving}
          className="rounded-full bg-brand px-6 py-2.5 text-center text-sm font-bold text-white shadow-sm transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {saving ? "追加中…" : "追加する"}
        </button>
      </form>

      <Link
        href="/resume/self-pr"
        className="block w-full rounded-full border border-brand bg-brand-soft px-6 py-3 text-center text-sm font-bold text-brand-dark transition-opacity hover:opacity-90"
      >
        自己PR・職務要約を作成する →
      </Link>
    </main>
  );
}
