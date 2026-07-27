"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

const MESSAGES = [
  "回答を読み解いています…",
  "性格・能力の傾向を分析しています…",
  "相性の良い業態・職種を照合しています…",
  "あなたの強みを言語化しています…",
  "診断結果をまとめています…",
];

// A fixed pool of type codes used only to animate a "narrowing down" portrait shuffle
// while the real result is computed server-side — has no relation to the actual type.
const SHUFFLE_CODES = [
  "T05",
  "T14",
  "T22",
  "T31",
  "T38",
  "T44",
  "T51",
  "T09",
  "T27",
  "T60",
  "T17",
  "T35",
];

export function DiagnosisLoading() {
  const [frame, setFrame] = useState(0);
  const [messageIndex, setMessageIndex] = useState(0);
  const [progress, setProgress] = useState(6);

  useEffect(() => {
    const shuffleTimer = setInterval(() => {
      setFrame((f) => f + 1);
    }, 220);
    const messageTimer = setInterval(() => {
      setMessageIndex((i) => (i + 1) % MESSAGES.length);
    }, 1700);
    const progressTimer = setInterval(() => {
      setProgress((p) => (p < 92 ? Math.min(92, p + Math.max(1, (92 - p) * 0.08)) : p));
    }, 260);
    return () => {
      clearInterval(shuffleTimer);
      clearInterval(messageTimer);
      clearInterval(progressTimer);
    };
  }, []);

  const code = SHUFFLE_CODES[frame % SHUFFLE_CODES.length];

  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center gap-7 px-6 py-16 text-center">
      <div className="relative flex h-40 w-40 items-center justify-center">
        <div
          className="absolute inset-0 rounded-full border-4 border-brand-soft border-t-brand"
          style={{ animation: "spin 1.4s linear infinite" }}
        />
        <div className="absolute inset-3 overflow-hidden rounded-full border-2 border-brand-soft bg-brand-soft/40">
          <Image key={code} src={`/characters/${code}.webp`} alt="" fill className="object-cover" />
        </div>
        <span className="absolute -right-1 -top-1 animate-pulse text-xl">✨</span>
        <span
          className="absolute -bottom-1 -left-1 animate-pulse text-lg"
          style={{ animationDelay: "0.4s" }}
        >
          ✨
        </span>
        <span
          className="absolute -left-2 top-3 animate-pulse text-sm"
          style={{ animationDelay: "0.8s" }}
        >
          ✨
        </span>
      </div>

      <div className="space-y-2">
        <p className="text-xl font-bold text-brand-dark">診断鑑定中・・・</p>
        <p className="text-sm text-foreground/60">{MESSAGES[messageIndex]}</p>
      </div>

      <div className="h-2 w-full max-w-xs overflow-hidden rounded-full bg-brand-soft">
        <div
          className="h-full rounded-full bg-brand transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </main>
  );
}
