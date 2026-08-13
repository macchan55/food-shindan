// Tag-based work history entry (⑥⑦): business_format picks a granularity tier that
// decides whether 職務経歴書 users get a curated 持ち場×技術タグ picker or plain free text.
//   - "detailed": format has enough shared vocabulary to be worth a rich, format-specific
//     tag set (和食・寿司, フレンチ・イタリアン today — expand this map as more content is
//     curated, same pattern as the diagnosis type deep-dive content).
//   - "simple": a shorter, generic tag set that still beats a blank textarea.
//   - "freeform": no curated vocabulary yet, falls back to the existing main_duties/
//     achievements free text fields.

export type WorkGranularity = "detailed" | "simple" | "freeform";

export const WORK_BUSINESS_FORMATS = [
  "和食・寿司",
  "フレンチ・イタリアン",
  "焼鳥・焼肉",
  "中華",
  "居酒屋・ダイニング",
  "カフェ・喫茶",
  "ホテル・宴会",
  "その他",
] as const;

const GRANULARITY_MAP: Record<string, WorkGranularity> = {
  "和食・寿司": "detailed",
  "フレンチ・イタリアン": "detailed",
  "焼鳥・焼肉": "simple",
  中華: "simple",
  "居酒屋・ダイニング": "simple",
  "カフェ・喫茶": "simple",
  "ホテル・宴会": "simple",
  その他: "freeform",
};

export function granularityFor(businessFormat: string | null): WorkGranularity {
  if (!businessFormat) return "freeform";
  return GRANULARITY_MAP[businessFormat] ?? "freeform";
}

type TagSet = { stations: string[]; skills: string[] };

const DETAILED_TAGS: Record<string, TagSet> = {
  "和食・寿司": {
    stations: ["立て場（寿司）", "焼き場", "揚げ場", "椀場", "追い回し", "ホール", "レジ・会計", "店長業務"],
    skills: [
      "出汁引き",
      "魚の目利き・仕入れ",
      "活け締め・血抜き",
      "寿司握り",
      "巻物・軍艦",
      "刺身の技術（引き造り）",
      "煮物・炊き合わせ",
      "衛生管理（HACCP）",
      "季節料理の献立立案",
      "原価管理",
    ],
  },
  "フレンチ・イタリアン": {
    stations: [
      "ガルドマンジェ（前菜）",
      "ソーシエ（ソース）",
      "パティシエ（デザート）",
      "パン場",
      "ホール（ソムリエ含む）",
      "レジ・会計",
      "店長業務",
    ],
    skills: [
      "ソース技術",
      "ワインペアリング提案",
      "仕込み・下処理",
      "盛り付け・デコレーション",
      "衛生管理（HACCP）",
      "原価管理",
      "メニュー開発",
      "接客サービス（フルコース対応）",
    ],
  },
};

const SIMPLE_TAGS: TagSet = {
  stations: ["ホール", "キッチン", "レジ・会計", "仕込み", "発注・在庫管理", "店長業務"],
  skills: [
    "接客・オーダー対応",
    "仕込み",
    "調理",
    "盛り付け",
    "衛生管理",
    "在庫・発注管理",
    "新人教育",
    "売上管理",
  ],
};

/** Returns the tag set to render for a given business_format, or null for freeform text. */
export function tagsForBusinessFormat(businessFormat: string | null): TagSet | null {
  const granularity = granularityFor(businessFormat);
  if (granularity === "freeform") return null;
  if (granularity === "detailed" && businessFormat && DETAILED_TAGS[businessFormat]) {
    return DETAILED_TAGS[businessFormat];
  }
  return SIMPLE_TAGS;
}

// Fallback text for the PDF templates (which only know how to render main_duties/
// achievements prose) when a user picked tags instead of writing free text.
export function synthesizeDutiesText(stationTags: string[]): string | null {
  if (stationTags.length === 0) return null;
  return `持ち場：${stationTags.join("、")}`;
}

export function synthesizeAchievementsText(skillTags: string[]): string | null {
  if (skillTags.length === 0) return null;
  return `習得技術：${skillTags.join("、")}`;
}
