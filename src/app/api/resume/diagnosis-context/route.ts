import { NextResponse } from "next/server";
import { requireUserId } from "@/lib/api/require-user";
import { getDiagnosisContext } from "@/lib/resume/service";
import { handleApiError } from "@/lib/api/handle-error";

// GET /api/resume/diagnosis-context - null if no diagnosis session is linked yet. Powers
// the self-PR page's "診断結果の特性を反映する" card.
export async function GET() {
  try {
    const userId = await requireUserId();
    const context = await getDiagnosisContext(userId);
    return NextResponse.json({ context });
  } catch (err) {
    return handleApiError(err);
  }
}
