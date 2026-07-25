import { NextResponse } from "next/server";
import { saveFeedback } from "@/lib/diagnosis/service";
import { handleApiError } from "@/lib/api/handle-error";

const VALID_RATINGS = [
  "very_accurate",
  "somewhat_accurate",
  "neutral",
  "somewhat_inaccurate",
  "very_inaccurate",
];

// POST /api/diagnosis/sessions/:id/feedback  { rating, comment? }
// docs/spec/03-mvp-overview.md section 31: "今回の診断は自分に当たっていましたか？"
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { rating, comment } = body ?? {};
    if (typeof rating !== "string" || !VALID_RATINGS.includes(rating)) {
      return NextResponse.json(
        { error: `rating must be one of: ${VALID_RATINGS.join(", ")}` },
        { status: 400 }
      );
    }
    await saveFeedback(id, rating, typeof comment === "string" ? comment : null);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return handleApiError(err);
  }
}
