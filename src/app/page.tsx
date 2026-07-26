import Link from "next/link";
import Image from "next/image";
import { Sunburst } from "@/components/Sunburst";
import { DEFAULT_FAMILY_COLOR } from "@/lib/family-colors";

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

// Three per family (mixed genders) for a marquee that shows real variety without shipping
// all 128 portraits on the top page.
const MARQUEE_CHARACTERS = [
  "T01-f", "T03-m", "T05-f",
  "T09-m", "T11-f", "T14-m",
  "T17-f", "T19-m", "T23-f",
  "T25-m", "T27-f", "T31-m",
  "T33-f", "T35-m", "T37-f",
  "T41-m", "T43-f", "T47-m",
  "T49-f", "T51-m", "T55-f",
  "T57-m", "T59-f", "T63-m",
];
// Duplicated so the CSS animation can loop seamlessly at exactly -50%.
const MARQUEE_TRACK = [...MARQUEE_CHARACTERS, ...MARQUEE_CHARACTERS];

const colors = DEFAULT_FAMILY_COLOR;

export default function Home() {
  return (
    <div className="relative flex flex-1 flex-col overflow-hidden">
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center gap-8 px-6 py-8 text-center sm:py-12">
        {/* Hero banner - same dramatic "reveal" energy as the result screen: rich gradient,
            rotating sunburst, sparkles - matching the character art's own warrior-like flair. */}
        <div
          className="animate-pop-in relative -mx-6 w-[calc(100%+3rem)] overflow-hidden rounded-b-[2.5rem] px-6 py-10 sm:mx-0 sm:w-full sm:rounded-[2.5rem]"
          style={{
            background: `radial-gradient(circle at 50% 15%, ${colors.glow}66, transparent 55%), linear-gradient(160deg, ${colors.heroFrom}, ${colors.heroTo})`,
          }}
        >
          <Sunburst
            glowColor={colors.glow}
            className="top-0 left-1/2 h-96 w-96 -translate-x-1/2 opacity-30"
          />

          <div className="relative flex flex-col items-center gap-6">
            <span className="rounded-full bg-white/90 px-4 py-1 text-sm font-bold text-brand-dark shadow backdrop-blur">
              飲食業界特化のキャラ診断
            </span>

            <div
              className="relative w-full overflow-hidden py-2"
              style={{
                maskImage:
                  "linear-gradient(to right, transparent, black 12%, black 88%, transparent)",
                WebkitMaskImage:
                  "linear-gradient(to right, transparent, black 12%, black 88%, transparent)",
              }}
            >
              <div className="animate-marquee flex w-max items-center gap-3">
                {MARQUEE_TRACK.map((code, i) => (
                  <div
                    key={`${code}-${i}`}
                    className="h-16 w-16 shrink-0 overflow-hidden rounded-full border-4 border-white bg-white shadow-lg sm:h-20 sm:w-20"
                  >
                    <Image
                      src={`/characters/${code}.webp`}
                      alt=""
                      width={80}
                      height={80}
                      className="h-full w-full object-cover"
                      priority={i < 6}
                    />
                  </div>
                ))}
              </div>
              <span className="animate-sparkle absolute -top-2 right-2 text-2xl drop-shadow">
                ✨
              </span>
              <span
                className="animate-sparkle absolute -bottom-1 left-2 text-xl drop-shadow"
                style={{ animationDelay: "0.5s" }}
              >
                ⭐
              </span>
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
