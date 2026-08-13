import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/supabase/server";
import { listPostingsForUser, listTeaserPostings } from "@/lib/jobsService";
import { handleApiError } from "@/lib/api/handle-error";

// GET /api/jobs - anonymous/no-session visitors get the Michelin teaser (④), registered
// users get the full gated list (store names masked per-posting until unlocked).
export async function GET() {
  try {
    const user = await getAuthUser();
    if (!user || user.is_anonymous) {
      return NextResponse.json({ postings: await listTeaserPostings(), gated: true });
    }
    return NextResponse.json({ postings: await listPostingsForUser(user.id), gated: false });
  } catch (err) {
    return handleApiError(err);
  }
}
