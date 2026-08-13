import { NextResponse } from "next/server";
import { requireUserId } from "@/lib/api/require-user";
import { markRegistered } from "@/lib/account";
import { handleApiError } from "@/lib/api/handle-error";

// POST /api/account/register-complete - called right after auth.updateUser()/signUp()
// resolves to a non-anonymous session, to score the registration event (⑤).
export async function POST() {
  try {
    const userId = await requireUserId();
    await markRegistered(userId);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return handleApiError(err);
  }
}
