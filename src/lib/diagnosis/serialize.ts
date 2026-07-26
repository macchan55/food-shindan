import type { DiagnosisResultView } from "./service";

function characterImageUrl(
  t: DiagnosisResultView["primaryType"],
  gender: "male" | "female" | null
): string | null {
  if (gender === "male") return `/characters/${t.type_code}-m.webp`;
  if (gender === "female") return `/characters/${t.type_code}-f.webp`;
  return t.image_url;
}

function typeSummary(
  t: DiagnosisResultView["primaryType"],
  gender: "male" | "female" | null
) {
  return {
    typeCode: t.type_code,
    name: t.name,
    catchcopy: t.catchcopy,
    description: t.description,
    family: t.family,
    primaryArchetype: t.primary_archetype,
    imageUrl: characterImageUrl(t, gender),
    strengths: t.strengths,
    weaknesses: t.weaknesses,
    suitedJobs: t.suited_jobs,
    suitedFormats: t.suited_formats,
    suitedRoles: t.suited_roles,
  };
}

/** Shapes DB rows into the camelCase JSON the diagnosis result screen consumes. */
export function serializeResult(view: DiagnosisResultView) {
  const gender = view.session.gender;
  return {
    sessionId: view.session.id,
    status: view.session.status,
    completedAt: view.session.completed_at,
    type: typeSummary(view.primaryType, gender),
    hiddenType: view.hiddenType ? typeSummary(view.hiddenType, gender) : null,
    industryFit: {
      score: view.result.industry_fit_score,
      tier: view.result.industry_fit_tier,
    },
    metaAxes: view.result.meta_axes,
    careerRanking: view.result.career_ranking,
    formatRanking: view.result.format_ranking,
    roleRanking: view.result.role_ranking,
    scores: view.scores,
    feedback: {
      rating: view.result.feedback_rating,
      comment: view.result.feedback_comment,
    },
  };
}
