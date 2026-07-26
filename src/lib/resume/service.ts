import "server-only";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { getResult } from "@/lib/diagnosis/service";
import type {
  EducationHistoryRow,
  ResumeRow,
  UserProfileRow,
  UserQualificationRow,
  WorkExperienceRow,
} from "@/lib/supabase/rows";

export class ResumeError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

// ---------------------------------------------------------------------------
// Profile
// ---------------------------------------------------------------------------

export async function getProfile(userId: string): Promise<UserProfileRow | null> {
  const { data, error } = await supabaseAdmin()
    .from("user_profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();
  if (error) throw new ResumeError(`Failed to load profile: ${error.message}`, 500);
  return (data as UserProfileRow | null) ?? null;
}

export type ProfileInput = Partial<Omit<UserProfileRow, "id">>;

export async function upsertProfile(userId: string, input: ProfileInput): Promise<UserProfileRow> {
  const { data, error } = await supabaseAdmin()
    .from("user_profiles")
    .upsert({ id: userId, ...input, updated_at: new Date().toISOString() }, { onConflict: "id" })
    .select("*")
    .single();
  if (error || !data) throw new ResumeError(`Failed to save profile: ${error?.message}`, 500);
  return data as UserProfileRow;
}

// ---------------------------------------------------------------------------
// Education
// ---------------------------------------------------------------------------

export async function listEducation(userId: string): Promise<EducationHistoryRow[]> {
  const { data, error } = await supabaseAdmin()
    .from("education_histories")
    .select("*")
    .eq("user_id", userId)
    .order("display_order", { ascending: true });
  if (error) throw new ResumeError(`Failed to load education: ${error.message}`, 500);
  return (data ?? []) as EducationHistoryRow[];
}

export type EducationInput = Omit<EducationHistoryRow, "id" | "user_id">;

export async function addEducation(
  userId: string,
  input: EducationInput
): Promise<EducationHistoryRow> {
  const { data, error } = await supabaseAdmin()
    .from("education_histories")
    .insert({ user_id: userId, ...input })
    .select("*")
    .single();
  if (error || !data) throw new ResumeError(`Failed to add education: ${error?.message}`, 500);
  return data as EducationHistoryRow;
}

export async function deleteEducation(userId: string, id: string): Promise<void> {
  const { error } = await supabaseAdmin()
    .from("education_histories")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);
  if (error) throw new ResumeError(`Failed to delete education: ${error.message}`, 500);
}

// ---------------------------------------------------------------------------
// Work experience
// ---------------------------------------------------------------------------

export async function listWorkExperiences(userId: string): Promise<WorkExperienceRow[]> {
  const { data, error } = await supabaseAdmin()
    .from("work_experiences")
    .select("*")
    .eq("user_id", userId)
    .order("display_order", { ascending: true });
  if (error) throw new ResumeError(`Failed to load work experience: ${error.message}`, 500);
  return (data ?? []) as WorkExperienceRow[];
}

export type WorkExperienceInput = Omit<WorkExperienceRow, "id" | "user_id">;

export async function addWorkExperience(
  userId: string,
  input: WorkExperienceInput
): Promise<WorkExperienceRow> {
  const { data, error } = await supabaseAdmin()
    .from("work_experiences")
    .insert({ user_id: userId, ...input })
    .select("*")
    .single();
  if (error || !data)
    throw new ResumeError(`Failed to add work experience: ${error?.message}`, 500);
  return data as WorkExperienceRow;
}

export async function deleteWorkExperience(userId: string, id: string): Promise<void> {
  const { error } = await supabaseAdmin()
    .from("work_experiences")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);
  if (error) throw new ResumeError(`Failed to delete work experience: ${error.message}`, 500);
}

// ---------------------------------------------------------------------------
// Qualifications
// ---------------------------------------------------------------------------

export async function listQualifications(userId: string): Promise<UserQualificationRow[]> {
  const { data, error } = await supabaseAdmin()
    .from("user_qualifications")
    .select("*")
    .eq("user_id", userId)
    .order("display_order", { ascending: true });
  if (error) throw new ResumeError(`Failed to load qualifications: ${error.message}`, 500);
  return (data ?? []) as UserQualificationRow[];
}

