// Option lists for the 5-item career preferences form shown right after signup (②③).
// Shared between the form UI and any future admin/matching screens, same pattern as axes.ts.
import type { CareerTiming } from "@/lib/supabase/rows";

export const TIMING_OPTIONS: { value: CareerTiming; label: string }[] = [
  { value: "immediately", label: "今すぐ" },
  { value: "within_3_months", label: "3ヶ月以内" },
  { value: "within_6_months", label: "半年以内" },
  // Keeps currently-not-looking craftspeople registering instead of bouncing at a forced
  // "今すぐ/3ヶ月/半年" choice — see product brief point ③.
  { value: "if_good_offer", label: "いい求人があれば" },
  { value: "not_yet", label: "今は考えていない" },
];

export const INCOME_OPTIONS = [
  "〜300万円",
  "300万円〜400万円",
  "400万円〜500万円",
  "500万円〜700万円",
  "700万円〜1000万円",
  "1000万円以上",
  "こだわらない",
];

export const AREA_OPTIONS = [
  "北海道",
  "東北",
  "東京都",
  "神奈川県",
  "埼玉県",
  "千葉県",
  "その他関東",
  "中部・東海",
  "近畿",
  "中国・四国",
  "九州・沖縄",
  "こだわらない",
];

export const FORMAT_OPTIONS = [
  "和食・寿司",
  "フレンチ・イタリアン",
  "中華",
  "焼肉・焼鳥",
  "居酒屋・ダイニング",
  "カフェ・喫茶",
  "ホテル・宴会",
  "その他",
  "こだわらない",
];

export const ROLE_OPTIONS = [
  "調理・キッチンスタッフ",
  "ホールスタッフ",
  "店長・店舗マネジメント",
  "料理長・シェフ",
  "エリアマネージャー・SV",
  "本部・管理部門",
  "独立・開業",
  "こだわらない",
];

export const CHANGE_REASON_OPTIONS = [
  "年収を上げたい",
  "労働時間・休日を改善したい",
  "人間関係を変えたい",
  "キャリアの伸びしろが欲しい",
  "通勤・勤務地を変えたい",
  "経営方針・将来性が不安",
  "スキルアップしたい",
  "その他",
];
