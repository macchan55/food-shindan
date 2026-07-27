import "server-only";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { getActiveQuestionSet, getAllDiagnosisTypes, getAllMasterRecords } from "./repository";
import { computeDiagnosisResult, type AnswerInput } from "@/lib/scoring";
import { ALL_AXES, type AxisCode } from "@/lib/axes";
import type {
  DiagnosisResultRow,
  DiagnosisScoreRow,
  DiagnosisSessionRow,
  DiagnosisTypeRow,
} from "@/lib/supabase/rows";

export class DiagnosisError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export async function createSession(gender?: "male" | "female"): Promise<DiagnosisSessionRow> {
  const { versionId } = await getActiveQuestionSet();
  const db = supabaseAdmin();
  const { data, error } = await db
    .from("diagnosis_sessions")
    .insert({ version_id: versionId, gender: gender ?? null })
    .select("*")
    .single();
  if (error || !data) {
    throw new DiagnosisError(`Failed to create session: ${error?.message}`, 500);
  }
  return data as DiagnosisSessionRow;
}

export async function getSessionOrThrow(sessionId: string): Promise<DiagnosisSessionRow> {
  const db = supabaseAdmin();
  const { data, error } = await db
    .from("diagnosis_sessions")
    .select("*")
    .eq("id", sessionId)
    .maybeSingle();
  if (error) throw new DiagnosisError(`Failed to load session: ${error.message}`, 500);
  if (!data) throw new DiagnosisError("Session not found", 404);
  return data as DiagnosisSessionRow;
}

