import { NextResponse } from "next/server";
import { requireUserId } from "@/lib/api/require-user";
import { addQualification, listQualifications } from "@/lib/resume/service";
import { handleApiError } from "@/lib/api/handle-error";

export async function GET() {
  try {
    const userId = await requireUserId();
    const qualifications = await listQualifications(userId);
    return NextResponse.json({ qualifications });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(req: Request) {
  try {
    const userId = await requireUserId();
    const body = await req.json().catch(() => ({}));
    const entry = await addQualification(userId, body);
    return NextResponse.json({ entry }, { status: 201 });
  } catch (err) {
    return handleApiError(err);
  }
}
