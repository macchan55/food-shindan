"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { YearMonthField } from "@/components/YearMonthField";

type WorkExperience = {
  id: string;
  company_name: string;
  store_name: string | null;
  start_date: string | null;
  end_date: string | null;
  is_current: boolean;
  employment_type: string | null;
  cuisine_genre: string | null;
  job_type: string | null;
  position: string | null;
  store_size: string | null;
  seat_count: string | null;
  avg_spend: string | null;
  managed_headcount: string | null;
  main_duties: string | null;
  achievements: string | null;
};

const EMPLOYMENT_TYPES = ["正社員", "派遣社員", "パート", "アルバイト", "業務委託", "その他"];

const JOB_TYPES = [
  "調理",
  "キッチン補助",
  "ホールスタッフ",
  "店長・店舗マネジメント",
  "エリアマネージャー・SV",
  "商品開発",
  "仕入れ・バイヤー",
  "本部・管理部門",
  "その他",
];

const SEAT_COUNT_OPTIONS = ["1席〜10席", "11席〜20席", "21席〜40席", "41席〜80席", "81席以上"];

const MANAGED_HEADCOUNT_OPTIONS = ["0人", "1人〜3人", "4人〜9人", "10人〜20人", "21人以上"];

const AVG_SPEND_OPTIONS = [
  "〜3000円",
  "3001円〜5000円",
  "5001円〜8000円",
  "8001円〜12000円",
  "12001円〜18000円",
  "18001円〜25000円",
  "25001円以上",
];

const CURRENT_YEAR = new Date().getFullYear();

const EMPTY_FORM = {
  company_name: "",
  store_name: "",
  start_date: "",
  end_date: "",
  is_current: false,
  employment_type: "",
  cuisine_genre: "",
  job_type: "",
  position: "",
  store_size: "",
  seat_count: "",
  avg_spend: "",
  managed_headcount: "",
  main_duties: "",
  achievements: "",
};

