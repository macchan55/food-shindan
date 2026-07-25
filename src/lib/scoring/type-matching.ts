import type { DiagnosisTypeRow, MetaAxisResult } from "./types";

export type TypeMatchResult<T extends DiagnosisTypeRow> = {
  primaryType: T;
  hiddenType: T | null;
  tags: [string, string, string, string, string, string];
};

const TAG_FIELDS = [
  "tag_axis1",
  "tag_axis2",
  "tag_axis3",
  "tag_axis4",
  "tag_axis5",
  "tag_axis6",
] as const;

function tagKey(tags: string[]): string {
  return tags.join("|");
}

/**
 * Picks the winning tag for each of the 6 meta-axes and looks up the matching one of the
 * 64 types (the tag combination is unique per type by construction — see
 * docs/spec/01-64-types.md). If the closest-fought meta-axis has a margin under 3 points
 * (docs/spec/04-64-questions-scoring.md section 4), the type obtained by flipping just
 * that axis is surfaced as the "hidden type" (second candidate).
 */
export function matchType<T extends DiagnosisTypeRow>(
  metaAxes: MetaAxisResult[],
  types: T[]
): TypeMatchResult<T> {
  const byTagKey = new Map<string, T>();
  for (const t of types) {
    byTagKey.set(tagKey(TAG_FIELDS.map((f) => t[f] as string)), t);
  }

  const winners = metaAxes.map((m) => m.winner);
  const primaryType = byTagKey.get(tagKey(winners));
  if (!primaryType) {
    throw new Error(`No diagnosis type found for tag combination: ${tagKey(winners)}`);
  }

  let hiddenType: T | null = null;
  const closest = metaAxes.reduce((min, m) => (m.margin < min.margin ? m : min), metaAxes[0]);
  if (closest.margin < 3) {
    const idx = metaAxes.findIndex((m) => m.key === closest.key);
    const altWinners = [...winners];
    altWinners[idx] = closest.winner === closest.labelA ? closest.labelB : closest.labelA;
    hiddenType = byTagKey.get(tagKey(altWinners)) ?? null;
  }

  return {
    primaryType,
    hiddenType,
    tags: winners as TypeMatchResult<T>["tags"],
  };
}
