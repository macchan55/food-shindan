// Axis definitions per docs/spec/00-axes.md. Order is significant and shared across
// the DB seed, scoring engine, and admin UI.

export const CORE_AXES = [
  "HOS",
  "CRA",
  "TEA",
  "LEA",
  "BUS",
  "CRE",
  "GRO",
  "STA",
  "CHA",
  "OWN",
] as const;

export const AUX_AXES = ["EMP", "RES", "DAT", "CUS"] as const;

export const ALL_AXES = [...CORE_AXES, ...AUX_AXES] as const;

export type CoreAxis = (typeof CORE_AXES)[number];
export type AuxAxis = (typeof AUX_AXES)[number];
export type AxisCode = (typeof ALL_AXES)[number];

export const AXIS_LABELS: Record<AxisCode, string> = {
  HOS: "Hospitality（おもてなし）",
  CRA: "Craft（技術・品質）",
  TEA: "Teamwork（協働）",
  LEA: "Leadership（統率）",
  BUS: "Business（事業・数字）",
  CRE: "Creativity（創造）",
  GRO: "Growth（成長）",
  STA: "Stability（安定・再現）",
  CHA: "Challenge（挑戦）",
  OWN: "Ownership（当事者意識）",
  EMP: "Empathy（共感）",
  RES: "Resilience（耐性）",
  DAT: "Data Orientation（データ志向）",
  CUS: "Customer Orientation（顧客志向）",
};

export const CORE_AXIS_SHORT_LABELS: Record<CoreAxis, string> = {
  HOS: "ホスピタリティ",
  CRA: "技術・品質",
  TEA: "協働",
  LEA: "リーダーシップ",
  BUS: "事業・数字",
  CRE: "創造力",
  GRO: "成長意欲",
  STA: "安定・再現",
  CHA: "挑戦",
  OWN: "当事者意識",
};

export function isAxisCode(value: string): value is AxisCode {
  return (ALL_AXES as readonly string[]).includes(value);
}
