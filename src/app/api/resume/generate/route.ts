import { NextResponse } from "next/server";
import { requireUserId } from "@/lib/api/require-user";
import { getDiagnosisContext, listWorkExperiences } from "@/lib/resume/service";
import { generateResumeDraft } from "@/lib/resume/generate";
import { handleApiError } from "@/lib/api/handle-error";

// POST /api/resume/generate { targetJob? } - returns an AI-drafted set of resume text
// fields. Not saved automatically: the client shows it for review/editing, then PUTs
// /api/resume to save (or discards and re-generates).
export async function POST(req: Request) {
  try {
    const userId = await requireUserId();
    const body = await req.json().catch(() => ({}));
    const targetJob = typeof body?.targetJob === "string" ? body.targetJob : null;
    const userNotes = typeof body?.userNotes === "string" && body.userNotes.trim() ? body.userNotes : null;

    const [diagnosis, workExperiences] = await Promise.all([
      getDiagnosisContext(userId),
      listWorkExperiences(userId),
    ]);

    const draft = await generateResumeDraft({
      targetJob,
      userNotes,
      diagnosis,
      workExperiences: workExperiences.map((w) => ({
        companyName: w.company_name,
        jobType: w.job_type,
        position: w.position,
        mainDuties: w.main_duties,
        achievements: w.achievements,
      })),
    });

    return NextResponse.json({ draft });
  } catch (err) {
    return handleApiError(err);
  }
}