export default function WorkExperiencePage() {
  const [items, setItems] = useState<WorkExperience[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  // Bumped on every successful add so the YearMonthFields below remount (resetting their
  // internal year/month selection state) instead of trying to sync from a changing value.
  const [formKey, setFormKey] = useState(0);

  function load() {
    return fetch("/api/resume/work-experiences")
      .then((r) => r.json())
      .then((d) => setItems(d.workExperiences ?? []));
  }

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await fetch("/api/resume/work-experiences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          store_name: form.store_name || null,
          start_date: form.start_date || null,
          end_date: form.is_current ? null : form.end_date || null,
          employment_type: form.employment_type || null,
          cuisine_genre: form.cuisine_genre || null,
          job_type: form.job_type || null,
          position: form.position || null,
          store_size: form.store_size || null,
          seat_count: form.seat_count || null,
          avg_spend: form.avg_spend || null,
          managed_headcount: form.managed_headcount || null,
          main_duties: form.main_duties || null,
          achievements: form.achievements || null,
          reason_for_leaving: null,
          reason_visibility: "private",
        }),
      });
      setForm(EMPTY_FORM);
      setFormKey((k) => k + 1);
      await load();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    await fetch(`/api/resume/work-experiences/${id}`, { method: "DELETE" });
    await load();
  }

  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-6 px-6 py-10">
      <div>
        <Link href="/resume" className="text-sm text-foreground/60 underline">
          ← 履歴書作成に戻る
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-brand-dark">職歴</h1>
      </div>

      {!loading && items.length > 0 && (
        <ul className="flex flex-col gap-2">
          {items.map((w) => (
            <li
              key={w.id}
              className="flex items-start justify-between gap-2 rounded-2xl border border-border bg-surface px-4 py-3 shadow-sm"
            >
              <div className="text-sm">
                <p className="font-bold">
                  {w.company_name} {w.store_name}
                </p>
                <p className="text-foreground/60">
                  {w.job_type} {w.position}
                </p>
              </div>
              <button
                onClick={() => handleDelete(w.id)}
                className="shrink-0 text-xs font-bold text-foreground/40 hover:text-red-600"
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
        <p className="text-sm font-bold text-brand-dark">職歴を追加</p>
        <Field
          label="会社名"
          value={form.company_name}
          onChange={(v) => setForm((f) => ({ ...f, company_name: v }))}
          required
        />
        <Field
          label="店舗名"
          value={form.store_name}
          onChange={(v) => setForm((f) => ({ ...f, store_name: v }))}
        />
        <YearMonthField
          key={`start-${formKey}`}
          label="入社年月"
          value={form.start_date}
          onChange={(v) => setForm((f) => ({ ...f, start_date: v }))}
          yearFrom={CURRENT_YEAR - 60}
          yearTo={CURRENT_YEAR + 2}
        />
        <YearMonthField
          key={`end-${formKey}`}
          label="退社年月"
          value={form.end_date}
          onChange={(v) => setForm((f) => ({ ...f, end_date: v }))}
          yearFrom={CURRENT_YEAR - 60}
          yearTo={CURRENT_YEAR + 2}
        />
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.is_current}
            onChange={(e) => setForm((f) => ({ ...f, is_current: e.target.checked }))}
          />
          現在も勤務中
        </label>
        <div className="flex gap-3">
          <Select
            label="雇用形態"
            value={form.employment_type}
            options={EMPLOYMENT_TYPES}
            onChange={(v) => setForm((f) => ({ ...f, employment_type: v }))}
          />
          <Select
            label="職種"
            value={form.job_type}
            options={JOB_TYPES}
            onChange={(v) => setForm((f) => ({ ...f, job_type: v }))}
          />
        </div>
        <Field
          label="役職"
          value={form.position}
          onChange={(v) => setForm((f) => ({ ...f, position: v }))}
        />
        <Field
          label="料理ジャンル"
          value={form.cuisine_genre}
          onChange={(v) => setForm((f) => ({ ...f, cuisine_genre: v }))}
        />
        <div className="flex gap-3">
          <Field
            label="店舗規模"
            value={form.store_size}
            onChange={(v) => setForm((f) => ({ ...f, store_size: v }))}
          />
          <Select
            label="席数"
            value={form.seat_count}
            options={SEAT_COUNT_OPTIONS}
            onChange={(v) => setForm((f) => ({ ...f, seat_count: v }))}
          />
        </div>
        <div className="flex gap-3">
          <Select
            label="顧客単価"
            value={form.avg_spend}
            options={AVG_SPEND_OPTIONS}
            onChange={(v) => setForm((f) => ({ ...f, avg_spend: v }))}
          />
          <Select
            label="管理人数"
            value={form.managed_headcount}
            options={MANAGED_HEADCOUNT_OPTIONS}
            onChange={(v) => setForm((f) => ({ ...f, managed_headcount: v }))}
          />
        </div>
        <TextArea
          label="主な業務"
          value={form.main_duties}
          onChange={(v) => setForm((f) => ({ ...f, main_duties: v }))}
        />
        <TextArea
          label="実績"
          value={form.achievements}
          onChange={(v) => setForm((f) => ({ ...f, achievements: v }))}
        />
        <button
          type="submit"
          disabled={saving}
          className="rounded-full bg-brand px-6 py-2.5 text-center text-sm font-bold text-white shadow-sm transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {saving ? "追加中…" : "追加する"}
        </button>
      </form>

      <Link
        href="/resume/qualifications"
        className="block w-full rounded-full border border-brand bg-brand-soft px-6 py-3 text-center text-sm font-bold text-brand-dark transition-opacity hover:opacity-90"
      >
        資格を入力する →
      </Link>
    </main>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  required = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="block min-w-0 flex-1 text-sm font-bold text-foreground/70">
      <span className="mb-1 block">{label}</span>
      <input
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="block w-full min-w-0 max-w-full rounded-xl border border-border bg-background px-3 py-2 text-base font-normal outline-none focus:border-brand"
      />
    </label>
  );
}

function Select({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  return (
    <label className="block min-w-0 flex-1 text-sm font-bold text-foreground/70">
      <span className="mb-1 block">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="block w-full min-w-0 max-w-full rounded-xl border border-border bg-background px-3 py-2 text-base font-normal outline-none focus:border-brand"
      >
        <option value="">選択してください</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </label>
  );
}

function TextArea({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="flex flex-col gap-1 text-sm font-bold text-foreground/70">
      {label}
      <textarea
        rows={3}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-xl border border-border bg-background px-3 py-2 text-base font-normal outline-none focus:border-brand"
      />
    </label>
  );
}
