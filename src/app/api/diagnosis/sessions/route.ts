import { NextResponse } from "next/server";
import { createSession } from "@/lib/diagnosis/service";
import { handleApiError } from "@/lib/api/handle-error";

// POST /api/diagnosis/sessions - start a new anonymous diagnosis session.
export async function POST() {
  try {
    const session = await createSession();
    return NextResponse.json({ session }, { status: 201 });
  } catch (err) {
    return handleApiError(err);
  }
}
