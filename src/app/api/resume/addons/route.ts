import { NextResponse } from "next/server";
import { requireUserId } from "@/lib/api/require-user";
import { listAddonRequests, requestAddon } from "@/lib/addonService";
import { handleApiError } from "@/lib/api/handle-error";
import type { AddonType } from "@/lib/supabase/rows";

const VALID_TYPES: AddonType[] = ["resume_review", "interview_prep", "translation"];

export async function GET() {
  try {
    const userId = await requireUserId();
    const requests = await listAddonRequests(userId);
    return NextResponse.json({ requests });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(req: Request) {
  try {
    const userId = await requireUserId();
    const body = await req.json().catch(() => ({}));
    if (!VALID_TYPES.includes(body?.addonType)) {
      return NextResponse.json(
        { error: `addonType must be one of: ${VALID_TYPES.join(", ")}` },
        { status: 400 }
      );
    }
    const note = typeof body.note === "string" && body.note.trim() ? body.note.trim() : null;
    const request = await requestAddon(userId, body.addonType, note);
    return NextResponse.json({ request }, { status: 201 });
  } catch (err) {
    return handleApiError(err);
  }
}
