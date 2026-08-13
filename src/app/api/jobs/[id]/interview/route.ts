import { NextResponse } from "next/server";
import { requireUserId } from "@/lib/api/require-user";
import { requestInterview } from "@/lib/jobsService";
import { handleApiError } from "@/lib/api/handle-error";

// POST /api/jobs/[id]/interview - 面談を希望する. Unlocks the posting's store name (④).
export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = await requireUserId();
    const { id } = await params;
    await requestInterview(userId, id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return handleApiError(err);
  }
}
