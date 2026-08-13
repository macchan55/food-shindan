import "server-only";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { recordIntentEvent } from "@/lib/intentScore";
import type { CareerPreferencesRow, CareerTiming } from "@/lib/supabase/rows";

export class CareerPreferencesError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export async function getCareerPreferences(userId: string): Promise<CareerPreferencesRow | null> {
  const { data, error } = await supabaseAdmin()
    .from("career_preferences")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) {
    throw new CareerPreferencesError(`Failed to load career preferences: ${error.message}`, 500);
  }
  return (data as CareerPreferencesRow | null) ?? null;
}

export type CareerPreferencesInput = {
  timing: CareerTiming;
  desired_income: string | null;
  desired_area: string | null;
  desired_format: string | null;
  desired_role: string | null;
  change_reasons: string[];
};

/** Upserts the 5-item preferences form (②③) and scores the submission (⑤). */
export async function upsertCareerPreferences(
  userId: string,
  input: CareerPreferencesInput
): Promise<CareerPreferencesRow> {
  const existing = await getCareerPreferences(userId);
  const { data, error } = await supabaseAdmin()
    .from("career_preferences")
    .upsert(
      { user_id: userId, ...input, updated_at: new Date().toISOString() },
      { onConflict: "user_id" }
    )
    .select("*")
    .single();
  if (error || !data) {
    throw new CareerPreferencesError(`Failed to save career preferences: ${error?.message}`, 500);
  }
  if (!existing) {
    await recordIntentEvent(userId, "preferences_submitted");
  }
  return data as CareerPreferencesRow;
}
