import type { AxisCode, CoreAxis } from "@/lib/axes";

export type ScoreMap = Partial<Record<AxisCode, number>>;
export type FullScoreMap = Record<AxisCode, number>;
export type CoreScoreMap = Record<CoreAxis, number>;

export type ChoiceWithScores = {
  id: string;
  scores: { axis: AxisCode; value: number }[];
};

export type QuestionWithChoices = {
  id: string;
  choices: ChoiceWithScores[];
};

export type AnswerInput = {
  questionId: string;
  choiceId: string;
};

export type MetaAxisKey = "axis1" | "axis2" | "axis3" | "axis4" | "axis5" | "axis6";

export type MetaAxisResult = {
  key: MetaAxisKey;
  labelA: string;
  labelB: string;
  scoreA: number;
  scoreB: number;
  winner: string;
  margin: number;
};

export type MasterCategory = "job" | "format" | "role";

export type MasterRecord = {
  id: string;
  category: MasterCategory;
  name: string;
  vector: CoreScoreMap;
};

export type RankedMaster = {
  id: string;
  name: string;
  matchScore: number; // 0-100
};

export type DiagnosisTypeTags = {
  tag_axis1: string;
  tag_axis2: string;
  tag_axis3: string;
  tag_axis4: string;
  tag_axis5: string;
  tag_axis6: string;
};

export type DiagnosisTypeRow = DiagnosisTypeTags & {
  id: string;
  type_code: string;
  [key: string]: unknown;
};

export type IndustryFitTier = "high" | "mid" | "low";
