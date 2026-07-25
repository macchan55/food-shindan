/**
 * End-to-end smoke test against a real Postgres database loaded with
 * supabase/migrations/0001_init.sql + supabase/seed.sql. Exercises the same flow
 * src/lib/diagnosis/service.ts drives (minus the PostgREST hop, which isn't available
 * in this sandbox) to prove the schema + scoring engine work together against real data.
 *
 * Usage: DATABASE_URL=postgres://app:app@localhost:5432/food_shindan_test npx tsx scripts/integration-test.ts
 */
import { Client } from "pg";
import { computeDiagnosisResult } from "../src/lib/scoring";
import type { AnswerInput, DiagnosisTypeRow, MasterRecord, QuestionWithChoices } from "../src/lib/scoring/types";
import { ALL_AXES, type AxisCode } from "../src/lib/axes";

async function main() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  try {
    // 1. Load active version + questions/choices/scores, exactly like repository.ts
    const { rows: versionRows } = await client.query(
      "select id from diagnosis_versions where is_active = true"
    );
    if (versionRows.length !== 1) throw new Error(`Expected 1 active version, got ${versionRows.length}`);
    const versionId = versionRows[0].id;

    const { rows: questionRows } = await client.query(
      "select id, question_code from questions where version_id = $1 order by display_order",
      [versionId]
    );
    if (questionRows.length !== 64) throw new Error(`Expected 64 questions, got ${questionRows.length}`);

    const { rows: choiceRows } = await client.query(
      "select id, question_id, choice_code from choices where question_id = any($1::uuid[])",
      [questionRows.map((q) => q.id)]
    );
    const { rows: scoreRows } = await client.query(
      "select choice_id, axis_code, score_value from choice_scores where choice_id = any($1::uuid[])",
      [choiceRows.map((c) => c.id)]
    );

    const scoresByChoice = new Map<string, { axis: string; value: number }[]>();
    for (const s of scoreRows) {
      const arr = scoresByChoice.get(s.choice_id) ?? [];
      arr.push({ axis: s.axis_code, value: s.score_value });
      scoresByChoice.set(s.choice_id, arr);
    }
    const choicesByQuestion = new Map<string, typeof choiceRows>();
    for (const c of choiceRows) {
      const arr = choicesByQuestion.get(c.question_id) ?? [];
      arr.push(c);
      choicesByQuestion.set(c.question_id, arr);
    }

    const scoringQuestions: QuestionWithChoices[] = questionRows.map((q) => ({
      id: q.id,
      choices: (choicesByQuestion.get(q.id) ?? []).map((c) => ({
        id: c.id,
        scores: (scoresByChoice.get(c.id) ?? []) as { axis: AxisCode; value: number }[],
      })),
    }));

    // 2. Create a session and answer every question with a fixed choice pattern (B, C, A repeating)
    const { rows: sessionRows } = await client.query(
      "insert into diagnosis_sessions (version_id) values ($1) returning id",
      [versionId]
    );
    const sessionId = sessionRows[0].id;
    console.log(`Created session ${sessionId}`);

    const pattern = ["B", "C", "A", "D"];
    const answers: AnswerInput[] = [];
    for (let i = 0; i < scoringQuestions.length; i++) {
      const q = scoringQuestions[i];
      const targetCode = pattern[i % pattern.length];
      const choiceRow = choicesByQuestion.get(q.id)!.find((c) => c.choice_code === targetCode)!;
      await client.query(
        "insert into diagnosis_answers (session_id, question_id, choice_id) values ($1, $2, $3) on conflict (session_id, question_id) do update set choice_id = excluded.choice_id",
        [sessionId, q.id, choiceRow.id]
      );
      answers.push({ questionId: q.id, choiceId: choiceRow.id });
    }
    console.log(`Inserted ${answers.length} answers`);

    // 3. Load types + master, run the real scoring engine
    const { rows: typeRows } = await client.query("select * from diagnosis_types");
    const types: DiagnosisTypeRow[] = typeRows as DiagnosisTypeRow[];
    const { rows: masterRows } = await client.query("select * from job_format_role_master");
    const master: MasterRecord[] = masterRows as MasterRecord[];

    const result = computeDiagnosisResult({ questions: scoringQuestions, answers, types, master });
    console.log(
      `Computed type=${result.primaryType.type_code} hidden=${result.hiddenType?.type_code ?? "-"} industryFit=${result.industryFit.score}`
    );

    // 4. Persist scores + result exactly like completeSession() does
    for (const axis of ALL_AXES) {
      await client.query(
        `insert into diagnosis_scores (session_id, axis_code, raw_score, max_score, normalized_score)
         values ($1, $2, $3, $4, $5)
         on conflict (session_id, axis_code) do update set raw_score = excluded.raw_score, max_score = excluded.max_score, normalized_score = excluded.normalized_score`,
        [sessionId, axis, result.rawScores[axis], result.maxScores[axis], result.normalizedScores[axis]]
      );
    }

    await client.query(
      `insert into diagnosis_results (session_id, type_id, hidden_type_id, meta_axes, industry_fit_score, industry_fit_tier, career_ranking, format_ranking, role_ranking)
       values ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       on conflict (session_id) do update set type_id = excluded.type_id`,
      [
        sessionId,
        result.primaryType.id,
        result.hiddenType?.id ?? null,
        JSON.stringify(result.metaAxes),
        result.industryFit.score,
        result.industryFit.tier,
        JSON.stringify(result.careerRanking),
        JSON.stringify(result.formatRanking),
        JSON.stringify(result.roleRanking),
      ]
    );

    await client.query(
      "update diagnosis_sessions set status = 'completed', completed_at = now() where id = $1",
      [sessionId]
    );
    console.log("Persisted diagnosis_scores + diagnosis_results, marked session completed");

    // 5. Read back, like GET /result would
    const { rows: readBack } = await client.query(
      `select r.industry_fit_score, r.industry_fit_tier, t.type_code, t.name, t.catchcopy,
              (select count(*) from diagnosis_scores where session_id = r.session_id) as score_count
       from diagnosis_results r join diagnosis_types t on t.id = r.type_id
       where r.session_id = $1`,
      [sessionId]
    );
    const row = readBack[0];
    console.log(
      `Read back: type=${row.type_code} (${row.name}) "${row.catchcopy}" industryFit=${row.industry_fit_score}(${row.industry_fit_tier}) scoreCount=${row.score_count}`
    );

    if (Number(row.score_count) !== ALL_AXES.length) {
      throw new Error(`Expected ${ALL_AXES.length} score rows, got ${row.score_count}`);
    }

    console.log("Integration test OK");
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
