import { NextResponse } from "next/server";
import { completeSession } from "@/lib/diagnosis/service";
import { handleApiError } from "@/lib/api/handle-error";
import { serializeResult } from "@/lib/diagnosis/serialize";

// POST /api/diagnosis/sessions/:id/complete
// Runs the rule-based scoring engine over all 64 answers and stores the result.
export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const view = await completeSession(id);
    return NextResponse.json(serializeResult(view));
  } catch (err) {
    return handleApiError(err);
  }
}