export type QualificationInput = Omit<UserQualificationRow, "id" | "user_id">;

export async function addQualification(
  userId: string,
  input: QualificationInput
): Promise<UserQualificationRow> {
  const { data, error } = await supabaseAdmin()
    .from("user_qualifications")
    .insert({ user_id: userId, ...input })
    .select("*")
    .single();
  if (error || !data)
    throw new ResumeError(`Failed to add qualification: ${error?.message}`, 500);
  return data as UserQualificationRow;
}

export async function deleteQualification(userId: string, id: string): Promise<void> {
  const { error } = await supabaseAdmin()
    .from("user_qualifications")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);
  if (error) throw new ResumeError(`Failed to delete qualification: ${error.message}`, 500);
}

// ---------------------------------------------------------------------------
// Resume (the one editable AI-assisted text record per user)
// ---------------------------------------------------------------------------

export async function getOrCreateResume(userId: string): Promise<ResumeRow> {
  const { data, error } = await supabaseAdmin()
    .from("resumes")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw new ResumeError(`Failed to load resume: ${error.message}`, 500);
  if (data) return data as ResumeRow;

  const { data: created, error: createErr } = await supabaseAdmin()
    .from("resumes")
    .insert({ user_id: userId })
    .select("*")
    .single();
  if (createErr || !created)
    throw new ResumeError(`Failed to create resume: ${createErr?.message}`, 500);
  return created as ResumeRow;
}

export type ResumeInput = Partial<
  Pick<
    ResumeRow,
    "target_job" | "work_summary" | "self_pr" | "strengths_text" | "motivation" | "career_direction"
  >
>;

export async function updateResume(userId: string, input: ResumeInput): Promise<ResumeRow> {
  await getOrCreateResume(userId); // ensure a row exists to update
  const { data, error } = await supabaseAdmin()
    .from("resumes")
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq("user_id", userId)
    .select("*")
    .single();
  if (error || !data) throw new ResumeError(`Failed to save resume: ${error?.message}`, 500);
  return data as ResumeRow;
}

/**
 * Links a completed (usually anonymous) diagnosis session to the account that just
 * registered from the result page's "履歴書を作る" CTA, and records it on the resume row
 * so AI generation can pull the diagnosis content in.
 */
export async function linkDiagnosisSession(userId: string, sessionId: string): Promise<void> {
  const db = supabaseAdmin();
  const { data: session, error: sErr } = await db
    .from("diagnosis_sessions")
    .select("id, status")
    .eq("id", sessionId)
    .maybeSingle();
  if (sErr) throw new ResumeError(`Failed to load diagnosis session: ${sErr.message}`, 500);
  if (!session) throw new ResumeError("Diagnosis session not found", 404);
  if (session.status !== "completed") {
    throw new ResumeError("Diagnosis session is not completed yet", 409);
  }

  const { error: uErr } = await db
    .from("diagnosis_sessions")
    .update({ user_id: userId })
    .eq("id", sessionId);
  if (uErr) throw new ResumeError(`Failed to link diagnosis session: ${uErr.message}`, 500);

  await getOrCreateResume(userId);
  const { error: rErr } = await db
    .from("resumes")
    .update({ diagnosis_session_id: sessionId })
    .eq("user_id", userId);
  if (rErr) throw new ResumeError(`Failed to link resume to session: ${rErr.message}`, 500);
}

export type DiagnosisContext = {
  strengths: string[];
  personalityAnalysis: string | null;
  abilityAnalysis: string | null;
  careerPath: string | null;
  suitedJobs: string[];
};

/** The linked diagnosis session's primary-type content, shaped for AI generation. */
export async function getDiagnosisContext(userId: string): Promise<DiagnosisContext | null> {
  const resume = await getOrCreateResume(userId);
  if (!resume.diagnosis_session_id) return null;
  const view = await getResult(resume.diagnosis_session_id);
  const t = view.primaryType;
  return {
    strengths: t.strengths,
    personalityAnalysis: t.personality_analysis,
    abilityAnalysis: t.ability_analysis,
    careerPath: t.career_path,
    suitedJobs: t.suited_jobs,
  };
}
