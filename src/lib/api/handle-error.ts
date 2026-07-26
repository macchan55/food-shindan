import { NextResponse } from "next/server";

// Any domain error with a `status` (DiagnosisError, ResumeError, ...) is reported as-is;
// anything else is logged and reported as a generic 500 so internals never leak to clients.
type StatusError = Error & { status: number };

function isStatusError(err: unknown): err is StatusError {
  return err instanceof Error && typeof (err as { status?: unknown }).status === "number";
}

export function handleApiError(err: unknown) {
  if (isStatusError(err)) {
    return NextResponse.json({ error: err.message }, { status: err.status });
  }
  console.error(err);
  return NextResponse.json({ error: "Internal server error" }, { status: 500 });
}