// Answers are buffered client-side (localStorage) for the full 64-question flow and only
// written here, all at once, when the user finishes — this replaces the previous
// one-DB-write-per-answer flow, which added a network+DB round trip to every question
// and made the quiz feel sluggish.
export async function completeSession(sessionId: string, answers: AnswerInput[]) {
  const session = await getSessionOrThrow(sessionId);
  if (session.status === "completed") {
    return getResult(sessionId);
  }
  if (session.status === "abandoned") {
    throw new DiagnosisError("Session was abandoned", 409);
  }

  const db = supabaseAdmin();
  const { questions: clientQuestions, scoringQuestions } = await getActiveQuestionSet();

  const answeredQuestionIds = new Set(answers.map((a) => a.questionId));
  const missing = clientQuestions.filter((q) => !answeredQuestionIds.has(q.id));
  if (missing.length > 0) {
    throw new DiagnosisError(
      `All ${clientQuestions.length} questions must be answered before completing (missing ${missing.length})`,
      400
    );
  }

  const answerRows = answers.map((a) => ({
    session_id: sessionId,
    question_id: a.questionId,
    choice_id: a.choiceId,
    answered_at: new Date().toISOString(),
  }));
  const { error: answersErr } = await db
    .from("diagnosis_answers")
    .upsert(answerRows, { onConflict: "session_id,question_id" });
  if (answersErr) throw new DiagnosisError(`Failed to save answers: ${answersErr.message}`, 500);

  const types = await getAllDiagnosisTypes();
  const master = await getAllMasterRecords();

  const result = computeDiagnosisResult({
    questions: scoringQuestions,
    answers,
    types,
    master,
  });

  const scoreRows = ALL_AXES.map((axis: AxisCode) => ({
    session_id: sessionId,
    axis_code: axis,
    raw_score: result.rawScores[axis],
    max_score: result.maxScores[axis],
    normalized_score: result.normalizedScores[axis],
  }));
  const { error: scoresErr } = await db
    .from("diagnosis_scores")
    .upsert(scoreRows, { onConflict: "session_id,axis_code" });
  if (scoresErr) throw new DiagnosisError(`Failed to save scores: ${scoresErr.message}`, 500);

  const { error: resultErr } = await db.from("diagnosis_results").upsert(
    {
      session_id: sessionId,
      type_id: result.primaryType.id,
      hidden_type_id: result.hiddenType?.id ?? null,
      meta_axes: result.metaAxes,
      industry_fit_score: result.industryFit.score,
      industry_fit_tier: result.industryFit.tier,
      career_ranking: result.careerRanking,
      format_ranking: result.formatRanking,
      role_ranking: result.roleRanking,
    },
    { onConflict: "session_id" }
  );
  if (resultErr) throw new DiagnosisError(`Failed to save result: ${resultErr.message}`, 500);

  const { error: sessionErr } = await db
    .from("diagnosis_sessions")
    .update({
      status: "completed",
      completed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", sessionId);
  if (sessionErr) throw new DiagnosisError(`Failed to update session: ${sessionErr.message}`, 500);

  return getResult(sessionId);
}

export type DiagnosisResultView = {
  session: DiagnosisSessionRow;
  result: DiagnosisResultRow;
  primaryType: DiagnosisTypeRow;
  hiddenType: DiagnosisTypeRow | null;
  compatibleType: DiagnosisTypeRow | null;
  scores: Record<AxisCode, { raw: number; max: number; normalized: number }>;
};

export async function getResult(sessionId: string): Promise<DiagnosisResultView> {
  const db = supabaseAdmin();

  const session = await getSessionOrThrow(sessionId);
  if (session.status !== "completed") {
    throw new DiagnosisError("Session is not completed yet", 409);
  }

  const { data: resultRow, error: rErr } = await db
    .from("diagnosis_results")
    .select("*")
    .eq("session_id", sessionId)
    .maybeSingle();
  if (rErr) throw new DiagnosisError(`Failed to load result: ${rErr.message}`, 500);
  if (!resultRow) throw new DiagnosisError("Result not found for session", 404);
  const result = resultRow as DiagnosisResultRow;

  // Fetch the primary/hidden types first: the compatible type id lives on the
  // primary type row, so it's only known after this query resolves.
  const typeIds = [result.type_id, result.hidden_type_id].filter(Boolean) as string[];
  const { data: typeRows, error: tErr } = await db
    .from("diagnosis_types")
    .select("*")
    .in("id", typeIds);
  if (tErr) throw new DiagnosisError(`Failed to load types: ${tErr.message}`, 500);
  const typesById = new Map((typeRows ?? []).map((t) => [t.id as string, t as DiagnosisTypeRow]));
  const primaryType = typesById.get(result.type_id);
  if (!primaryType) throw new DiagnosisError("Primary type not found", 500);
  const hiddenType = result.hidden_type_id ? typesById.get(result.hidden_type_id) ?? null : null;

  let compatibleType: DiagnosisTypeRow | null = null;
  if (primaryType.compatible_type_id) {
    const { data: compatibleRow, error: cErr } = await db
      .from("diagnosis_types")
      .select("*")
      .eq("id", primaryType.compatible_type_id)
      .maybeSingle();
    if (cErr) throw new DiagnosisError(`Failed to load compatible type: ${cErr.message}`, 500);
    compatibleType = (compatibleRow as DiagnosisTypeRow | null) ?? null;
  }

  const { data: scoreRows, error: sErr } = await db
    .from("diagnosis_scores")
    .select("*")
    .eq("session_id", sessionId);
  if (sErr) throw new DiagnosisError(`Failed to load scores: ${sErr.message}`, 500);
  const scores = {} as DiagnosisResultView["scores"];
  for (const row of (scoreRows ?? []) as DiagnosisScoreRow[]) {
    scores[row.axis_code] = {
      raw: row.raw_score,
      max: row.max_score,
      normalized: row.normalized_score,
    };
  }

  return { session, result, primaryType, hiddenType, compatibleType, scores };
}

export async function saveFeedback(
  sessionId: string,
  rating: string,
  comment: string | null
): Promise<void> {
  await getSessionOrThrow(sessionId);
  const db = supabaseAdmin();
  const { error } = await db
    .from("diagnosis_results")
    .update({ feedback_rating: rating, feedback_comment: comment })
    .eq("session_id", sessionId);
  if (error) throw new DiagnosisError(`Failed to save feedback: ${error.message}`, 500);
}
