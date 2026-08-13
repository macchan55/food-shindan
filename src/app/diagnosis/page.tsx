import { StartButton } from "./StartButton";

const STEPS = [
  { label: "16の飲食シーンを疑似体験", detail: "開店準備からピークタイム、クレーム対応、将来のキャリアまで。" },
  { label: "各シーンで4問、直感で回答", detail: "正解・不正解はありません。1問5〜10秒が目安です。" },
  { label: "64タイプの中からあなたの結果が決まる", detail: "性格・能力・飲食業界への適性がまとめてわかります。" },
];

export default function DiagnosisIntroPage() {
  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center gap-8 px-6 py-14 text-center sm:py-20">
      <div className="space-y-3">
        <span className="rounded-full bg-accent-soft px-4 py-1 text-sm font-bold text-brand-dark">
          あと少しで診断スタート
        </span>
        <h1 className="text-2xl font-extrabold sm:text-3xl">診断をはじめる前に</h1>
        <p className="text-foreground/70">
          所要時間は約8〜10分。会員登録は不要です。
        </p>
      </div>

      <ol className="w-full space-y-4 text-left">
        {STEPS.map((step, i) => (
          <li
            key={step.label}
            className="flex gap-4 rounded-3xl border border-border bg-surface p-4 shadow-sm"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand text-white font-bold">
              {i + 1}
            </span>
            <div>
              <p className="font-bold">{step.label}</p>
              <p className="mt-1 text-sm text-foreground/60">{step.detail}</p>
            </div>
          </li>
        ))}
      </ol>

      <StartButton />
    </main>
  );
}
