/**
 * Sanity check for the scoring engine against the parsed seed data, without touching a DB.
 * Runs a few synthetic answer sets (all-A, all-B, all-C, all-D, and a random mix) through
 * the full pipeline and prints the resulting type + a few sanity assertions.
 */
import fs from "node:fs";
import path from "node:path";
import { computeDiagnosisResult } from "../src/lib/scoring";
import type {
  AnswerInput,
  DiagnosisTypeRow,
  MasterRecord,
  QuestionWithChoices,
} from "../src/lib/scoring/types";

type RawQuestion = {
  questionId: string;
  choices: { code: string; scores: { axis: string; value: number }[] }[];
};
type RawType = {
  typeId: string;
  name: string;
  tags: Record<"axis1" | "axis2" | "axis3" | "axis4" | "axis5" | "axis6", string>;
};

const questionsRaw: RawQuestion[] = JSON.parse(
  fs.readFileSync(path.join(__dirname, "seed-data", "questions.json"), "utf-8")
);
const typesRaw: RawType[] = JSON.parse(
  fs.readFileSync(path.join(__dirname, "seed-data", "types.json"), "utf-8")
);
const masterRaw = JSON.parse(
  fs.readFileSync(path.join(__dirname, "seed-data", "master.json"), "utf-8")
);

const questions: QuestionWithChoices[] = questionsRaw.map((q) => ({
  id: q.questionId,
  choices: q.choices.map((c) => ({
    id: `${q.questionId}-${c.code}`,
    scores: c.scores as { axis: QuestionWithChoices["choices"][number]["scores"][number]["axis"]; value: number }[],
  })),
}));

const types: DiagnosisTypeRow[] = typesRaw.map((t) => ({
  id: t.typeId,
  type_code: t.typeId,
  name: t.name,
  tag_axis1: t.tags.axis1,
  tag_axis2: t.tags.axis2,
  tag_axis3: t.tags.axis3,
  tag_axis4: t.tags.axis4,
  tag_axis5: t.tags.axis5,
  tag_axis6: t.tags.axis6,
}));

const master: MasterRecord[] = masterRaw;

function answersForCode(code: "A" | "B" | "C" | "D"): AnswerInput[] {
  return questions.map((q) => ({ questionId: q.id, choiceId: `${q.id}-${code}` }));
}

function randomAnswers(seed: number): AnswerInput[] {
  let s = seed;
  const rand = () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
  const codes = ["A", "B", "C", "D"] as const;
  return questions.map((q) => ({
    questionId: q.id,
    choiceId: `${q.id}-${codes[Math.floor(rand() * 4)]}`,
  }));
}

const cases: [string, AnswerInput[]][] = [
  ["all-A", answersForCode("A")],
  ["all-B", answersForCode("B")],
  ["all-C", answersForCode("C")],
  ["all-D", answersForCode("D")],
  ["random-1", randomAnswers(1)],
  ["random-2", randomAnswers(2)],
  ["random-3", randomAnswers(3)],
];

let allOk = true;

for (const [label, answers] of cases) {
  const result = computeDiagnosisResult({ questions, answers, types, master });
  const normSum = Object.values(result.normalizedScores).reduce((a, b) => a + b, 0);
  console.log(
    `[${label}] type=${result.primaryType.type_code} (${result.primaryType.name}) ` +
      `hidden=${result.hiddenType?.type_code ?? "-"} industryFit=${result.industryFit.score}(${
        result.industryFit.tier
      }) topJob=${result.careerRanking[0]?.name}(${result.careerRanking[0]?.matchScore}) normSum=${normSum}`
  );
  for (const axis of Object.keys(result.normalizedScores)) {
    const v = result.normalizedScores[axis as keyof typeof result.normalizedScores];
    if (v < 0 || v > 100) {
      console.error(`  !! axis ${axis} normalized out of range: ${v}`);
      allOk = false;
    }
  }
  if (result.careerRanking.length !== 5 || result.formatRanking.length !== 5 || result.roleRanking.length !== 5) {
    console.error("  !! ranking length mismatch");
    allOk = false;
  }
}

if (!allOk) {
  console.error("Scoring verification FAILED");
  process.exit(1);
}
console.log("Scoring verification OK");
