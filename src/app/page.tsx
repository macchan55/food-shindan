import Link from "next/link";

const FEATURES = [
  {
    title: "20の飲食あるあるシーン",
    body: "開店前のバタバタ、まさかのクレーム、常連さんとの一幕…現場で本当にありそうな場面に答えるだけ。",
  },
  {
    title: "64タイプで診断",
    body: "10の資質軸から、あなたの性格・能力・飲食業界への適性を分析。64タイプの中からあなたのタイプが決まります。",
  },
  {
    title: "転職しなくてもOK",
    body: "Restaurant DNAはまず診断コンテンツ。転職を考えていなくても、今の自分を知るために気軽に使えます。",
  },
];

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center gap-10 px-6 py-16 text-center sm:py-24">
        <span className="rounded-full bg-brand-soft px-4 py-1 text-sm font-medium text-brand-dark">
          飲食業界特化のキャリア診断
        </span>

        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Restaurant DNA</h1>
          <p className="text-lg leading-relaxed text-foreground/80">
            飲食業界で働く人・働きたい人のための、
            <br className="hidden sm:inline" />
            エンタメ型・適職診断。
          </p>
        </div>

        <Link
          href="/diagnosis"
          className="inline-flex h-14 w-full max-w-xs items-center justify-center rounded-full bg-brand px-8 text-lg font-semibold text-white shadow-lg shadow-brand/20 transition-transform hover:scale-[1.02] active:scale-95"
        >
          無料で診断をはじめる
        </Link>
        <p className="-mt-6 text-sm text-foreground/60">
          登録不要・約8〜10分・64タイプ判定
        </p>

        <div className="grid w-full gap-4 pt-8 sm:grid-cols-3">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="rounded-2xl border border-border bg-surface p-5 text-left shadow-sm"
            >
              <h2 className="font-semibold">{f.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-foreground/70">{f.body}</p>
            </div>
          ))}
        </div>
      </main>

      <footer className="border-t border-border px-6 py-6 text-center text-xs text-foreground/50">
        Restaurant DNA（開発版）
      </footer>
    </div>
  );
}
