import { NextResponse } from "next/server";
import { createSession } from "@/lib/diagnosis/service";
import { handleApiError } from "@/lib/api/handle-error";

// POST /api/diagnosis/sessions - start a new anonymous diagnosis session.
// Optional body: { gender: "male" | "female" } - picks which character-art set the result
// reveal uses; omit to fall back to the type's default single image.
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    const gender = body?.gender;
    if (gender !== undefined && gender !== "male" && gender !== "female") {
      return NextResponse.json(
        { error: 'gender must be "male" or "female" if provided' },
        { status: 400 }
      );
    }
    const session = await createSession(gender);
    return NextResponse.json({ session }, { status: 201 });
  } catch (err) {
    return handleApiError(err);
  }
}
