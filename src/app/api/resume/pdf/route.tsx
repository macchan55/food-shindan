import { getAuthUser } from "@/lib/supabase/server";
import {
  getOrCreateResume,
  getProfile,
  listEducation,
  listQualifications,
  listWorkExperiences,
} from "@/lib/resume/service";
import { handleApiError } from "@/lib/api/handle-error";
import { registerJapaneseFont } from "@/lib/resume/pdf/font";
import { RirekishoDocument } from "@/lib/resume/pdf/RirekishoDocument";
import { ShokumuKeirekishoDocument } from "@/lib/resume/pdf/ShokumuKeirekishoDocument";
import type { ResumePdfData } from "@/lib/resume/pdf/types";
import { renderToBuffer } from "@react-pdf/renderer";
import { NextResponse } from "next/server";

// JSX construction is kept out of the route handler's try/catch on purpose: react-pdf
// never mounts this tree through React's normal render/commit cycle (renderToBuffer walks
// it independently to produce PDF bytes), so wrapping it here is just satisfying the
// (otherwise-correct) react-hooks/error-boundaries lint rule, which assumes a DOM render.
function renderResumeDocument(type: "rirekisho" | "shokumu", data: ResumePdfData) {
  return type === "rirekisho" ? <RirekishoDocument data={data} /> : <ShokumuKeirekishoDocument data={data} />;
}

// GET /api/resume/pdf?type=rirekisho|shokumu
export async function GET(req: Request) {
  try {
    const user = await getAuthUser();
    if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

    const type = new URL(req.url).searchParams.get("type");
    if (type !== "rirekisho" && type !== "shokumu") {
      return NextResponse.json({ error: 'type must be "rirekisho" or "shokumu"' }, { status: 400 });
    }

    const [profile, education, workExperiences, qualifications, resume] = await Promise.all([
      getProfile(user.id),
      listEducation(user.id),
      listWorkExperiences(user.id),
      listQualifications(user.id),
      getOrCreateResume(user.id),
    ]);

    const data: ResumePdfData = {
      email: user.email ?? "",
      profile: {
        fullName: profile?.full_name ?? "",
        fullNameKana: profile?.full_name_kana ?? "",
        birthdate: profile?.birthdate ?? null,
        gender: profile?.gender ?? null,
        address: profile?.address ?? "",
        phone: profile?.phone ?? "",
        photoUrl: profile?.photo_url ?? null,
      },
      education: education.map((e) => ({
        schoolType: e.school_type,
        schoolName: e.school_name,
        department: e.department,
        graduationDate: e.graduation_date,
        status: e.status,
      })),
      workExperiences: workExperiences.map((w) => ({
        companyName: w.company_name,
        brandName: w.brand_name,
        storeName: w.store_name,
        startDate: w.start_date,
        endDate: w.end_date,
        isCurrent: w.is_current,
        employmentType: w.employment_type,
        jobType: w.job_type,
        position: w.position,
        mainDuties: w.main_duties,
        achievements: w.achievements,
      })),
      qualifications: qualifications.map((q) => ({
        name: q.name,
        issuer: q.issuer,
        obtainedDate: q.obtained_date,
      })),
      resume: {
        workSummary: resume.work_summary,
        selfPr: resume.self_pr,
        strengthsText: resume.strengths_text,
        motivation: resume.motivation,
        careerDirection: resume.career_direction,
      },
    };

    registerJapaneseFont();
    const buffer = await renderToBuffer(renderResumeDocument(type, data));

    const download = new URL(req.url).searchParams.get("download") === "1";
    const filename = type === "rirekisho" ? "rirekisho.pdf" : "shokumu-keirekisho.pdf";
    return new Response(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `${download ? "attachment" : "inline"}; filename="${filename}"`,
      },
    });
  } catch (err) {
    return handleApiError(err);
  }
}
