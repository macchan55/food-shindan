import type { ResumeFormat } from "./types";

export type ThemePalette = {
  accent: string;
  soft: string;
  border: string;
  onAccent: string;
};

export const PALETTES: Record<ResumeFormat, ThemePalette> = {
  simple: { accent: "#1a1a1a", soft: "#ffffff", border: "#999999", onAccent: "#1a1a1a" },
  standard: { accent: "#333333", soft: "#f0f0f0", border: "#cccccc", onAccent: "#1a1a1a" },
  rich: { accent: "#e8547a", soft: "#ffe3ec", border: "#f6c9d6", onAccent: "#ffffff" },
};

export const RESUME_FORMATS: ResumeFormat[] = ["simple", "standard", "rich"];

export const FORMAT_LABELS: Record<ResumeFormat, string> = {
  simple: "シンプル",
  standard: "スタンダード",
  rich: "リッチ",
};

export const FORMAT_DESCRIPTIONS: Record<ResumeFormat, string> = {
  simple: "白黒・省スペースの実用的なレイアウト",
  standard: "バランス重視の標準レイアウト",
  rich: "カラーで見出しを強調した華やかなレイアウト",
};
