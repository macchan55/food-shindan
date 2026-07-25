import { NextResponse } from "next/server";
import { getResult } from "@/lib/diagnosis/service";
import { handleApiError } from "@/lib/api/handle-error";
import { serializeResult } from "@/lib/diagnosis/serialize";

// GET /api/diagnosis/sessions/:id/result
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const view = await getResult(id);
    return NextResponse.json(serializeResult(view));
  } catch (err) {
    return handleApiError(err);
  }
}
