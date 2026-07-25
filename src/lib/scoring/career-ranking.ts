import { CORE_AXES } from "@/lib/axes";
import type { CoreScoreMap, MasterCategory, MasterRecord, RankedMaster } from "./types";

function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0;
  let magA = 0;
  let magB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }
  if (magA === 0 || magB === 0) return 0;
  return dot / (Math.sqrt(magA) * Math.sqrt(magB));
}

/**
 * Ranks job / format(業態) / role master records by cosine similarity between the user's
 * normalized 10-core-axis vector and each record's vector (docs/spec/02). Cosine similarity
 * is used rather than raw distance because it only cares about the user's "shape" of
 * strengths, not overall score magnitude.
 */
export function rankMasterRecords(
  userCoreScores: CoreScoreMap,
  master: MasterRecord[],
  category: MasterCategory,
  topN = 5
): RankedMaster[] {
  const userVector = CORE_AXES.map((axis) => userCoreScores[axis]);
  return master
    .filter((m) => m.category === category)
    .map((m) => {
      const vector = CORE_AXES.map((axis) => m.vector[axis]);
      const similarity = cosineSimilarity(userVector, vector);
      return { id: m.id, name: m.name, matchScore: Math.round(similarity * 100) };
    })
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, topN);
}
