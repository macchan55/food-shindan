"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Profile = {
  full_name: string | null;
  full_name_kana: string | null;
  birthdate: string | null;
  gender: string | null;
  postal_code: string | null;
  address: string | null;
  phone: string | null;
  photo_url: string | null;
};

const EMPTY: Profile = {
  full_name: "",
  full_name_kana: "",
  birthdate: "",
  gender: "",
  postal_code: "",
  address: "",
  phone: "",
  photo_url: null,
};

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetch("/api/resume/profile")
      .then((r) => r.json())
      .then((d) => {
        if (d.profile) setProfile({ ...EMPTY, ...d.profile });
      })
      .finally(() => setLoading(false));
  }, []);

  function set<K extends keyof Profile>(key: K, value: Profile[K]) {
    setProfile((p) => ({ ...p, [key]: value }));
    setSaved(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await fetch("/api/resume/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });
      setSaved(true);
    } finally {
      setSaving(false);
    }
  }

  async function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const form = new FormData();
      form.append("photo", file);
      const res = await fetch("/api/resume/photo", { method: "POST", body: form });
      const d = await res.json();
      if (d.profile) setProfile((p) => ({ ...p, photo_url: d.profile.photo_url }));
    } finally {
      setUploading(false);
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
        <h1 className="mt-2 text-2xl font-bold text-brand-dark">基本情報</h1>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <div className="h-24 w-20 shrink-0 overflow-hidden rounded-lg border border-border bg-surface">
            {profile.photo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={profile.photo_url} alt="証明写真" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center text-xs text-foreground/40">
                写真
              </div>
            )}
          </div>
          <label className="text-sm font-bold text-brand-dark underline">
            {uploading ? "アップロード中…" : "写真をアップロード"}
            <input type="file" accept="image/*" onChange={handlePhoto} className="hidden" />
          </label>
        </div>

        <Field label="氏名" value={profile.full_name} onChange={(v) => set("full_name", v)} required />
        <Field
          label="ふりがな"
          value={profile.full_name_kana}
          onChange={(v) => set("full_name_kana", v)}
        />
        <Field
          label="生年月日"
          type="date"
          value={profile.birthdate}
          onChange={(v) => set("birthdate", v)}
        />
        <Field label="性別（任意）" value={profile.gender} onChange={(v) => set("gender", v)} />
        <Field
          label="郵便番号"
          value={profile.postal_code}
          onChange={(v) => set("postal_code", v)}
        />
        <Field label="住所" value={profile.address} onChange={(v) => set("address", v)} required />
        <Field label="電話番号" value={profile.phone} onChange={(v) => set("phone", v)} required />

        <button
          type="submit"
          disabled={saving}
          className="mt-2 rounded-full bg-brand px-6 py-3 text-center text-sm font-bold text-white shadow-sm transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {saving ? "保存中…" : saved ? "保存しました" : "保存する"}
        </button>
      </form>

      <Link
        href="/resume/education"
        className="block w-full rounded-full border border-brand bg-brand-soft px-6 py-3 text-center text-sm font-bold text-brand-dark transition-opacity hover:opacity-90"
      >
        学歴を入力する →
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
  value: string | null;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="flex flex-col gap-1 text-sm font-bold text-foreground/70">
      {label}
      <input
        type={type}
        required={required}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-xl border border-border bg-surface px-3 py-2 text-base font-normal outline-none focus:border-brand"
      />
    </label>
  );
}
