import { NextResponse } from "next/server";
import { requireUserId } from "@/lib/api/require-user";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { upsertProfile } from "@/lib/resume/service";
import { handleApiError } from "@/lib/api/handle-error";

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

// POST /api/resume/photo (multipart form, field "photo") - uploads to the resume-photos
// Storage bucket via the service-role client and saves the public URL on the profile.
export async function POST(req: Request) {
  try {
    const userId = await requireUserId();
    const form = await req.formData();
    const file = form.get("photo");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "photo file is required" }, { status: 400 });
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: "photo must be jpeg, png, or webp" }, { status: 400 });
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: "photo must be under 5MB" }, { status: 400 });
    }

    const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
    const path = `${userId}/photo.${ext}`;
    const bytes = new Uint8Array(await file.arrayBuffer());

    const { error: uploadErr } = await supabaseAdmin()
      .storage.from("resume-photos")
      .upload(path, bytes, { contentType: file.type, upsert: true });
    if (uploadErr) {
      return NextResponse.json({ error: `Upload failed: ${uploadErr.message}` }, { status: 500 });
    }

    const {
      data: { publicUrl },
    } = supabaseAdmin().storage.from("resume-photos").getPublicUrl(path);

    const profile = await upsertProfile(userId, { photo_url: `${publicUrl}?v=${Date.now()}` });
    return NextResponse.json({ profile });
  } catch (err) {
    return handleApiError(err);
  }
}
