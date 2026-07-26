import Link from "next/link";
import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/supabase/server";

// Depends on the caller's cookies (auth session), so it can never be statically prerendered.
export const dynamic = "force-dynamic";
import {
  getProfile,
  listEducation,
  listQualifications,
  listWorkExperiences,
  getOrCreateResume,
} from "@/lib/resume/service";

const STEPS = [
  { href: "/resume/profile", label: "基本情報", key: "profile" as const },
  { href: "/resume/education", label: "学歴", key: "education" as const },
  { href: "/resume/work", label: "職歴", key: "work" as const },
  { href: "/resume/qualifications", label: "資格", key: "qualifications" as const },
  { href: "/resume/self-pr", label: "自己PR・職務要約（AI作成）", key: "selfPr" as const },
];

export default async function ResumeDashboardPage() {
  const user = await getAuthUser();
  if (!user) redirect("/login");

  const [profile, education, workExperiences, qualifications, resume] = await Promise.all([
    getProfile(user.id),
    listEducation(user.id),
    listWorkExperiences(user.id),
    listQualifications(user.id),
    getOrCreateResume(user.id),
  ]);

  const done: Record<(typeof STEPS)[number]["key"], boolean> = {
    profile: Boolean(profile?.full_name && profile?.address),
    education: education.length > 0,
    work: workExperiences.length > 0,
    qualifications: qualifications.length > 0,
    selfPr: Boolean(resume.self_pr),
  };

  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-6 px-6 py-10">
      <div>
        <h1 className="text-2xl font-bold text-brand-dark">履歴書を作成</h1>
        <p className="mt-1 text-sm text-foreground/60">
          各項目を入力すると、履歴書と職務経歴書がいつでもプレビュー・PDF出力できます。
        </p>
      </div>

      <ul className="flex flex-col gap-3">
        {STEPS.map((step) => (
          <li key={step.key}>
            <Link
              href={step.href}
              className="flex items-center justify-between rounded-2xl border border-border bg-surface px-4 py-3 shadow-sm transition-colors hover:border-brand/60"
            >
              <span className="font-medium">{step.label}</span>
              <span
                className={`text-xs font-bold ${
                  done[step.key] ? "text-brand-dark" : "text-foreground/40"
                }`}
              >
                {done[step.key] ? "入力済み" : "未入力"}
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <Link
        href="/resume/preview"
        className="block w-full rounded-full bg-brand px-6 py-3 text-center text-sm font-bold text-white shadow-sm transition-opacity hover:opacity-90"
      >
        履歴書・職務経歴書をプレビュー
      </Link>
    </main>
  );
}
