import type { FullScoreMap, MetaAxisKey, MetaAxisResult } from "./types";

/**
 * The 6 binary meta-axes used to pick one of the 64 types, and how they're derived from
 * the 10+4 normalized axis scores. This logic is newly authored (not present in the
 * original source docs) per docs/spec/00-axes.md section 3 — flagged there for planning
 * review, in particular the High-end/Mass axis. Ties resolve to the first (A) label.
 */
const META_AXIS_DEFS: {
  key: MetaAxisKey;
  labelA: string;
  labelB: string;
  compute: (s: FullScoreMap) => [number, number];
}[] = [
  {
    key: "axis1",
    labelA: "Guest",
    labelB: "Product",
    compute: (s) => [(s.HOS + s.CUS + s.TEA) / 3, (s.CRA + s.CRE + s.BUS) / 3],
  },
  { key: "axis2", labelA: "Craft", labelB: "Business", compute: (s) => [s.CRA, s.BUS] },
  { key: "axis3", labelA: "High-end", labelB: "Mass", compute: (s) => [s.CRA, s.STA] },
  {
    key: "axis4",
    labelA: "Specialist",
    labelB: "Leader",
    compute: (s) => [(s.CRA + s.OWN) / 2, s.LEA],
  },
  { key: "axis5", labelA: "Arrange", labelB: "Venture", compute: (s) => [s.GRO, s.CHA] },
  { key: "axis6", labelA: "Intuitive", labelB: "Data", compute: (s) => [100 - s.DAT, s.DAT] },
];

export function computeMetaAxes(normalized: FullScoreMap): MetaAxisResult[] {
  return META_AXIS_DEFS.map((def) => {
    const [scoreA, scoreB] = def.compute(normalized);
    const winner = scoreA >= scoreB ? def.labelA : def.labelB;
    return {
      key: def.key,
      labelA: def.labelA,
      labelB: def.labelB,
      scoreA,
      scoreB,
      winner,
      margin: Math.abs(scoreA - scoreB),
    };
  });
}
