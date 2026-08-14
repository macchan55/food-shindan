"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SelectField } from "@/components/FormFields";
import {
  TIMING_OPTIONS,
  INCOME_OPTIONS,
  AREA_OPTIONS,
  FORMAT_OPTIONS,
  ROLE_OPTIONS,
  CHANGE_REASON_OPTIONS,
} from "@/lib/careerPreferences";
import type { CareerTiming } from "@/lib/supabase/rows";

// ②③ mandatory 5-item preferences step, shown right after signup instead of a paywall
// (①). Every field is a pulldown/checkbox by design — the brief calls for ~30 seconds.
function PreferencesForm() {
  const router = useRouter();
  const next = useSearchParams().get("next") || "/resume";

  const [timing, setTiming] = useState<CareerTiming | "">("");
  const [income, setIncome] = useState("");
  const [area, setArea] = useState("");
  const [format, setFormat] = useState("");
  const [role, setRole] = useState("");
  const [reasons, setReasons] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // The register page normally calls this before routing here, but the email-confirmation
  // link lands here directly (see emailRedirectTo in /register) without ever running that
  // client-side code — mark it here too. Idempotent server-side, so calling it twice is safe.
  useEffect(() => {
    fetch("/api/account/register-complete", { method: "POST" }).catch(() => {});
  }, []);

  function toggleReason(reason: string) {
    setReasons((prev) =>
      prev.includes(reason) ? prev.filter((r) => r !== reason) : [...prev, reason]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!timing) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/career-preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          timing,
          desired_income: income,
          desired_area: area,
          desired_format: format,
          desired_role: role,
          change_reasons: reasons,
        }),
      });
      if (!res.ok) throw new Error("保存に失敗しました");
      router.push(next);
    } catch (e) {
      setError(e instanceof Error ? e.message : "エラーが発生しました");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-6 px-6 py-16">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-brand-dark">希望条件を教えてください</h1>
        <p className="mt-1 text-sm text-foreground/60">
          プルダウンを選ぶだけ、30秒ほどで終わります。あなたに合う求人・情報のご案内に使います。
        </p>
        <p className="mt-3 rounded-2xl bg-brand-soft/60 px-4 py-2.5 text-xs leading-relaxed text-brand-dark">
          登録・入力しただけで企業への推薦・応募が行われることはありません。営業電話もありません。
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <SelectField
          label="転職時期"
          value={timing}
          options={TIMING_OPTIONS}
          onChange={(v) => setTiming(v as CareerTiming)}
          required
          inputClassName="bg-surface"
        />
        <SelectField
          label="希望年収"
          value={income}
          options={INCOME_OPTIONS}
          onChange={setIncome}
          inputClassName="bg-surface"
        />
        <SelectField
          label="希望エリア"
          value={area}
          options={AREA_OPTIONS}
          onChange={setArea}
          inputClassName="bg-surface"
        />
        <SelectField
          label="希望業態"
          value={format}
          options={FORMAT_OPTIONS}
          onChange={setFormat}
          inputClassName="bg-surface"
        />
        <SelectField
          label="希望職種・役職"
          value={role}
          options={ROLE_OPTIONS}
          onChange={setRole}
          inputClassName="bg-surface"
        />

        <div>
          <p className="mb-2 text-sm font-bold text-foreground/70">変えたいこと（複数選択可）</p>
          <div className="flex flex-wrap gap-2">
            {CHANGE_REASON_OPTIONS.map((reason) => {
              const selected = reasons.includes(reason);
              return (
                <button
                  key={reason}
                  type="button"
                  onClick={() => toggleReason(reason)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-bold transition-colors ${
                    selected
                      ? "border-brand bg-brand-soft text-brand-dark"
                      : "border-border text-foreground/60 hover:border-brand/60"
                  }`}
                >
                  {reason}
                </button>
              );
            })}
          </div>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={submitting || !timing}
          className="rounded-full bg-brand px-6 py-3 text-center font-bold text-white shadow-sm transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {submitting ? "保存中…" : "この内容で進む"}
        </button>
      </form>
    </main>
  );
}

export default function PreferencesPage() {
  return (
    <Suspense>
      <PreferencesForm />
    </Suspense>
  );
}
