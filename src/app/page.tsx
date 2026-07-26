import Link from "next/link";
import Image from "next/image";

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

const HERO_CHARACTERS = [
  { code: "T13", rotate: "-rotate-6", size: "h-20 w-20 sm:h-24 sm:w-24", offset: "translate-y-2" },
  { code: "T59", rotate: "rotate-3", size: "h-24 w-24 sm:h-28 sm:w-28", offset: "-translate-y-2" },
  { code: "T01", rotate: "-rotate-2", size: "h-28 w-28 sm:h-32 sm:w-32", offset: "translate-y-0" },
  { code: "T51", rotate: "rotate-6", size: "h-24 w-24 sm:h-28 sm:w-28", offset: "-translate-y-3" },
  { code: "T33", rotate: "rotate-2", size: "h-20 w-20 sm:h-24 sm:w-24", offset: "translate-y-3" },
];

export default function Home() {
  return (
    <div className="relative flex flex-1 flex-col overflow-hidden">
      {/* Decorative background blobs */}
      <div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-brand-soft blur-3xl" />
      <div className="pointer-events-none absolute top-40 -right-24 h-72 w-72 rounded-full bg-accent-soft blur-3xl" />

      <main className="relative mx-auto flex w-full max-w-2xl flex-1 flex-col items-center gap-8 px-6 py-14 text-center sm:py-20">
        <span className="rounded-full bg-brand-soft px-4 py-1 text-sm font-bold text-brand-dark">
          飲食業界特化のキャラ診断
        </span>

        <div className="flex items-end justify-center gap-1 sm:gap-2">
          {HERO_CHARACTERS.map((c) => (
            <div
              key={c.code}
              className={`${c.size} ${c.rotate} ${c.offset} shrink-0 overflow-hidden rounded-full border-4 border-surface bg-brand-soft shadow-lg transition-transform hover:scale-105 hover:rotate-0`}
            >
              <Image
                src={`/characters/${c.code}.webp`}
                alt=""
                width={160}
                height={160}
                className="h-full w-full object-cover"
                priority
              />
            </div>
          ))}
        </div>

        <div className="space-y-3">
          <h1 className="text-4xl font-extrabold tracking-tight text-brand-dark sm:text-5xl">
            Restaurant DNA
          </h1>
          <p className="text-lg leading-relaxed font-medium text-foreground/80">
            あなたは、64タイプの中の誰？
            <br />
            飲食業界で働く人・働きたい人のための
            <br className="hidden sm:inline" />
            エンタメ型キャラ診断。
          </p>
        </div>

        <Link
          href="/diagnosis"
          className="inline-flex h-14 w-full max-w-xs items-center justify-center rounded-full bg-brand px-8 text-lg font-bold text-white shadow-lg shadow-brand/30 transition-transform hover:scale-[1.03] active:scale-95"
        >
          無料で診断をはじめる ✨
        </Link>
        <p className="-mt-4 text-sm font-medium text-foreground/60">
          登録不要・約8〜10分・64タイプ判定
        </p>

        <div className="grid w-full gap-4 pt-6 sm:grid-cols-3">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="rounded-3xl border border-border bg-surface p-5 text-left shadow-sm transition-transform hover:-translate-y-1"
            >
              <h2 className="font-bold text-brand-dark">{f.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-foreground/70">{f.body}</p>
            </div>
          ))}
        </div>
      </main>

      <footer className="relative border-t border-border px-6 py-6 text-center text-xs text-foreground/50">
        Restaurant DNA（開発版）
      </footer>
    </div>
  );
}
