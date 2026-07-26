import { NextResponse } from "next/server";
import { requireUserId } from "@/lib/api/require-user";
import { linkDiagnosisSession } from "@/lib/resume/service";
import { handleApiError } from "@/lib/api/handle-error";

// POST /api/resume/link-session { sessionId } - called right after sign up/login from the
// result page's "履歴書を作る" CTA, so AI generation can pull the diagnosis content in.
export async function POST(req: Request) {
  try {
    const userId = await requireUserId();
    const body = await req.json().catch(() => null);
    if (!body?.sessionId || typeof body.sessionId !== "string") {
      return NextResponse.json({ error: "sessionId is required" }, { status: 400 });
    }
    await linkDiagnosisSession(userId, body.sessionId);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return handleApiError(err);
  }
}
