"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { ProgressBar } from "@/components/ProgressBar";
import { DiagnosisLoading } from "@/components/DiagnosisLoading";
import type { QuestionForClient } from "@/lib/diagnosis/repository";

function questionImagePath(questionCode: string): string {
  return `/questions/${questionCode}.webp`;
}

const CHOICE_LABELS = ["A", "B", "C", "D"];

export default function DiagnosisFlowPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const router = useRouter();

  const [questions, setQuestions] = useState<QuestionForClient[] | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const storageKey = `restaurant-dna:${sessionId}`;

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch(`/api/diagnosis/sessions/${sessionId}/questions`);
        if (!res.ok) throw new Error("質問の取得に失敗しました");
        const data = await res.json();
        if (cancelled) return;
        setQuestions(data.questions);

        const saved = localStorage.getItem(storageKey);
        if (saved) {
          const parsed = JSON.parse(saved);
          setAnswers(parsed.answers ?? {});
          setCurrentIndex(Math.min(parsed.currentIndex ?? 0, data.questions.length - 1));
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "エラーが発生しました");
      }
    }
    load();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  const question = questions?.[currentIndex];
  const totalScenes = useMemo(
    () => (questions ? new Set(questions.map((q) => q.sceneId)).size : 0),
    [questions]
  );

  function persist(nextAnswers: Record<string, string>, nextIndex: number) {
    localStorage.setItem(
      storageKey,
      JSON.stringify({ answers: nextAnswers, currentIndex: nextIndex })
    );
  }

  async function handleSelect(choiceId: string) {
    if (!question || submitting) return;
    setError(null);
    const nextAnswers = { ...answers, [question.id]: choiceId };
    setAnswers(nextAnswers);

    const isLast = questions && currentIndex === questions.length - 1;
    if (isLast) {
      persist(nextAnswers, currentIndex);
      setSubmitting(true);
      try {
        const res = await fetch(`/api/diagnosis/sessions/${sessionId}/complete`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            answers: Object.entries(nextAnswers).map(([questionId, choiceId]) => ({
              questionId,
              choiceId,
            })),
          }),
        });
        if (!res.ok) throw new Error("結果の計算に失敗しました");
        localStorage.removeItem(storageKey);
        router.push(`/diagnosis/${sessionId}/result`);
      } catch (e) {
        setSubmitting(false);
        setError(e instanceof Error ? e.message : "エラーが発生しました");
      }
    } else {
      // Answers are only buffered in localStorage while the quiz is in progress; all 64
      // are written to the DB in one batch on the /complete call above, instead of one
      // DB round trip per question (which made the quiz feel sluggish).
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      persist(nextAnswers, nextIndex);
    }
  }

  function handleBack() {
    if (currentIndex === 0) return;
    const nextIndex = currentIndex - 1;
    setCurrentIndex(nextIndex);
    persist(answers, nextIndex);
  }

  if (error && !questions) {
    return (
      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center gap-4 px-6 py-16 text-center">
        <p className="text-red-600">{error}</p>
      </main>
    );
  }

  if (!questions || !question) {
    return (
      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center px-6 py-16 text-center text-foreground/60">
        読み込み中…
      </main>
    );
  }

  if (submitting) {
    return <DiagnosisLoading />;
  }

  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-6 px-6 py-10">
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm text-foreground/60">
          <span>
            Scene {question.sceneId} / {totalScenes}
          </span>
          <span>
            質問 {currentIndex + 1} / {questions.length}
          </span>
        </div>
        <ProgressBar current={currentIndex + 1} total={questions.length} />
      </div>

      <div className="overflow-hidden rounded-3xl border border-border bg-brand-soft/60 shadow-sm">
        <div className="relative aspect-[3/2] w-full">
          <Image
            key={question.id}
            src={questionImagePath(question.questionCode)}
            alt={question.sceneTitle}
            fill
            className="object-cover"
            priority={currentIndex === 0}
          />
        </div>
        <div className="px-4 py-3">
          <p className="text-xs font-bold uppercase tracking-wide text-brand-dark">
            {question.sceneTitle}
          </p>
          {question.visualBrief && (
            <p className="mt-1 text-sm italic text-foreground/60">{question.visualBrief}</p>
          )}
        </div>
      </div>

      <h1 className="text-xl font-bold leading-relaxed">{question.text}</h1>

      <div className="flex flex-col gap-3">
        {question.choices.map((choice, i) => {
          const selected = answers[question.id] === choice.id;
          return (
            <button
              key={choice.id}
              onClick={() => handleSelect(choice.id)}
              className={`flex items-start gap-3 rounded-3xl border-2 p-4 text-left transition-all ${
                selected
                  ? "border-brand bg-brand-soft shadow-md"
                  : "border-border bg-surface hover:border-brand/60 hover:shadow-sm"
              }`}
            >
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-bold transition-colors ${
                  selected ? "bg-brand text-white" : "bg-brand-soft text-brand-dark"
                }`}
              >
                {CHOICE_LABELS[i]}
              </span>
              <span className="pt-0.5 font-medium">{choice.text}</span>
            </button>
          );
        })}
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {currentIndex > 0 && (
        <button
          onClick={handleBack}
          className="self-start text-sm text-foreground/50 underline underline-offset-4"
        >
          前の質問に戻る
        </button>
      )}
    </main>
  );
}
