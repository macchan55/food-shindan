import { CORE_AXES } from "@/lib/axes";
import { computeMaxScores, computeRawScores, normalizeScores } from "./raw-scores";
import { computeMetaAxes } from "./meta-axes";
import { matchType } from "./type-matching";
import { computeIndustryFit } from "./industry-fit";
import { rankMasterRecords } from "./career-ranking";
import type {
  AnswerInput,
  CoreScoreMap,
  DiagnosisTypeRow,
  FullScoreMap,
  MasterRecord,
  QuestionWithChoices,
} from "./types";

export * from "./types";
export { computeMaxScores, computeRawScores, normalizeScores } from "./raw-scores";
export { computeMetaAxes } from "./meta-axes";
export { matchType } from "./type-matching";
export { computeIndustryFit } from "./industry-fit";
export { rankMasterRecords } from "./career-ranking";

export type DiagnosisResult<T extends DiagnosisTypeRow> = {
  rawScores: FullScoreMap;
  maxScores: FullScoreMap;
  normalizedScores: FullScoreMap;
  metaAxes: ReturnType<typeof computeMetaAxes>;
  primaryType: T;
  hiddenType: T | null;
  industryFit: ReturnType<typeof computeIndustryFit>;
  careerRanking: ReturnType<typeof rankMasterRecords>;
  formatRanking: ReturnType<typeof rankMasterRecords>;
  roleRanking: ReturnType<typeof rankMasterRecords>;
};

/**
 * Full rule-based diagnosis pipeline: answers -> axis scores -> 64-type match -> industry
 * fit -> career/format/role suggestions. No LLM involved anywhere in this path, per
 * docs/spec/03-mvp-overview.md section 29/34 ("診断スコアの算出はLLMではなくルールベース").
 */
export function computeDiagnosisResult<T extends DiagnosisTypeRow>(params: {
  questions: QuestionWithChoices[];
  answers: AnswerInput[];
  types: T[];
  master: MasterRecord[];
}): DiagnosisResult<T> {
  const { questions, answers, types, master } = params;

  const rawScores = computeRawScores(questions, answers);
  const maxScores = computeMaxScores(questions);
  const normalizedScores = normalizeScores(rawScores, maxScores);

  const metaAxes = computeMetaAxes(normalizedScores);
  const { primaryType, hiddenType } = matchType(metaAxes, types);
  const industryFit = computeIndustryFit(normalizedScores);

  const coreScores = CORE_AXES.reduce((acc, axis) => {
    acc[axis] = normalizedScores[axis];
    return acc;
  }, {} as CoreScoreMap);

  const careerRanking = rankMasterRecords(coreScores, master, "job");
  const formatRanking = rankMasterRecords(coreScores, master, "format");
  const roleRanking = rankMasterRecords(coreScores, master, "role");

  return {
    rawScores,
    maxScores,
    normalizedScores,
    metaAxes,
    primaryType,
    hiddenType,
    industryFit,
    careerRanking,
    formatRanking,
    roleRanking,
  };
}
