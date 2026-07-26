import "server-only";
import { ResumeError } from "./service";

export type ResumeGenerationInput = {
  targetJob: string | null;
  diagnosis: {
    strengths: string[];
    personalityAnalysis: string | null;
    abilityAnalysis: string | null;
    careerPath: string | null;
    suitedJobs: string[];
  } | null;
  workExperiences: {
    companyName: string;
    jobType: string | null;
    position: string | null;
    mainDuties: string | null;
    achievements: string | null;
  }[];
};

export type ResumeDraft = {
  workSummary: string;
  selfPr: string;
  strengthsText: string;
  motivation: string;
  careerDirection: string;
};

const SYSTEM_PROMPT = `あなたは飲食業界に詳しいプロのキャリアアドバイザーです。ユーザーの職歴データと性格・能力診断の結果をもとに、履歴書・職務経歴書に使う文章を日本語で作成します。

厳守するルール:
- 職歴データに書かれていない実績や経験を勝手に作らない。
- 診断結果は断定しすぎず、あくまで傾向として自然な文章に変換する。
- 「あなたは〇〇タイプです」のような診断タイプ名を、文章に直接含めない。
- 職歴が一件もない場合は、診断結果の強みを中心に、意欲や適性を伝える汎用的な文章にする。
- 志望する職種が指定されていない場合、motivationは特定の会社名や店名を使わない汎用的な内容にする。
- 出力は必ず日本語、かつ指定されたJSON形式のみで返す。前後に説明文を付けない。`;

function buildUserPrompt(input: ResumeGenerationInput): string {
  const lines: string[] = [];

  if (input.diagnosis) {
    lines.push("## 診断結果（性格・能力の傾向。参考情報として利用し、断定的に書かない）");
    if (input.diagnosis.strengths.length > 0) {
      lines.push(`強み: ${input.diagnosis.strengths.join("、")}`);
    }
    if (input.diagnosis.personalityAnalysis) {
      lines.push(`性格の傾向: ${input.diagnosis.personalityAnalysis}`);
    }
    if (input.diagnosis.abilityAnalysis) {
      lines.push(`能力の傾向: ${input.diagnosis.abilityAnalysis}`);
    }
    if (input.diagnosis.careerPath) {
      lines.push(`キャリアの方向性の参考: ${input.diagnosis.careerPath}`);
    }
    if (input.diagnosis.suitedJobs.length > 0) {
      lines.push(`向いている職種の傾向: ${input.diagnosis.suitedJobs.join("、")}`);
    }
  } else {
    lines.push("## 診断結果: なし（職歴データのみで作成する）");
  }

  lines.push("");
  lines.push("## 職歴データ");
  if (input.workExperiences.length === 0) {
    lines.push("職歴の登録なし。");
  } else {
    for (const [i, w] of input.workExperiences.entries()) {
      lines.push(
        `${i + 1}件目: ${w.companyName} / 職種: ${w.jobType ?? "未記入"} / 役職: ${
          w.position ?? "未記入"
        } / 主な業務: ${w.mainDuties ?? "未記入"} / 実績: ${w.achievements ?? "未記入"}`
      );
    }
  }

  lines.push("");
  lines.push(`## 志望職種\n${input.targetJob ?? "未指定（汎用的な内容にする）"}`);

  lines.push("");
  lines.push(`以下のJSON形式で出力してください。各値は日本語の文章（改行なし、200〜400文字程度）です。
{
  "workSummary": "職務要約。これまでの経歴を簡潔にまとめる。",
  "selfPr": "自己PR。強みと具体的なエピソードを結びつけて書く。",
  "strengthsText": "強みの説明。診断結果の強みをビジネス文章に変換する。",
  "motivation": "志望動機。志望職種が未指定なら飲食業界で活躍したい意欲を伝える汎用文にする。",
  "careerDirection": "今後のキャリアの方向性。"
}`);

  return lines.join("\n");
}

export async function generateResumeDraft(input: ResumeGenerationInput): Promise<ResumeDraft> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new ResumeError("OPENAI_API_KEY is not configured", 500);

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      temperature: 0.7,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: buildUserPrompt(input) },
      ],
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new ResumeError(`AI生成に失敗しました: ${res.status} ${text}`, 502);
  }

  const json = await res.json();
  const content = json?.choices?.[0]?.message?.content;
  if (!content || typeof content !== "string") {
    throw new ResumeError("AI生成の結果が空でした", 502);
  }

  let parsed: Partial<ResumeDraft>;
  try {
    parsed = JSON.parse(content);
  } catch {
    throw new ResumeError("AI生成の結果を解析できませんでした", 502);
  }

  return {
    workSummary: parsed.workSummary ?? "",
    selfPr: parsed.selfPr ?? "",
    strengthsText: parsed.strengthsText ?? "",
    motivation: parsed.motivation ?? "",
    careerDirection: parsed.careerDirection ?? "",
  };
}
