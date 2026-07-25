import { ALL_AXES, type AxisCode } from "@/lib/axes";
import type { AnswerInput, FullScoreMap, QuestionWithChoices } from "./types";

function zeroScoreMap(): FullScoreMap {
  const map = {} as FullScoreMap;
  for (const axis of ALL_AXES) map[axis] = 0;
  return map;
}

/**
 * For each axis, the maximum a user could have scored across the given question set:
 * the sum, per question, of the highest value any of its 4 choices assigns to that axis
 * (0 if none of them touch it). This only depends on the question set, not on the
 * user's actual answers — see docs/spec/04-64-questions-scoring.md section 4.
 */
export function computeMaxScores(questions: QuestionWithChoices[]): FullScoreMap {
  const max = zeroScoreMap();
  for (const q of questions) {
    const perAxisMaxThisQuestion: Partial<Record<AxisCode, number>> = {};
    for (const choice of q.choices) {
      for (const s of choice.scores) {
        perAxisMaxThisQuestion[s.axis] = Math.max(perAxisMaxThisQuestion[s.axis] ?? 0, s.value);
      }
    }
    for (const axis of ALL_AXES) {
      max[axis] += perAxisMaxThisQuestion[axis] ?? 0;
    }
  }
  return max;
}

/** Sum of the scores attached to the choice the user actually picked, per question. */
export function computeRawScores(
  questions: QuestionWithChoices[],
  answers: AnswerInput[]
): FullScoreMap {
  const raw = zeroScoreMap();
  const choiceById = new Map<string, { axis: AxisCode; value: number }[]>();
  for (const q of questions) {
    for (const c of q.choices) {
      choiceById.set(c.id, c.scores);
    }
  }
  for (const answer of answers) {
    const scores = choiceById.get(answer.choiceId);
    if (!scores) {
      throw new Error(`Unknown choice id in answers: ${answer.choiceId}`);
    }
    for (const s of scores) {
      raw[s.axis] += s.value;
    }
  }
  return raw;
}

/** raw / max * 100, rounded. Axes with max=0 (not covered by this question set) normalize to 0. */
export function normalizeScores(raw: FullScoreMap, max: FullScoreMap): FullScoreMap {
  const normalized = zeroScoreMap();
  for (const axis of ALL_AXES) {
    normalized[axis] = max[axis] > 0 ? Math.round((raw[axis] / max[axis]) * 100) : 0;
  }
  return normalized;
}
