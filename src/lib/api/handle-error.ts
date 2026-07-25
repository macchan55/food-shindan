import { NextResponse } from "next/server";
import { DiagnosisError } from "@/lib/diagnosis/service";

export function handleApiError(err: unknown) {
  if (err instanceof DiagnosisError) {
    return NextResponse.json({ error: err.message }, { status: err.status });
  }
  console.error(err);
  return NextResponse.json({ error: "Internal server error" }, { status: 500 });
}
