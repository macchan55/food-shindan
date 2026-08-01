"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";

// Standalone comparison demo — not wired to real scoring/DB. Lets you flip between the
// current forced-choice format and a proposed 4-point Likert format for the same scene
// (Scene 1: 開店前、ちょっとザワつく店内), to judge reading time/answer speed side by side.

const SCENE_TITLE = "開店前、ちょっとザワつく店内";
const SCENE_BRIEF = "シャッター半開き。スタッフは小走り、店長は時計を二度見。";

const CURRENT_ITEMS = [
  {
    code: "Q01",
    text: "開店5分前。『あれ、まだ準備終わってない…！』という空気です。一番ソワソワするのは？",
    choices: [
      "お客様を気持ちよく迎えられるかな…",
      "バタついて料理や商品の質が落ちないかな…",
      "みんな焦って空気悪くならないかな…",
      "今日の営業、最初から流れ崩れないかな…",
    ],
  },
  {
    code: "Q02",
    text: "今日から新メニュー登場。ちょっとワクワク、ちょっと不安。最初に気になるのは？",
    choices: [
      "お客様に「それ気になる！」と思ってもらえるかな",
      "味や仕上がり、ちゃんとキマってるかな",
      "現場のみんながスムーズに出せるかな",
      "これ、ちゃんと売れるかな",
    ],
  },
  {
    code: "Q03",
    text: "開店前に3分だけ余裕ができました。さて、何する？",
    choices: [
      "客席や入口を見て「居心地」を整える",
      "自分の持ち場をもう一回細かくチェックする",
      "周りで困ってる人がいないか見る",
      "今日の営業の流れを頭の中でシミュレーションする",
    ],
  },
  {
    code: "Q04",
    text: "あなたにとって理想の開店前ってどんな状態？",
    choices: [
      "「ようこそ！」の空気が店にちゃんとある",
      "細かいところまで完璧に整ってる",
      "チーム全員のテンションがそろってる",
      "誰が何するか明確で、営業の勝ち筋が見えてる",
    ],
  },
];

const LIKERT_ITEMS = [
  { code: "Q01", axis: "ホスピタリティ", statement: "忙しくても、お客様を気持ちよく迎えることを一番に考えたい" },
  { code: "Q02", axis: "技術・品質", statement: "新しいことをする時は、味や仕上がりのクオリティが一番気になる" },
  { code: "Q03", axis: "協働・共感", statement: "少し余裕ができたら、周りに困っている人がいないか気にかける" },
  { code: "Q04", axis: "リーダーシップ", statement: "誰が何をするかが明確に整っている状態が理想だと感じる" },
];

const LIKERT_LABELS = ["すごくそう", "ややそう", "やや違う", "すごく違う"];

function imagePath(code: string) {
  return `/questions/${code}.webp`;
}

export default function DiagnosisSampleLikertPage() {
  const [mode, setMode] = useState<"current" | "likert">("likert");

  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-6 px-6 py-10">
      <div>
        <Link href="/diagnosis" className="text-sm text-foreground/60 underline">
          ← 診断トップに戻る
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-brand-dark">回答形式サンプル比較</h1>
        <p className="mt-1 text-sm text-foreground/60">
          本番の診断ロジックには影響しないデモです。Scene 1の内容で、現在の形式と4件法を見比べられます。
        </p>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => setMode("current")}
          className={`flex-1 rounded-full border px-4 py-2 text-sm font-bold transition-colors ${
            mode === "current"
              ? "border-brand bg-brand-soft text-brand-dark"
              : "border-border text-foreground/60 hover:border-brand/60"
          }`}
        >
          現在の形式
        </button>
        <button
          onClick={() => setMode("likert")}
          className={`flex-1 rounded-full border px-4 py-2 text-sm font-bold transition-colors ${
            mode === "likert"
              ? "border-brand bg-brand-soft text-brand-dark"
              : "border-border text-foreground/60 hover:border-brand/60"
          }`}
        >
          新しい形式（4件法）
        </button>
      </div>

      {mode === "current" ? <CurrentFormatDemo key="current" /> : <LikertFormatDemo key="likert" />}
    </main>
  );
}

