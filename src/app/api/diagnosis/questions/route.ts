import { NextResponse } from "next/server";
import { getActiveQuestionSet } from "@/lib/diagnosis/repository";
import { handleApiError } from "@/lib/api/handle-error";

// GET /api/diagnosis/questions - the active version's question bank. Unlike
// /api/diagnosis/sessions/:id/questions, this doesn't need a session to exist yet (the
// question set itself never depends on one), so the client can start fetching it the
// moment the diagnosis intro page loads instead of waiting for session creation to finish
// first. See src/lib/diagnosis/questionsCache.ts for how this gets prefetched.
export async function GET() {
  try {
    const { questions } = await getActiveQuestionSet();
    return NextResponse.json({ questions });
  } catch (err) {
    return handleApiError(err);
  }
}
