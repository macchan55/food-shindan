import { NextResponse } from "next/server";
import { requireUserId } from "@/lib/api/require-user";
import { getCareerPreferences, upsertCareerPreferences } from "@/lib/careerPreferencesService";
import { handleApiError } from "@/lib/api/handle-error";

export async function GET() {
  try {
    const userId = await requireUserId();
    const preferences = await getCareerPreferences(userId);
    return NextResponse.json({ preferences });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(req: Request) {
  try {
    const userId = await requireUserId();
    const body = await req.json().catch(() => ({}));
    const preferences = await upsertCareerPreferences(userId, {
      timing: body.timing,
      desired_income: body.desired_income || null,
      desired_area: body.desired_area || null,
      desired_format: body.desired_format || null,
      desired_role: body.desired_role || null,
      change_reasons: Array.isArray(body.change_reasons) ? body.change_reasons : [],
    });
    return NextResponse.json({ preferences });
  } catch (err) {
    return handleApiError(err);
  }
}