function CurrentFormatDemo() {
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [subIndex, setSubIndex] = useState(0);
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    const item = CURRENT_ITEMS[subIndex];
    if (!item) return;
    cardRefs.current[item.code]?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [subIndex]);

  function select(code: string, choiceIndex: number) {
    setAnswers((a) => ({ ...a, [code]: choiceIndex }));
    if (subIndex < CURRENT_ITEMS.length - 1) {
      setSubIndex((i) => i + 1);
    }
  }

  const visible = CURRENT_ITEMS.slice(0, subIndex + 1);
  const done = Object.keys(answers).length === CURRENT_ITEMS.length;

  return (
    <div className="flex flex-col gap-8">
      <p className="text-xs font-bold uppercase tracking-wide text-brand-dark">{SCENE_TITLE}</p>
      {visible.map((item, i) => (
        <div key={item.code} ref={(el) => { cardRefs.current[item.code] = el; }} className="flex scroll-mt-6 flex-col gap-4">
          {i > 0 && <div className="h-px w-full bg-border" />}
          <div className="overflow-hidden rounded-3xl border border-border bg-brand-soft/60 shadow-sm">
            <div className="relative aspect-[3/2] w-full">
              <Image src={imagePath(item.code)} alt={SCENE_TITLE} fill className="object-cover" />
            </div>
            <div className="px-4 py-3">
              <p className="text-sm italic text-foreground/60">{SCENE_BRIEF}</p>
            </div>
          </div>
          <h2 className="text-xl font-bold leading-relaxed">{item.text}</h2>
          <div className="flex flex-col gap-3">
            {item.choices.map((choice, ci) => {
              const selected = answers[item.code] === ci;
              return (
                <button
                  key={ci}
                  onClick={() => select(item.code, ci)}
                  className={`flex items-start gap-3 rounded-3xl border-2 p-4 text-left transition-all ${
                    selected
                      ? "border-brand bg-brand-soft shadow-md"
                      : "border-border bg-surface hover:border-brand/60 hover:shadow-sm"
                  }`}
                >
                  <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                      selected ? "bg-brand text-white" : "bg-brand-soft text-brand-dark"
                    }`}
                  >
                    {["A", "B", "C", "D"][ci]}
                  </span>
                  <span className="pt-0.5 font-medium">{choice}</span>
                </button>
              );
            })}
          </div>
        </div>
      ))}
      {done && <DoneNote />}
    </div>
  );
}

function LikertFormatDemo() {
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [subIndex, setSubIndex] = useState(0);
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    const item = LIKERT_ITEMS[subIndex];
    if (!item) return;
    cardRefs.current[item.code]?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [subIndex]);

  function select(code: string, level: number) {
    setAnswers((a) => ({ ...a, [code]: level }));
    if (subIndex < LIKERT_ITEMS.length - 1) {
      setSubIndex((i) => i + 1);
    }
  }

  const visible = LIKERT_ITEMS.slice(0, subIndex + 1);
  const done = Object.keys(answers).length === LIKERT_ITEMS.length;

  return (
    <div className="flex flex-col gap-8">
      <div className="overflow-hidden rounded-3xl border border-border bg-brand-soft/60 shadow-sm">
        <div className="relative aspect-[3/2] w-full">
          <Image src={imagePath("Q01")} alt={SCENE_TITLE} fill className="object-cover" />
        </div>
        <div className="px-4 py-3">
          <p className="text-xs font-bold uppercase tracking-wide text-brand-dark">{SCENE_TITLE}</p>
          <p className="mt-1 text-sm italic text-foreground/60">{SCENE_BRIEF}</p>
        </div>
      </div>

      {visible.map((item, i) => {
        const selected = answers[item.code];
        return (
          <div key={item.code} ref={(el) => { cardRefs.current[item.code] = el; }} className="flex scroll-mt-6 flex-col gap-4">
            {i > 0 && <div className="h-px w-full bg-border" />}
            <h2 className="text-xl font-bold leading-relaxed">{item.statement}</h2>
            <div className="flex flex-col gap-2">
              {LIKERT_LABELS.map((label, li) => {
                const isSelected = selected === li;
                return (
                  <button
                    key={li}
                    onClick={() => select(item.code, li)}
                    className={`rounded-full border-2 px-5 py-3 text-center font-bold transition-all ${
                      isSelected
                        ? "border-brand bg-brand text-white shadow-md"
                        : "border-border bg-surface text-foreground hover:border-brand/60 hover:shadow-sm"
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
      {done && <DoneNote />}
    </div>
  );
}

function DoneNote() {
  return (
    <p className="rounded-2xl border border-border bg-surface p-4 text-center text-sm text-foreground/60">
      サンプルはここまでです（1シーン分）。実際の読みやすさ・回答スピードを比べてみてください。
    </p>
  );
}
