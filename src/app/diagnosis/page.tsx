import { StartButton } from "./StartButton";

const STEPS = [
  { label: "20の飲食シーンを疑似体験", detail: "開店準備からピークタイム、クレーム対応、将来のキャリアまで。" },
  { label: "各シーンで2〜4問、直感で回答", detail: "正解・不正解はありません。1問5〜10秒が目安です。" },
  { label: "64タイプの中からあなたの結果が決まる", detail: "性格・能力・飲食業界への適性がまとめてわかります。" },
];

export default function DiagnosisIntroPage() {
  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center gap-10 px-6 py-16 text-center">
      <div className="space-y-3">
        <h1 className="text-2xl font-bold sm:text-3xl">診断をはじめる前に</h1>
        <p className="text-foreground/70">
          所要時間は約8〜10分。会員登録は不要です。
        </p>
      </div>

      <ol className="w-full space-y-4 text-left">
        {STEPS.map((step, i) => (
          <li
            key={step.label}
            className="flex gap-4 rounded-2xl border border-border bg-surface p-4"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-soft font-semibold text-brand-dark">
              {i + 1}
            </span>
            <div>
              <p className="font-medium">{step.label}</p>
              <p className="mt-1 text-sm text-foreground/60">{step.detail}</p>
            </div>
          </li>
        ))}
      </ol>

      <StartButton />
    </main>
  );
}
