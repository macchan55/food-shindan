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

/** All published questions + choices + per-choice axis scores for the active version. */
export async function getActiveQuestionSet(): Promise<{
  versionId: string;
  questions: QuestionForClient[];
  scoringQuestions: QuestionWithChoices[];
}> {
  const versionId = await getActiveVersionId();
  const db = supabaseAdmin();

  const { data: questionRows, error: qErr } = await db
    .from("questions")
    .select("*")
    .eq("version_id", versionId)
    .eq("status", "published")
    .order("display_order", { ascending: true });
  if (qErr) throw new Error(`Failed to load questions: ${qErr.message}`);
  const questions = (questionRows ?? []) as QuestionRow[];

  const questionIds = questions.map((q) => q.id);
  const { data: choiceRows, error: cErr } = await db
    .from("choices")
    .select("*")
    .in("question_id", questionIds)
    .order("display_order", { ascending: true });
  if (cErr) throw new Error(`Failed to load choices: ${cErr.message}`);
  const choices = (choiceRows ?? []) as ChoiceRow[];

  const choiceIds = choices.map((c) => c.id);
  const { data: scoreRows, error: sErr } = await db
    .from("choice_scores")
    .select("*")
    .in("choice_id", choiceIds);
  if (sErr) throw new Error(`Failed to load choice scores: ${sErr.message}`);
  const scores = (scoreRows ?? []) as ChoiceScoreRow[];

  const scoresByChoice = new Map<string, ChoiceScoreRow[]>();
  for (const s of scores) {
    const arr = scoresByChoice.get(s.choice_id) ?? [];
    arr.push(s);
    scoresByChoice.set(s.choice_id, arr);
  }

  const choicesByQuestion = new Map<string, ChoiceRow[]>();
  for (const c of choices) {
    const arr = choicesByQuestion.get(c.question_id) ?? [];
    arr.push(c);
    choicesByQuestion.set(c.question_id, arr);
  }

  const questionsForClient: QuestionForClient[] = questions.map((q) => ({
    id: q.id,
    questionCode: q.question_code,
    sceneId: q.scene_id,
    sceneTitle: q.scene_title,
    visualBrief: q.visual_brief,
    displayOrder: q.display_order,
    text: q.question_text,
    choices: (choicesByQuestion.get(q.id) ?? []).map((c) => ({
      id: c.id,
      code: c.choice_code,
      text: c.choice_text,
      displayOrder: c.display_order,
    })),
  }));

  const scoringQuestions: QuestionWithChoices[] = questions.map((q) => ({
    id: q.id,
    choices: (choicesByQuestion.get(q.id) ?? []).map((c) => ({
      id: c.id,
      scores: (scoresByChoice.get(c.id) ?? []).map((s) => ({
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
