"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { ProgressBar } from "@/components/ProgressBar";
import { DiagnosisLoading } from "@/components/DiagnosisLoading";
import type { QuestionForClient } from "@/lib/diagnosis/repository";

function questionImagePath(questionCode: string): string {
  return `/questions/${questionCode}.webp`;
}

const CHOICE_LABELS = ["A", "B", "C", "D"];

type Scene = {
  sceneId: number;
  sceneTitle: string;
  questions: QuestionForClient[];
};

function groupIntoScenes(questions: QuestionForClient[]): Scene[] {
  const scenes: Scene[] = [];
  for (const q of questions) {
    const last = scenes[scenes.length - 1];
    if (last && last.sceneId === q.sceneId) {
      last.questions.push(q);
    } else {
      scenes.push({ sceneId: q.sceneId, sceneTitle: q.sceneTitle, questions: [q] });
    }
  }
  return scenes;
}

function QuestionCard({
  question,
  index,
  selectedChoiceId,
  onSelect,
  priority,
  cardRef,
}: {
  question: QuestionForClient;
  index: number;
  selectedChoiceId: string | undefined;
  onSelect: (choiceId: string) => void;
  priority: boolean;
  cardRef: (el: HTMLDivElement | null) => void;
}) {
  return (
    <div ref={cardRef} className="flex scroll-mt-6 flex-col gap-4">
      {index > 0 && <div className="h-px w-full bg-border" />}
      <div className="overflow-hidden rounded-3xl border border-border bg-brand-soft/60 shadow-sm">
        <div className="relative aspect-[3/2] w-full">
          <Image
            src={questionImagePath(question.questionCode)}
            alt={question.sceneTitle}
            fill
            className="object-cover"
            priority={priority}
          />
        </div>
        {question.visualBrief && (
          <div className="px-4 py-3">
            <p className="text-sm italic text-foreground/60">{question.visualBrief}</p>
          </div>
        )}
      </div>

      <h2 className="text-xl font-bold leading-relaxed">{question.text}</h2>

      <div className="flex flex-col gap-2">
        {question.choices.map((choice, i) => {
          const selected = selectedChoiceId === choice.id;
          return (
            <button
              key={choice.id}
              onClick={() => onSelect(choice.id)}
              className={`flex items-start gap-3 rounded-3xl border-2 p-3 text-left transition-all ${
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
    </div>
  );
}

export default function DiagnosisFlowPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const router = useRouter();

  const [questions, setQuestions] = useState<QuestionForClient[] | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [sceneIndex, setSceneIndex] = useState(0);
  const [subIndex, setSubIndex] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Scene N's title-card interstitial (see below) has been dismissed for these scene
  // indices — cleared per page load, not persisted, so reloading mid-scene shows it again.
  const [dismissedIntros, setDismissedIntros] = useState<Set<number>>(new Set());

  const storageKey = `restaurant-dna:${sessionId}`;
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const scenes = useMemo(() => (questions ? groupIntoScenes(questions) : []), [questions]);
  const currentScene = scenes[sceneIndex];

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch(`/api/diagnosis/sessions/${sessionId}/questions`);
        if (!res.ok) throw new Error("質問の取得に失敗しました");
        const data = await res.json();
        if (cancelled) return;
        const loadedScenes = groupIntoScenes(data.questions as QuestionForClient[]);
        setQuestions(data.questions);

        const saved = localStorage.getItem(storageKey);
        if (saved) {
          const parsed = JSON.parse(saved);
          const savedAnswers = parsed.answers ?? {};
          setAnswers(savedAnswers);
          const restoredScene = Math.min(
            Math.max(parsed.sceneIndex ?? 0, 0),
            loadedScenes.length - 1
          );
          const sceneQuestionCount = loadedScenes[restoredScene]?.questions.length ?? 1;
          setSceneIndex(restoredScene);
          setSubIndex(Math.min(Math.max(parsed.subIndex ?? 0, 0), sceneQuestionCount - 1));
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

  // Auto-scroll to the newly revealed question within the current scene.
  useEffect(() => {
    const q = currentScene?.questions[subIndex];
    if (!q) return;
    cardRefs.current[q.id]?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [subIndex, currentScene]);

  // New scene = new "page": jump to the top instead of a long smooth scroll.
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [sceneIndex]);

  function persist(
    nextAnswers: Record<string, string>,
    nextSceneIndex: number,
    nextSubIndex: number
  ) {
    localStorage.setItem(
      storageKey,
      JSON.stringify({ answers: nextAnswers, sceneIndex: nextSceneIndex, subIndex: nextSubIndex })
    );
  }

  async function handleSelect(choiceId: string) {
    if (!currentScene || submitting) return;
    const question = currentScene.questions[subIndex];
    if (!question) return;
    setError(null);
    const nextAnswers = { ...answers, [question.id]: choiceId };
    setAnswers(nextAnswers);

    const isLastQuestionInScene = subIndex === currentScene.questions.length - 1;
    const isLastScene = sceneIndex === scenes.length - 1;

    if (isLastQuestionInScene && isLastScene) {
      persist(nextAnswers, sceneIndex, subIndex);
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
    } else if (isLastQuestionInScene) {
      // Answers are only buffered in localStorage while the quiz is in progress; all 64
      // are written to the DB in one batch on the /complete call above, instead of one
      // DB round trip per question (which made the quiz feel sluggish).
      const nextScene = sceneIndex + 1;
      setSceneIndex(nextScene);
      setSubIndex(0);
      persist(nextAnswers, nextScene, 0);
    } else {
      const nextSub = subIndex + 1;
      setSubIndex(nextSub);
      persist(nextAnswers, sceneIndex, nextSub);
    }
  }

  function handleBack() {
    if (subIndex > 0) {
      const prevSub = subIndex - 1;
      setSubIndex(prevSub);
      persist(answers, sceneIndex, prevSub);
    } else if (sceneIndex > 0) {
      const prevScene = sceneIndex - 1;
      const prevSub = scenes[prevScene].questions.length - 1;
      setSceneIndex(prevScene);
      setSubIndex(prevSub);
      persist(answers, prevScene, prevSub);
    }
  }

  if (error && !questions) {
    return (
      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center gap-4 px-6 py-16 text-center">
        <p className="text-red-600">{error}</p>
      </main>
    );
  }

  if (!questions || !currentScene) {
    return (
      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center px-6 py-16 text-center text-foreground/60">
        読み込み中…
      </main>
    );
  }

  if (submitting) {
    return <DiagnosisLoading />;
  }

  // A quiz that just chains 64 questions in one long scroll reads as monotonous — this
  // title card marks each new scene as its own "chapter" before revealing its questions,
  // shown only when arriving at a scene's first question (not on 前の質問に戻る into the
  // middle/end of a scene, and not again after it's been dismissed once this page load).
  if (subIndex === 0 && !dismissedIntros.has(sceneIndex)) {
    const firstQuestion = currentScene.questions[0];
    return (
      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center gap-6 px-6 py-10 text-center">
        <div key={sceneIndex} className="animate-pop-in flex w-full flex-col items-center gap-6">
          <span className="rounded-full bg-accent-soft px-4 py-1 text-sm font-bold text-brand-dark">
            Scene {currentScene.sceneId} / {scenes.length}
          </span>
          <div className="w-full overflow-hidden rounded-3xl border border-border bg-brand-soft/60 shadow-lg">
            <div className="relative aspect-[3/2] w-full">
              <Image
                src={questionImagePath(firstQuestion.questionCode)}
                alt={currentScene.sceneTitle}
                fill
                className="object-cover"
                priority={sceneIndex === 0}
              />
            </div>
          </div>
          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-brand-dark">{currentScene.sceneTitle}</h2>
            <p className="text-sm text-foreground/60">
              この場面は{currentScene.questions.length}問
            </p>
          </div>
          <button
            onClick={() => setDismissedIntros((prev) => new Set(prev).add(sceneIndex))}
            className="w-full rounded-full bg-brand px-6 py-3.5 text-center text-base font-bold text-white shadow-md transition-opacity hover:opacity-90 sm:w-auto sm:px-10"
          >
            このシーンをはじめる →
          </button>
          {(sceneIndex > 0 || subIndex > 0) && (
            <button
              onClick={handleBack}
              className="text-sm text-foreground/50 underline underline-offset-4"
            >
              前の質問に戻る
            </button>
          )}
        </div>
      </main>
    );
  }

  const totalAnswered = Object.keys(answers).length;
  const visibleQuestions = currentScene.questions.slice(0, subIndex + 1);

  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-6 px-6 py-10">
      <div key={sceneIndex} className="animate-pop-in space-y-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm text-foreground/60">
            <span>
              Scene {currentScene.sceneId} / {scenes.length}
            </span>
            <span>
              {totalAnswered} / {questions.length} 問回答済み
            </span>
          </div>
          <ProgressBar current={totalAnswered} total={questions.length} />
          <p className="text-xs font-bold uppercase tracking-wide text-brand-dark">
            {currentScene.sceneTitle}
          </p>
        </div>

        <div className="flex flex-col gap-8">
          {visibleQuestions.map((q, i) => (
            <QuestionCard
              key={q.id}
              question={q}
              index={i}
              selectedChoiceId={answers[q.id]}
              onSelect={handleSelect}
              priority={sceneIndex === 0 && i === 0}
              cardRef={(el) => {
                cardRefs.current[q.id] = el;
              }}
            />
          ))}
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        {(sceneIndex > 0 || subIndex > 0) && (
          <button
            onClick={handleBack}
            className="self-start text-sm text-foreground/50 underline underline-offset-4"
          >
            前の質問に戻る
          </button>
        )}
      </div>
    </main>
  );
}
