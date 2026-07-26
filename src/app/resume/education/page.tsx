"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Education = {
  id: string;
  school_type: string;
  school_name: string;
  department: string | null;
  is_culinary_related: boolean;
  is_study_abroad: boolean;
  admission_date: string | null;
  graduation_date: string | null;
  status: "graduated" | "withdrew" | "enrolled";
};

const EMPTY_FORM = {
  school_type: "",
  school_name: "",
  department: "",
  is_culinary_related: false,
  is_study_abroad: false,
  admission_date: "",
  graduation_date: "",
  status: "graduated" as Education["status"],
};

export default function EducationPage() {
  const [items, setItems] = useState<Education[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  function load() {
    return fetch("/api/resume/education")
      .then((r) => r.json())
      .then((d) => setItems(d.education ?? []));
  }

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await fetch("/api/resume/education", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          department: form.department || null,
          admission_date: form.admission_date || null,
          graduation_date: form.graduation_date || null,
        }),
      });
      setForm(EMPTY_FORM);
      await load();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    await fetch(`/api/resume/education/${id}`, { method: "DELETE" });
    await load();
  }

  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-6 px-6 py-10">
      <div>
        <Link href="/resume" className="text-sm text-foreground/60 underline">
          ← 履歴書作成に戻る
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-brand-dark">学歴</h1>
      </div>

      {!loading && items.length > 0 && (
        <ul className="flex flex-col gap-2">
          {items.map((ed) => (
            <li
              key={ed.id}
              className="flex items-center justify-between rounded-2xl border border-border bg-surface px-4 py-3 shadow-sm"
            >
              <div className="text-sm">
                <p className="font-bold">
                  {ed.school_type} {ed.school_name}
                </p>
                <p className="text-foreground/60">
                  {ed.department} ・{" "}
                  {ed.status === "graduated" ? "卒業" : ed.status === "withdrew" ? "中退" : "在学中"}
                </p>
              </div>
              <button
                onClick={() => handleDelete(ed.id)}
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
        <p className="text-sm font-bold text-brand-dark">学歴を追加</p>
        <Field
          label="学校種別（高校・専門学校・大学など）"
          value={form.school_type}
          onChange={(v) => setForm((f) => ({ ...f, school_type: v }))}
          required
        />
        <Field
          label="学校名"
          value={form.school_name}
          onChange={(v) => setForm((f) => ({ ...f, school_name: v }))}
          required
        />
        <Field
          label="学部・学科・コース"
          value={form.department}
          onChange={(v) => setForm((f) => ({ ...f, department: v }))}
        />
        <div className="flex gap-3">
          <Field
            label="入学年月"
            type="date"
            value={form.admission_date}
            onChange={(v) => setForm((f) => ({ ...f, admission_date: v }))}
          />
          <Field
            label="卒業年月"
            type="date"
            value={form.graduation_date}
            onChange={(v) => setForm((f) => ({ ...f, graduation_date: v }))}
          />
        </div>
        <label className="flex flex-col gap-1 text-sm font-bold text-foreground/70">
          状況
          <select
            value={form.status}
            onChange={(e) =>
              setForm((f) => ({ ...f, status: e.target.value as Education["status"] }))
            }
            className="rounded-xl border border-border bg-background px-3 py-2 text-base font-normal outline-none focus:border-brand"
          >
            <option value="graduated">卒業</option>
            <option value="withdrew">中退</option>
            <option value="enrolled">在学中</option>
          </select>
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.is_culinary_related}
            onChange={(e) => setForm((f) => ({ ...f, is_culinary_related: e.target.checked }))}
          />
          調理・製菓・ホテル系の専門教育
        </label>
        <button
          type="submit"
          disabled={saving}
          className="rounded-full bg-brand px-6 py-2.5 text-center text-sm font-bold text-white shadow-sm transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {saving ? "追加中…" : "追加する"}
        </button>
      </form>
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
    <label className="flex flex-1 flex-col gap-1 text-sm font-bold text-foreground/70">
      {label}
      <input
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-xl border border-border bg-background px-3 py-2 text-base font-normal outline-none focus:border-brand"
      />
    </label>
  );
}
