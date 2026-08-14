import "server-only";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { recordIntentEvent } from "@/lib/intentScore";
import type { JobPostingRow } from "@/lib/supabase/rows";
import type { JobPostingView } from "@/lib/jobsFormatting";

export class JobsError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

// Everyone (including anonymous visitors) can see this many teaser postings, store name
// always hidden — ④'s "ミシュラン店の求人を1〜3件チラ見せ".
const TEASER_LIMIT = 3;

async function fetchOpenPostings(): Promise<JobPostingRow[]> {
  const { data, error } = await supabaseAdmin()
    .from("job_postings")
    .select("*")
    .eq("status", "open")
    .order("is_michelin", { ascending: false })
    .order("display_order", { ascending: true });
  if (error) throw new JobsError(`Failed to load job postings: ${error.message}`, 500);
  return (data ?? []) as JobPostingRow[];
}

function toTeaserView(row: JobPostingRow): JobPostingView {
  return {
    id: row.id,
    storeName: "登録すると店名を確認できます",
    storeNameRevealed: false,
    isMichelin: row.is_michelin,
    area: row.area,
    businessFormat: row.business_format,
    role: row.role,
    annualIncomeMin: row.annual_income_min,
    annualIncomeMax: row.annual_income_max,
    summary: row.summary,
    isConfidential: row.is_confidential,
    interviewRequested: false,
  };
}

/** Anonymous visitors / the result-page teaser: a few Michelin-leaning postings, name hidden. */
export async function listTeaserPostings(): Promise<JobPostingView[]> {
  const postings = await fetchOpenPostings();
  return postings.slice(0, TEASER_LIMIT).map(toTeaserView);
}

/**
 * Registered users see the full list. Non-confidential postings reveal their store name
 * outright (registration alone unlocks them); confidential ("非公開求人") postings stay
 * masked until the user has requested an interview for that specific posting (④).
 */
export async function listPostingsForUser(userId: string): Promise<JobPostingView[]> {
  const postings = await fetchOpenPostings();
  const { data: requests, error } = await supabaseAdmin()
    .from("job_interview_requests")
    .select("job_posting_id")
    .eq("user_id", userId)
    .neq("status", "cancelled");
  if (error) throw new JobsError(`Failed to load interview requests: ${error.message}`, 500);
  const requestedIds = new Set((requests ?? []).map((r) => r.job_posting_id as string));

  return postings.map((row) => {
    const requested = requestedIds.has(row.id);
    const revealed = !row.is_confidential || requested;
    return {
      id: row.id,
      storeName: revealed ? row.store_name : "面談設定で店名を開示",
      storeNameRevealed: revealed,
      isMichelin: row.is_michelin,
      area: row.area,
      businessFormat: row.business_format,
      role: row.role,
      annualIncomeMin: row.annual_income_min,
      annualIncomeMax: row.annual_income_max,
      summary: row.summary,
      isConfidential: row.is_confidential,
      interviewRequested: requested,
    };
  });
}

/** Sets up an interview for a confidential posting, unlocking its store name (④⑤). */
export async function requestInterview(userId: string, jobPostingId: string): Promise<void> {
  const { data: posting, error: postingErr } = await supabaseAdmin()
    .from("job_postings")
    .select("id")
    .eq("id", jobPostingId)
    .eq("status", "open")
    .maybeSingle();
  if (postingErr) throw new JobsError(`Failed to load posting: ${postingErr.message}`, 500);
  if (!posting) throw new JobsError("Job posting not found", 404);

  const { data: existing, error: existingErr } = await supabaseAdmin()
    .from("job_interview_requests")
    .select("id")
    .eq("user_id", userId)
    .eq("job_posting_id", jobPostingId)
    .maybeSingle();
  if (existingErr) {
    throw new JobsError(`Failed to check interview request: ${existingErr.message}`, 500);
  }
  if (existing) return;

  const { error } = await supabaseAdmin()
    .from("job_interview_requests")
    .insert({ user_id: userId, job_posting_id: jobPostingId });
  if (error) throw new JobsError(`Failed to request interview: ${error.message}`, 500);

  await recordIntentEvent(userId, "interview_requested");
}
