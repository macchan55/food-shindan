import { NextResponse } from "next/server";
import { requireUserId } from "@/lib/api/require-user";
import { getProfile, upsertProfile } from "@/lib/resume/service";
import { handleApiError } from "@/lib/api/handle-error";

export async function GET() {
  try {
    const userId = await requireUserId();
    const profile = await getProfile(userId);
    return NextResponse.json({ profile });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function PUT(req: Request) {
  try {
    const userId = await requireUserId();
    const body = await req.json().catch(() => ({}));
    const profile = await upsertProfile(userId, body);
    return NextResponse.json({ profile });
  } catch (err) {
    return handleApiError(err);
  }
}
