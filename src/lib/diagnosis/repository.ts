import "server-only";
import { supabaseAdmin } from "@/lib/supabase/admin";
import type {
  ChoiceRow,
  ChoiceScoreRow,
  DiagnosisTypeRow,
  JobFormatRoleMasterRow,
  QuestionRow,
} from "@/lib/supabase/rows";
import type { QuestionWithChoices } from "@/lib/scoring/types";

export type QuestionForClient = {
  id: string;
  questionCode: string;
  sceneId: number;
  sceneTitle: string;
  visualBrief: string | null;
  displayOrder: number;
  text: string;
  choices: { id: string; code: string; text: string; displayOrder: number }[];
};

async function getActiveVersionId(): Promise<string> {
  const { data, error } = await supabaseAdmin()
    .from("diagnosis_versions")
    .select("id")
    .eq("is_active", true)
    .single();
  if (error || !data) {
    throw new Error(`No active diagnosis version found: ${error?.message}`);
  }
  return data.id as string;
}

type QuestionWithNested = QuestionRow & {
  choices: (ChoiceRow & { choice_scores: ChoiceScoreRow[] })[];
};

/**
 * All published questions + choices + per-choice axis scores for the active version, in a
 * single nested-select query (Postgrest embeds choices/choice_scores directly) instead of
 * three sequential round trips chained by `.in(...)` on growing ID lists — the previous
 * shape was the main latency cost on "診断をはじめる" (questions→64 choice_ids→256+
 * choice_score rows, each awaited one after another).
 */
export async function getActiveQuestionSet(): Promise<{
  versionId: string;
  questions: QuestionForClient[];
  scoringQuestions: QuestionWithChoices[];
}> {
  const versionId = await getActiveVersionId();
  const db = supabaseAdmin();

  const { data, error } = await db
    .from("questions")
    .select("*, choices(*, choice_scores(*))")
    .eq("version_id", versionId)
    .eq("status", "published")
    .order("display_order", { ascending: true })
    .order("display_order", { ascending: true, referencedTable: "choices" });
  if (error) throw new Error(`Failed to load question set: ${error.message}`);
  const questions = (data ?? []) as QuestionWithNested[];

  const questionsForClient: QuestionForClient[] = questions.map((q) => ({
    id: q.id,
    questionCode: q.question_code,
    sceneId: q.scene_id,
    sceneTitle: q.scene_title,
    visualBrief: q.visual_brief,
    displayOrder: q.display_order,
    text: q.question_text,
    choices: q.choices.map((c) => ({
      id: c.id,
      code: c.choice_code,
      text: c.choice_text,
      displayOrder: c.display_order,
    })),
  }));

  const scoringQuestions: QuestionWithChoices[] = questions.map((q) => ({
    id: q.id,
    choices: q.choices.map((c) => ({
      id: c.id,
      scores: c.choice_scores.map((s) => ({
        axis: s.axis_code,
        value: s.score_value,
      })),
    })),
  }));

  return { versionId, questions: questionsForClient, scoringQuestions };
}

export async function getAllDiagnosisTypes(): Promise<DiagnosisTypeRow[]> {
  const { data, error } = await supabaseAdmin()
    .from("diagnosis_types")
    .select("*")
    .eq("status", "published");
  if (error) throw new Error(`Failed to load diagnosis types: ${error.message}`);
  return (data ?? []) as DiagnosisTypeRow[];
}

export async function getAllMasterRecords(): Promise<JobFormatRoleMasterRow[]> {
  const { data, error } = await supabaseAdmin().from("job_format_role_master").select("*");
  if (error) throw new Error(`Failed to load master records: ${error.message}`);
  return (data ?? []) as JobFormatRoleMasterRow[];
}
