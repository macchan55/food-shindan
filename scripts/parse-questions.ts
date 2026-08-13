/**
 * Parse docs/spec/04-64-questions-scoring.md into structured JSON.
 * Source of truth for the 64 official diagnosis questions + choice scores.
 */
import fs from "node:fs";
import path from "node:path";

const SRC = path.join(__dirname, "..", "docs", "spec", "04-64-questions-scoring.md");
const OUT = path.join(__dirname, "seed-data", "questions.json");

const AXIS_CODES = [
  "HOS", "CRA", "TEA", "LEA", "BUS", "CRE", "GRO", "STA", "CHA", "OWN",
  "EMP", "RES", "DAT", "CUS",
];

type ChoiceScore = { axis: string; value: number };
type Choice = { code: "A" | "B" | "C" | "D"; text: string; scores: ChoiceScore[] };
type Question = {
  questionId: string; // Q01..Q64
  sceneId: number; // 1..20
  sceneTitle: string;
  visualBrief: string;
  displayOrder: number;
  text: string;
  choices: Choice[];
};

function parseScoreCell(cell: string): ChoiceScore[] {
  // e.g. "HOS +3 / CUS +1" -> [{axis:HOS,value:3},{axis:CUS,value:1}]
  return cell
    .split("/")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => {
      const m = s.match(/^([A-Z]{3})\s*\+(\d+)$/);
      if (!m) throw new Error(`Unparseable score cell part: "${s}" in "${cell}"`);
      const [, axis, value] = m;
      if (!AXIS_CODES.includes(axis)) {
        throw new Error(`Unknown axis code "${axis}" in "${cell}"`);
      }
      return { axis, value: Number(value) };
    });
}

// docs/spec/04-64-questions-scoring.md still lays scenes out as its original 20 (13-20
// with 2 questions each). Production was migrated to 16 scenes (supabase/migrations/
// 0009_merge_short_scenes.sql) because the 2-question scenes made the per-scene title-card
// interstitial fire too often. Re-applied here so re-running this parser doesn't regress
// scripts/seed-data/questions.json back to the original 20-scene grouping. Purely a
// scene_id/scene_title relabel of adjacent pairs — no question content changes.
const SCENE_MERGES: Record<string, { sceneId: number; sceneTitle: string }> = {
  Q49: { sceneId: 13, sceneTitle: "どこに賭ける？" },
  Q50: { sceneId: 13, sceneTitle: "どこに賭ける？" },
  Q51: { sceneId: 13, sceneTitle: "どこに賭ける？" },
  Q52: { sceneId: 13, sceneTitle: "どこに賭ける？" },
  Q53: { sceneId: 14, sceneTitle: "評価とプレッシャー、どう受け止める？" },
  Q54: { sceneId: 14, sceneTitle: "評価とプレッシャー、どう受け止める？" },
  Q55: { sceneId: 14, sceneTitle: "評価とプレッシャー、どう受け止める？" },
  Q56: { sceneId: 14, sceneTitle: "評価とプレッシャー、どう受け止める？" },
  Q57: { sceneId: 15, sceneTitle: "目指す景色はどっち？" },
  Q58: { sceneId: 15, sceneTitle: "目指す景色はどっち？" },
  Q59: { sceneId: 15, sceneTitle: "目指す景色はどっち？" },
  Q60: { sceneId: 15, sceneTitle: "目指す景色はどっち？" },
  Q61: { sceneId: 16, sceneTitle: "問題が起きたとき、どう動く？" },
  Q62: { sceneId: 16, sceneTitle: "問題が起きたとき、どう動く？" },
  Q63: { sceneId: 16, sceneTitle: "問題が起きたとき、どう動く？" },
  Q64: { sceneId: 16, sceneTitle: "問題が起きたとき、どう動く？" },
};

function applySceneMerges(questions: Question[]): void {
  for (const q of questions) {
    const override = SCENE_MERGES[q.questionId];
    if (override) {
      q.sceneId = override.sceneId;
      q.sceneTitle = override.sceneTitle;
    }
  }
}

function main() {
  const raw = fs.readFileSync(SRC, "utf-8");
  const lines = raw.split("\n");

  const questions: Question[] = [];
  let sceneId = 0;
  let sceneTitle = "";
  let visualBrief = "";
  let displayOrder = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    const sceneMatch = line.match(/^Scene (\d+)｜(.+)$/);
    if (sceneMatch) {
      sceneId = Number(sceneMatch[1]);
      sceneTitle = sceneMatch[2].trim();
      continue;
    }

    if (line.startsWith("ビジュアル指示：")) {
      visualBrief = line.replace("ビジュアル指示：", "").trim();
      continue;
    }

    const qMatch = line.match(/^Q(\d{2})$/);
    if (qMatch) {
      const questionId = `Q${qMatch[1]}`;
      const questionText = lines[i + 1].trim();
      // Expect table header 2 lines after, then 4 choice rows
      // lines[i+2] = "| 選択 | 回答文 | 加点 |"
      // lines[i+3] = "|---|---|---|"
      // lines[i+4..i+7] = choice rows
      const choices: Choice[] = [];
      for (let r = 0; r < 4; r++) {
        const rowLine = lines[i + 4 + r].trim();
        const cells = rowLine
          .split("|")
          .map((c) => c.trim())
          .filter((c) => c.length > 0);
        // cells = [code, text, scoreCell]
        const [code, text, scoreCell] = cells;
        if (!["A", "B", "C", "D"].includes(code)) {
          throw new Error(`Expected choice row at line ${i + 4 + r}, got: "${rowLine}"`);
        }
        choices.push({
          code: code as Choice["code"],
          text,
          scores: parseScoreCell(scoreCell),
        });
      }

      displayOrder += 1;
      questions.push({
        questionId,
        sceneId,
        sceneTitle,
        visualBrief,
        displayOrder,
        text: questionText,
        choices,
      });

      i += 7; // skip past the table we just consumed
    }
  }

  if (questions.length !== 64) {
    throw new Error(`Expected 64 questions, parsed ${questions.length}`);
  }

  applySceneMerges(questions);

  for (const q of questions) {
    if (q.choices.length !== 4) {
      throw new Error(`Question ${q.questionId} does not have 4 choices`);
    }
    for (const c of q.choices) {
      const total = c.scores.reduce((sum, s) => sum + s.value, 0);
      if (total !== 4) {
        throw new Error(
          `Question ${q.questionId} choice ${c.code} score total is ${total}, expected 4`
        );
      }
    }
  }

  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify(questions, null, 2));
  console.log(`Parsed ${questions.length} questions -> ${OUT}`);
}

main();
