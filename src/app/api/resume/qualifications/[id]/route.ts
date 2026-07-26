import { NextResponse } from "next/server";
import { requireUserId } from "@/lib/api/require-user";
import { deleteQualification } from "@/lib/resume/service";
import { handleApiError } from "@/lib/api/handle-error";

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = await requireUserId();
    const { id } = await params;
    await deleteQualification(userId, id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return handleApiError(err);
  }
}
