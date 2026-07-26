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

// A mix of families and genders for visual variety in the hero cluster.
const HERO_CHARACTERS = [
  { code: "T13-f", rotate: "-rotate-6", size: "h-20 w-20 sm:h-24 sm:w-24", offset: "translate-y-2" },
  { code: "T59-m", rotate: "rotate-3", size: "h-24 w-24 sm:h-28 sm:w-28", offset: "-translate-y-2" },
  { code: "T01-f", rotate: "-rotate-2", size: "h-28 w-28 sm:h-32 sm:w-32", offset: "translate-y-0" },
  { code: "T51-m", rotate: "rotate-6", size: "h-24 w-24 sm:h-28 sm:w-28", offset: "-translate-y-3" },
  { code: "T33-f", rotate: "rotate-2", size: "h-20 w-20 sm:h-24 sm:w-24", offset: "translate-y-3" },
];

export default function Home() {
  return (
    <div className="relative flex flex-1 flex-col overflow-hidden">
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center gap-8 px-6 py-8 text-center sm:py-12">
        {/* Hero banner - vivid restaurant-themed illustrated background */}
        <div className="relative -mx-6 w-[calc(100%+3rem)] overflow-hidden rounded-b-[2.5rem] sm:mx-0 sm:w-full sm:rounded-[2.5rem]">
          <div className="relative aspect-[3/4] w-full sm:aspect-[3/2]">
            <Image
              src="/images/hero-bg.webp"
              alt=""
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 px-6 py-10 text-center">
              <span className="rounded-full bg-white/90 px-4 py-1 text-sm font-bold text-brand-dark shadow backdrop-blur">
                飲食業界特化のキャラ診断
              </span>

              <div className="flex items-end justify-center gap-1 sm:gap-2">
                {HERO_CHARACTERS.map((c) => (
                  <div
                    key={c.code}
                    className={`${c.size} ${c.rotate} ${c.offset} shrink-0 overflow-hidden rounded-full border-4 border-white bg-white shadow-lg transition-transform hover:scale-105 hover:rotate-0`}
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

              <div className="space-y-2">
                <h1 className="text-4xl font-extrabold tracking-tight text-white drop-shadow-md sm:text-5xl">
                  Restaurant DNA
                </h1>
                <p className="text-lg leading-relaxed font-bold text-white drop-shadow">
                  あなたは、64タイプの中の誰？
                </p>
              </div>
            </div>
          </div>
        </div>

        <p className="-mt-2 text-lg leading-relaxed font-medium text-foreground/80">
          飲食業界で働く人・働きたい人のための
          <br className="hidden sm:inline" />
          エンタメ型キャラ診断。
        </p>

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
