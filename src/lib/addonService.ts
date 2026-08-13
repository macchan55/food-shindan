import "server-only";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { recordIntentEvent } from "@/lib/intentScore";
import type { AddonRequestRow, AddonType } from "@/lib/supabase/rows";

export class AddonError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

// ⑩ optional paid add-ons, positioned beside the (always-free) resume/PDF flow, never
// blocking it. Interest capture only — no payment processing here.
export async function requestAddon(
  userId: string,
  addonType: AddonType,
  note: string | null
): Promise<AddonRequestRow> {
  const { data, error } = await supabaseAdmin()
    .from("addon_requests")
    .insert({ user_id: userId, addon_type: addonType, note })
    .select("*")
    .single();
  if (error || !data) throw new AddonError(`Failed to request addon: ${error?.message}`, 500);
  await recordIntentEvent(userId, "addon_requested");
  return data as AddonRequestRow;
}

export async function listAddonRequests(userId: string): Promise<AddonRequestRow[]> {
  const { data, error } = await supabaseAdmin()
    .from("addon_requests")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw new AddonError(`Failed to load addon requests: ${error.message}`, 500);
  return (data ?? []) as AddonRequestRow[];
}
