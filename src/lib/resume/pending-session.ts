// Bridges the diagnosis result page's "履歴書を作る" CTA (anonymous session) to the
// account created/logged into on the next screen. Survives the Supabase email-confirmation
// round trip, which localStorage does and a query param alone would not.
const KEY = "pendingResumeSessionId";

export function setPendingResumeSession(sessionId: string) {
  window.localStorage.setItem(KEY, sessionId);
}

export async function linkPendingResumeSessionIfAny(): Promise<void> {
  const sessionId = window.localStorage.getItem(KEY);
  if (!sessionId) return;
  window.localStorage.removeItem(KEY);
  try {
    await fetch("/api/resume/link-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId }),
    });
  } catch {
    // Best-effort: the resume flow still works without a linked diagnosis session, it just
    // won't have diagnosis content to draw on for AI generation.
  }
}
