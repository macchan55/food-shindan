"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { YearMonthField } from "@/components/YearMonthField";
import { TextField, SelectField, TextAreaField } from "@/components/FormFields";
import { WORK_BUSINESS_FORMATS, tagsForBusinessFormat } from "@/lib/resume/workTags";

type WorkExperience = {
  id: string;
  company_name: string;
  store_name: string | null;
  start_date: string | null;
  end_date: string | null;
  is_current: boolean;
  employment_type: string | null;
  business_format: string | null;
  cuisine_genre: string | null;
  job_type: string | null;
  position: string | null;
  store_size: string | null;
  seat_count: string | null;
  avg_spend: string | null;
  managed_headcount: string | null;
  main_duties: string | null;
  achievements: string | null;
  station_tags: string[];
  skill_tags: string[];
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
  business_format: "",
  cuisine_genre: "",
  job_type: "",
  position: "",
  store_size: "",
  seat_count: "",
  avg_spend: "",
  managed_headcount: "",
  main_duties: "",
  achievements: "",
  station_tags: [] as string[],
  skill_tags: [] as string[],
};

export default function WorkExperiencePage() {
  const router = useRouter();
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

  function postCurrentForm() {
    return fetch("/api/resume/work-experiences", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        store_name: form.store_name || null,
        start_date: form.start_date || null,
        end_date: form.is_current ? null : form.end_date || null,
        employment_type: form.employment_type || null,
        business_format: form.business_format || null,
        cuisine_genre: form.cuisine_genre || null,
        job_type: form.job_type || null,
        position: form.position || null,
        store_size: form.store_size || null,
        seat_count: form.seat_count || null,
        avg_spend: form.avg_spend || null,
        managed_headcount: form.managed_headcount || null,
        main_duties: form.main_duties || null,
        achievements: form.achievements || null,
        station_tags: form.station_tags,
        skill_tags: form.skill_tags,
        reason_for_leaving: null,
        reason_visibility: "private",
      }),
    });
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await postCurrentForm();
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

  // "資格を入力する" used to be a plain Link: filling in the add-職歴 form without pressing
  // 追加する first meant that entry was silently discarded on navigation (same bug as the
  // profile page). If there's an unsaved entry (会社名 filled in, the one required field),
  // add it before moving on.
  async function handleNext() {
    if (form.company_name.trim()) {
      setSaving(true);
      try {
        await postCurrentForm();
      } finally {
        setSaving(false);
      }
    }
    router.push("/resume/qualifications");
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
        <TextField
          label="会社名"
          value={form.company_name}
          onChange={(v) => setForm((f) => ({ ...f, company_name: v }))}
          required
        />
        <TextField
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
          <SelectField
            label="雇用形態"
            value={form.employment_type}
            options={EMPLOYMENT_TYPES}
            onChange={(v) => setForm((f) => ({ ...f, employment_type: v }))}
          />
          <SelectField
            label="職種"
            value={form.job_type}
            options={JOB_TYPES}
            onChange={(v) => setForm((f) => ({ ...f, job_type: v }))}
          />
        </div>
        <TextField
          label="役職"
          value={form.position}
          onChange={(v) => setForm((f) => ({ ...f, position: v }))}
        />
        <SelectField
          label="業態"
          value={form.business_format}
          options={[...WORK_BUSINESS_FORMATS]}
          onChange={(v) => setForm((f) => ({ ...f, business_format: v, station_tags: [], skill_tags: [] }))}
        />
        <TextField
          label="料理ジャンル"
          value={form.cuisine_genre}
          onChange={(v) => setForm((f) => ({ ...f, cuisine_genre: v }))}
        />
        <WorkTagPicker
          businessFormat={form.business_format || null}
          stationTags={form.station_tags}
          skillTags={form.skill_tags}
          onChangeStations={(tags) => setForm((f) => ({ ...f, station_tags: tags }))}
          onChangeSkills={(tags) => setForm((f) => ({ ...f, skill_tags: tags }))}
        />
        <div className="flex gap-3">
          <TextField
            label="店舗規模"
            value={form.store_size}
            onChange={(v) => setForm((f) => ({ ...f, store_size: v }))}
          />
          <SelectField
            label="席数"
            value={form.seat_count}
            options={SEAT_COUNT_OPTIONS}
            onChange={(v) => setForm((f) => ({ ...f, seat_count: v }))}
          />
        </div>
        <div className="flex gap-3">
          <SelectField
            label="顧客単価"
            value={form.avg_spend}
            options={AVG_SPEND_OPTIONS}
            onChange={(v) => setForm((f) => ({ ...f, avg_spend: v }))}
          />
          <SelectField
            label="管理人数"
            value={form.managed_headcount}
            options={MANAGED_HEADCOUNT_OPTIONS}
            onChange={(v) => setForm((f) => ({ ...f, managed_headcount: v }))}
          />
        </div>
        <TextAreaField
          label={
            tagsForBusinessFormat(form.business_format || null)
              ? "主な業務（補足・任意）"
              : "主な業務"
          }
          value={form.main_duties}
          onChange={(v) => setForm((f) => ({ ...f, main_duties: v }))}
        />
        <TextAreaField
          label={
            tagsForBusinessFormat(form.business_format || null) ? "実績（補足・任意）" : "実績"
          }
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

      <button
        type="button"
        onClick={handleNext}
        disabled={saving}
        className="block w-full rounded-full border border-brand bg-brand-soft px-6 py-3 text-center text-sm font-bold text-brand-dark transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        {saving ? "保存中…" : "資格を入力する →"}
      </button>
    </main>
  );
}

// ⑥⑦ persona×skill tag picker: business_format decides the tag catalog (see
// src/lib/resume/workTags.ts). Renders nothing for formats without a curated tag set
// ('その他' etc.), leaving main_duties/achievements as the only entry method there.
function WorkTagPicker({
  businessFormat,
  stationTags,
  skillTags,
  onChangeStations,
  onChangeSkills,
}: {
  businessFormat: string | null;
  stationTags: string[];
  skillTags: string[];
  onChangeStations: (tags: string[]) => void;
  onChangeSkills: (tags: string[]) => void;
}) {
  const tagSet = tagsForBusinessFormat(businessFormat);
  if (!tagSet) return null;

  function toggle(list: string[], value: string, onChange: (tags: string[]) => void) {
    onChange(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);
  }

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-background p-3">
      <div>
        <p className="mb-1.5 text-xs font-bold text-foreground/70">持ち場（複数選択可）</p>
        <div className="flex flex-wrap gap-1.5">
          {tagSet.stations.map((tag) => (
            <TagChip
              key={tag}
              label={tag}
              selected={stationTags.includes(tag)}
              onClick={() => toggle(stationTags, tag, onChangeStations)}
            />
          ))}
        </div>
      </div>
      <div>
        <p className="mb-1.5 text-xs font-bold text-foreground/70">技術タグ（複数選択可）</p>
        <div className="flex flex-wrap gap-1.5">
          {tagSet.skills.map((tag) => (
            <TagChip
              key={tag}
              label={tag}
              selected={skillTags.includes(tag)}
              onClick={() => toggle(skillTags, tag, onChangeSkills)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function TagChip({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3 py-1 text-xs font-bold transition-colors ${
        selected
          ? "border-brand bg-brand-soft text-brand-dark"
          : "border-border text-foreground/60 hover:border-brand/60"
      }`}
    >
      {label}
    </button>
  );
}
