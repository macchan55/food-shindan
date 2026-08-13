import "server-only";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { recordIntentEvent } from "@/lib/intentScore";

/**
 * Scores the anonymous→registered upgrade (⑤) exactly once per user. Called from
 * /api/account/register-complete right after the client's auth.updateUser()/signUp()
 * succeeds — idempotent so a retried call (e.g. flaky network) never double-counts.
 */
export async function markRegistered(userId: string): Promise<void> {
  const { data, error } = await supabaseAdmin()
    .from("intent_score_events")
    .select("id")
    .eq("user_id", userId)
    .eq("event_type", "registered")
    .maybeSingle();
  if (error) {
    console.error(`Failed to check registered event for ${userId}: ${error.message}`);
    return;
  }
  if (data) return;
  await recordIntentEvent(userId, "registered");
}
