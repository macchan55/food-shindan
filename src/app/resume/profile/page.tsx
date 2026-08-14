"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { TextField } from "@/components/FormFields";

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

const GENDER_OPTIONS = ["男性", "女性", "その他"] as const;

function yearsAgoISODate(years: number): string {
  const d = new Date();
  d.setFullYear(d.getFullYear() - years);
  return d.toISOString().slice(0, 10);
}

const EMPTY: Profile = {
  full_name: "",
  full_name_kana: "",
  birthdate: yearsAgoISODate(23),
  gender: "その他",
  postal_code: "",
  address: "",
  phone: "",
  photo_url: null,
};

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [postalLookupError, setPostalLookupError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/resume/profile")
      .then((r) => r.json())
      .then((d) => {
        if (d.profile) {
          setProfile({
            ...EMPTY,
            ...d.profile,
            gender: d.profile.gender || "その他",
            birthdate: d.profile.birthdate || EMPTY.birthdate,
          });
        }
      })
      .finally(() => setLoading(false));
  }, []);

  // Postal code -> address autofill. Japan zip codes only resolve down to prefecture/city/
  // town (not the exact 番地/building), so the user still fills in the street number and
  // building name themselves in the address field below.
  useEffect(() => {
    const digits = (profile.postal_code ?? "").replace(/[^0-9]/g, "");
    if (digits.length !== 7) return;
    let cancelled = false;
    fetch(`https://zipcloud.ibsnet.co.jp/api/search?zipcode=${digits}`)
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        const result = data?.results?.[0];
        if (result) {
          setProfile((p) => ({
            ...p,
            address: `${result.address1}${result.address2}${result.address3}`,
          }));
          setPostalLookupError(null);
        } else {
          setPostalLookupError("該当する住所が見つかりませんでした。番地までご自身で入力してください。");
        }
      })
      .catch(() => {
        if (!cancelled) setPostalLookupError("住所の自動取得に失敗しました。手入力してください。");
      });
    return () => {
      cancelled = true;
    };
  }, [profile.postal_code]);

  function set<K extends keyof Profile>(key: K, value: Profile[K]) {
    setProfile((p) => ({ ...p, [key]: value }));
    setSaved(false);
  }

  function saveProfile() {
    return fetch("/api/resume/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profile),
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await saveProfile();
      setSaved(true);
    } finally {
      setSaving(false);
    }
  }

  // "学歴を入力する" used to be a plain Link, which meant leaving the page without hitting
  // 保存する first silently dropped everything typed here — nothing was ever written until
  // the explicit save. Save on the way out too, same as the submit button.
  async function handleNext() {
    setSaving(true);
    try {
      await saveProfile();
    } finally {
      setSaving(false);
    }
    router.push("/resume/education");
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

        <TextField
          label="氏名"
          value={profile.full_name}
          onChange={(v) => set("full_name", v)}
          required
          inputClassName="bg-surface"
        />
        <TextField
          label="ふりがな"
          value={profile.full_name_kana}
          onChange={(v) => set("full_name_kana", v)}
          inputClassName="bg-surface"
        />
        <TextField
          label="生年月日"
          type="date"
          value={profile.birthdate}
          onChange={(v) => set("birthdate", v)}
          inputClassName="bg-surface"
        />

        <label className="flex flex-col gap-1 text-sm font-bold text-foreground/70">
          性別
          <div className="flex flex-wrap gap-4 pt-1">
            {GENDER_OPTIONS.map((opt) => (
              <label key={opt} className="flex items-center gap-1.5 font-normal text-foreground">
                <input
                  type="radio"
                  name="gender"
                  checked={profile.gender === opt}
                  onChange={() => set("gender", opt)}
                />
                {opt}
              </label>
            ))}
          </div>
        </label>

        <div className="flex flex-col gap-1">
          <TextField
            label="郵便番号（ハイフンなし）"
            value={profile.postal_code}
            onChange={(v) => {
              setPostalLookupError(null);
              set("postal_code", v.replace(/[^0-9]/g, ""));
            }}
            inputClassName="bg-surface"
          />
          <p className="text-xs text-foreground/50">
            入力すると住所が自動入力されます（番地・建物名は住所欄に追記してください）。
          </p>
          {postalLookupError && <p className="text-xs text-red-600">{postalLookupError}</p>}
        </div>
        <TextField
          label="住所"
          value={profile.address}
          onChange={(v) => set("address", v)}
          required
          inputClassName="bg-surface"
        />
        <TextField
          label="電話番号（ハイフンなしで記入）"
          value={profile.phone}
          onChange={(v) => set("phone", v.replace(/[^0-9]/g, ""))}
          required
          inputClassName="bg-surface"
        />

        <button
          type="submit"
          disabled={saving}
          className="mt-2 rounded-full bg-brand px-6 py-3 text-center text-sm font-bold text-white shadow-sm transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {saving ? "保存中…" : saved ? "保存しました" : "保存する"}
        </button>
      </form>

      <button
        type="button"
        onClick={handleNext}
        disabled={saving}
        className="block w-full rounded-full border border-brand bg-brand-soft px-6 py-3 text-center text-sm font-bold text-brand-dark transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        {saving ? "保存中…" : "学歴を入力する →"}
      </button>
    </main>
  );
}
