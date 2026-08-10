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

// All 64 types, alternating gendered art (the newer vivid-style portraits - the bare
// T##.webp files predate that art pass and read as flat/outdated next to these) for
// variety in the grid below. Has no relation to the actual diagnosed type.
const GRID_CODES = Array.from({ length: 64 }, (_, i) => {
  const code = `T${String(i + 1).padStart(2, "0")}`;
  return `${code}-${i % 2 === 0 ? "m" : "f"}`;
});

const PULSE_LIFETIME_MS = 650;
const PULSE_INTERVAL_MS = 130;

export function DiagnosisLoading() {
  const [pulses, setPulses] = useState<{ index: number; at: number }[]>([]);
  const [messageIndex, setMessageIndex] = useState(0);
  const [progress, setProgress] = useState(6);

  useEffect(() => {
    const pulseTimer = setInterval(() => {
      const now = Date.now();
      setPulses((prev) => [
        ...prev.filter((p) => now - p.at < PULSE_LIFETIME_MS),
        { index: Math.floor(Math.random() * GRID_CODES.length), at: now },
      ]);
    }, PULSE_INTERVAL_MS);
    const messageTimer = setInterval(() => {
      setMessageIndex((i) => (i + 1) % MESSAGES.length);
    }, 1700);
    const progressTimer = setInterval(() => {
      setProgress((p) => (p < 92 ? Math.min(92, p + Math.max(1, (92 - p) * 0.08)) : p));
    }, 260);
    return () => {
      clearInterval(pulseTimer);
      clearInterval(messageTimer);
      clearInterval(progressTimer);
    };
  }, []);

  const highlighted = new Set(pulses.map((p) => p.index));

  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center gap-6 px-6 py-16 text-center">
      <div className="space-y-2">
        <p className="text-xl font-bold text-brand-dark">
          診断鑑定中・・・ <span className="animate-pulse">✨</span>
        </p>
        <p className="text-sm text-foreground/60">{MESSAGES[messageIndex]}</p>
      </div>

      <div className="grid w-full max-w-sm grid-cols-8 gap-1.5 sm:gap-2">
        {GRID_CODES.map((code, i) => {
          const isHot = highlighted.has(i);
          return (
            <div
              key={code}
              className={`relative aspect-square overflow-hidden rounded-md transition-all duration-200 ease-out ${
                isHot
                  ? "z-10 scale-125 opacity-100 shadow-lg ring-2 ring-brand"
                  : "scale-100 opacity-60 ring-1 ring-border"
              }`}
            >
              <Image
                src={`/characters/${code}.webp`}
                alt=""
                fill
                sizes="40px"
                className="object-cover"
              />
            </div>
          );
        })}
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
