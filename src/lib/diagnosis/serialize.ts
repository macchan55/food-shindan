import type { DiagnosisResultView } from "./service";

// Display-only boost for the axis scores shown on the result screen (radar chart +
// numeric legend). Most question choices split their 4 points across 2-3 axes, so the
// "true" 0-100 normalized score (raw / theoretical max) clusters low-to-mid even for a
// respondent's strongest axis. This power curve fixes 0->0 and 100->100 and preserves
// ordering, so it never touches type matching / industry fit / career ranking, which all
// keep using the untransformed normalized score.
const DISPLAY_SCORE_GAMMA = 0.6;
function displayScore(normalized: number): number {
  const clamped = Math.max(0, Math.min(100, normalized));
  return Math.round(100 * Math.pow(clamped / 100, DISPLAY_SCORE_GAMMA));
}

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
    personalityAnalysis: t.personality_analysis,
    abilityAnalysis: t.ability_analysis,
    growthAdvice: t.growth_advice,
    careerPath: t.career_path,
    typeMoments: t.type_moments,
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
    compatibleType: view.compatibleType
      ? {
          ...typeSummary(view.compatibleType, gender),
          compatibleReason: view.primaryType.compatible_reason,
        }
      : null,
    industryFit: {
      score: view.result.industry_fit_score,
      tier: view.result.industry_fit_tier,
    },
    metaAxes: view.result.meta_axes,
    careerRanking: view.result.career_ranking,
    formatRanking: view.result.format_ranking,
    roleRanking: view.result.role_ranking,
    scores: Object.fromEntries(
      Object.entries(view.scores).map(([axis, s]) => [
        axis,
        { ...s, display: displayScore(s.normalized) },
      ])
    ),
    feedback: {
      rating: view.result.feedback_rating,
      comment: view.result.feedback_comment,
    },
  };
}
