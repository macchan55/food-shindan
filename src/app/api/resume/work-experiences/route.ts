import { NextResponse } from "next/server";
import { requireUserId } from "@/lib/api/require-user";
import { addWorkExperience, listWorkExperiences } from "@/lib/resume/service";
import { handleApiError } from "@/lib/api/handle-error";

export async function GET() {
  try {
    const userId = await requireUserId();
    const workExperiences = await listWorkExperiences(userId);
    return NextResponse.json({ workExperiences });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(req: Request) {
  try {
    const userId = await requireUserId();
    const body = await req.json().catch(() => ({}));
    const entry = await addWorkExperience(userId, body);
    return NextResponse.json({ entry }, { status: 201 });
  } catch (err) {
    return handleApiError(err);
  }
}
