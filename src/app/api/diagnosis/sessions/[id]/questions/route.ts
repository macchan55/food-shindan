import { NextResponse } from "next/server";
import { getSessionOrThrow } from "@/lib/diagnosis/service";
import { getActiveQuestionSet } from "@/lib/diagnosis/repository";
import { handleApiError } from "@/lib/api/handle-error";

// GET /api/diagnosis/sessions/:id/questions
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await getSessionOrThrow(id);
    const { questions } = await getActiveQuestionSet();
    return NextResponse.json({ questions });
  } catch (err) {
    return handleApiError(err);
  }
}
