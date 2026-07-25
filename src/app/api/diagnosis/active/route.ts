import { NextResponse } from "next/server";
import { getActiveQuestionSet } from "@/lib/diagnosis/repository";
import { handleApiError } from "@/lib/api/handle-error";

// GET /api/diagnosis/active - active diagnosis version + full question set.
export async function GET() {
  try {
    const { versionId, questions } = await getActiveQuestionSet();
    return NextResponse.json({ versionId, questionCount: questions.length, questions });
  } catch (err) {
    return handleApiError(err);
  }
}
