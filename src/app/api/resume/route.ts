import { NextResponse } from "next/server";
import { requireUserId } from "@/lib/api/require-user";
import { getOrCreateResume, updateResume } from "@/lib/resume/service";
import { handleApiError } from "@/lib/api/handle-error";

export async function GET() {
  try {
    const userId = await requireUserId();
    const resume = await getOrCreateResume(userId);
    return NextResponse.json({ resume });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function PUT(req: Request) {
  try {
    const userId = await requireUserId();
    const body = await req.json().catch(() => ({}));
    const resume = await updateResume(userId, body);
    return NextResponse.json({ resume });
  } catch (err) {
    return handleApiError(err);
  }
}
