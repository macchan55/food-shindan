import { NextResponse } from "next/server";
import { completeSession } from "@/lib/diagnosis/service";
import { handleApiError } from "@/lib/api/handle-error";
import { serializeResult } from "@/lib/diagnosis/serialize";
import type { AnswerInput } from "@/lib/scoring";

// POST /api/diagnosis/sessions/:id/complete  { answers: { questionId, choiceId }[] }
// Writes all 64 buffered answers in one batch, then runs the rule-based scoring engine
// and stores the result.
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json().catch(() => null);
    const answers = body?.answers;
    if (
      !Array.isArray(answers) ||
      answers.some(
        (a) => typeof a?.questionId !== "string" || typeof a?.choiceId !== "string"
      )
    ) {
      return NextResponse.json(
        { error: "answers must be an array of { questionId, choiceId }" },
        { status: 400 }
      );
    }
    const view = await completeSession(id, answers as AnswerInput[]);
    return NextResponse.json(serializeResult(view));
  } catch (err) {
    return handleApiError(err);
  }
}
