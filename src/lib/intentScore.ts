import "server-only";
import { supabaseAdmin } from "@/lib/supabase/admin";
import type { IntentScoreEventType } from "@/lib/supabase/rows";

// ⑤ intent scoring: behavior, not stated intent, decides how "hot" a lead is. Points are
// intentionally front-loaded toward actions that cost the user something (setting an
// interview, requesting a paid addon) over passive ones (just registering).
const POINTS: Record<IntentScoreEventType, number> = {
  registered: 10,
  preferences_submitted: 15,
  interview_requested: 30,
  addon_requested: 20,
};

export async function recordIntentEvent(
  userId: string,
  eventType: IntentScoreEventType
): Promise<void> {
  const { error } = await supabaseAdmin()
    .from("intent_score_events")
    .insert({ user_id: userId, event_type: eventType, points: POINTS[eventType] });
  if (error) {
    // Scoring is an internal signal, not user-facing — never fail the caller's real action
    // (registration, interview request, ...) over a scoring-log write hiccup.
    console.error(`Failed to record intent event ${eventType} for ${userId}: ${error.message}`);
  }
}

export async function getIntentScore(userId: string): Promise<number> {
  const { data, error } = await supabaseAdmin()
    .from("user_intent_scores")
    .select("score")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) {
    console.error(`Failed to load intent score for ${userId}: ${error.message}`);
    return 0;
  }
  return data?.score ?? 0;
}
