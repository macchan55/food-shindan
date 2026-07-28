// Hand-written row types mirroring supabase/migrations/0001_init.sql. Kept intentionally
// narrow (only the columns Sprint 1 code actually reads/writes).
import type { AxisCode, CoreAxis } from "@/lib/axes";

export type DiagnosisVersionRow = {
  id: string;
  version_label: string;
  is_active: boolean;
};

export type QuestionRow = {
  id: string;
  version_id: string;
  question_code: string;
  scene_id: number;
  scene_title: string;
  visual_brief: string | null;
  display_order: number;
  question_text: string;
  status: "draft" | "published" | "archived";
};

export type ChoiceRow = {
  id: string;
  question_id: string;
  choice_code: "A" | "B" | "C" | "D";
  choice_text: string;
  display_order: number;
};

export type ChoiceScoreRow = {
  choice_id: string;
  axis_code: AxisCode;
  score_value: number;
};

export type DiagnosisTypeRow = {
  id: string;
  type_code: string;
  name: string;
  catchcopy: string;
  description: string;
  family: string;
  primary_archetype: string | null;
  strengths: string[];
  weaknesses: string[];
  suited_jobs: string[];
  suited_formats: string[];
  suited_roles: string[];
  tag_axis1: string;
  tag_axis2: string;
  tag_axis3: string;
  tag_axis4: string;
  tag_axis5: string;
  tag_axis6: string;
  image_url: string | null;
  personality_analysis: string | null;
  ability_analysis: string | null;
  growth_advice: string | null;
  career_path: string | null;
  type_moments: string[];
  compatible_type_id: string | null;
  compatible_reason: string | null;
};

export type JobFormatRoleMasterRow = {
  id: string;
  category: "job" | "format" | "role";
  name: string;
  vector: Record<CoreAxis, number>;
};

export type DiagnosisSessionRow = {
  id: string;
  version_id: string;
  user_id: string | null;
  status: "in_progress" | "completed" | "abandoned";
  gender: "male" | "female" | null;
  started_at: string;
  completed_at: string | null;
};

export type DiagnosisAnswerRow = {
  id: string;
  session_id: string;
  question_id: string;
  choice_id: string;
  answered_at: string;
};

export type DiagnosisScoreRow = {
  session_id: string;
  axis_code: AxisCode;
  raw_score: number;
  max_score: number;
  normalized_score: number;
};

export type DiagnosisResultRow = {
  id: string;
  session_id: string;
  type_id: string;
  hidden_type_id: string | null;
  meta_axes: unknown;
  industry_fit_score: number;
  industry_fit_tier: "high" | "mid" | "low";
  career_ranking: unknown;
  format_ranking: unknown;
  role_ranking: unknown;
  feedback_rating: string | null;
  feedback_comment: string | null;
  created_at: string;
};

export type UserProfileRow = {
  id: string;
  full_name: string | null;
  full_name_kana: string | null;
  birthdate: string | null;
  gender: string | null;
  postal_code: string | null;
  address: string | null;
  phone: string | null;
  photo_url: string | null;
};

export type EducationHistoryRow = {
  id: string;
  user_id: string;
  school_type: string;
  school_name: string;
  department: string | null;
  is_culinary_related: boolean;
  is_study_abroad: boolean;
  admission_date: string | null;
  graduation_date: string | null;
  status: "graduated" | "withdrew" | "enrolled";
  display_order: number;
};

export type WorkExperienceRow = {
  id: string;
  user_id: string;
  company_name: string;
  brand_name: string | null;
  store_name: string | null;
  start_date: string | null;
  end_date: string | null;
  is_current: boolean;
  employment_type: string | null;
  business_format: string | null;
  cuisine_genre: string | null;
  job_type: string | null;
  position: string | null;
  store_size: string | null;
  seat_count: string | null;
  avg_spend: string | null;
  managed_headcount: string | null;
  main_duties: string | null;
  achievements: string | null;
  reason_for_leaving: string | null;
  reason_visibility: "private" | "public";
  display_order: number;
};

export type UserQualificationRow = {
  id: string;
  user_id: string;
  name: string;
  issuer: string | null;
  obtained_date: string | null;
  expiry_date: string | null;
  certificate_number: string | null;
  image_url: string | null;
  display_order: number;
};

export type ResumeRow = {
  id: string;
  user_id: string;
  diagnosis_session_id: string | null;
  target_job: string | null;
  work_summary: string | null;
  self_pr: string | null;
  strengths_text: string | null;
  motivation: string | null;
  career_direction: string | null;
  updated_at: string;
};
