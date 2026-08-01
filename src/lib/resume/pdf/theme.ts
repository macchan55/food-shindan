import type { ResumeStyleId, RirekishoTemplateId, ShokumuTemplateId } from "./types";

export const COLORS = {
  ink: "#1a1a1a",
  muted: "#666666",
  faint: "#999999",
  border: "#cccccc",
  brand: "#e8547a",
  brandSoft: "#ffe3ec",
  brandBorder: "#f3b8c8",
  sidebarBg: "#3a2c33",
};

export const RIREKISHO_TEMPLATES: { id: RirekishoTemplateId; label: string; description: string }[] = [
  { id: "traditional", label: "トラディショナル", description: "学歴・職歴を一つの年表にまとめた王道フォーマット" },
  { id: "modern", label: "モダン", description: "余白を活かした、線の少ない読みやすいレイアウト" },
  { id: "sidebar", label: "プロフィール", description: "サイドバーに人物情報を配置したデザイン重視レイアウト" },
];

export const SHOKUMU_TEMPLATES: { id: ShokumuTemplateId; label: string; description: string }[] = [
  { id: "chronological", label: "編年体", description: "経歴を時系列順に丁寧に伝える王道フォーマット" },
  { id: "timeline", label: "タイムライン", description: "直近の経歴から振り返るキャリア型レイアウト" },
  { id: "highlight", label: "アピール型", description: "強み・実績を前面に押し出すレイアウト" },
];

export const RESUME_STYLES: {
  id: ResumeStyleId;
  label: string;
  description: string;
  rirekishoTemplate: RirekishoTemplateId;
  shokumuTemplate: ShokumuTemplateId;
}[] = [
  {
    id: "traditional",
    label: "トラディショナル",
    description: "王道の書式で丁寧にまとめる、信頼感のあるスタイル",
    rirekishoTemplate: "traditional",
    shokumuTemplate: "chronological",
  },
  {
    id: "modern",
    label: "モダン",
    description: "余白を活かして読みやすい、今どきのシンプルなスタイル",
    rirekishoTemplate: "modern",
    shokumuTemplate: "timeline",
  },
  {
    id: "rich",
    label: "リッチ",
    description: "カラーとレイアウトで魅せる、デザイン重視のスタイル",
    rirekishoTemplate: "sidebar",
    shokumuTemplate: "highlight",
  },
];
