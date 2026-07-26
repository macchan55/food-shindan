import { NextResponse } from "next/server";
import { requireUserId } from "@/lib/api/require-user";
import { addEducation, listEducation } from "@/lib/resume/service";
import { handleApiError } from "@/lib/api/handle-error";

export async function GET() {
  try {
    const userId = await requireUserId();
    const education = await listEducation(userId);
    return NextResponse.json({ education });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(req: Request) {
  try {
    const userId = await requireUserId();
    const body = await req.json().catch(() => ({}));
    const entry = await addEducation(userId, body);
    return NextResponse.json({ entry }, { status: 201 });
  } catch (err) {
    return handleApiError(err);
  }
}
