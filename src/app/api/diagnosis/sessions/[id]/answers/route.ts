import { NextResponse } from "next/server";
import { getAnsweredCount, saveAnswer } from "@/lib/diagnosis/service";
import { handleApiError } from "@/lib/api/handle-error";

// POST /api/diagnosis/sessions/:id/answers  { questionId, choiceId }
// Upserts one answer at a time so progress is saved as the user moves through the 20 scenes
// (docs/spec/03-mvp-overview.md section 33: "回答は途中保存される").
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { questionId, choiceId } = body ?? {};
    if (typeof questionId !== "string" || typeof choiceId !== "string") {
      return NextResponse.json(
        { error: "questionId and choiceId are required strings" },
        { status: 400 }
      );
    }
    await saveAnswer(id, questionId, choiceId);
    const answeredCount = await getAnsweredCount(id);
    return NextResponse.json({ ok: true, answeredCount });
  } catch (err) {
    return handleApiError(err);
  }
}
