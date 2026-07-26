import { NextResponse } from "next/server";
import { requireUserId } from "@/lib/api/require-user";
import { deleteWorkExperience } from "@/lib/resume/service";
import { handleApiError } from "@/lib/api/handle-error";

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = await requireUserId();
    const { id } = await params;
    await deleteWorkExperience(userId, id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return handleApiError(err);
  }
}
