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

// One per family (mixed genders) flowing along the arc - fewer, bigger avatars read better
// on a curved path than a dense flat row does.
const ARC_CHARACTERS = [
  "T01-f", "T11-m", "T19-f", "T27-m", "T35-f", "T43-m", "T51-f", "T59-m",
];
const ARC_DURATION_S = 9;

export default function Home() {
  return (
    <div className="relative flex flex-1 flex-col overflow-hidden">
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center gap-8 px-6 py-8 text-center sm:py-12">
        {/* Hero banner - dramatic epic-reveal illustration matching the characters' own
            action-pose energy. */}
        <div className="animate-pop-in relative -mx-6 w-[calc(100%+3rem)] overflow-hidden rounded-b-[2.5rem] sm:mx-0 sm:w-full sm:rounded-[2.5rem]">
          <Image
            src="/images/hero-bg.webp"
            alt=""
            fill
            className="object-cover"
            priority
          />

          <div className="relative flex flex-col items-center gap-6 px-6 py-10">
            <span className="rounded-full bg-white/90 px-4 py-1 text-sm font-bold text-brand-dark shadow backdrop-blur">
              飲食業界特化のキャラ診断
            </span>

            <div className="relative h-56 w-full sm:h-64">
              {ARC_CHARACTERS.map((code, i) => (
                <div
                  key={code}
                  className="animate-arc-flow absolute top-0 left-0 h-24 w-24 overflow-hidden rounded-full border-4 border-white bg-white shadow-lg sm:h-28 sm:w-28"
                  style={{
                    transform: "translate(-50%, -50%)",
                    animationDuration: `${ARC_DURATION_S}s`,
                    animationDelay: `${-(i / ARC_CHARACTERS.length) * ARC_DURATION_S}s`,
                  }}
                >
                  <Image
                    src={`/characters/${code}.webp`}
                    alt=""
                    width={112}
                    height={112}
                    className="h-full w-full object-cover"
                    priority={i < 3}
                  />
                </div>
              ))}
              <span className="animate-sparkle absolute top-0 right-6 text-2xl drop-shadow">
                ✨
              </span>
              <span
                className="animate-sparkle absolute bottom-8 left-4 text-xl drop-shadow"
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
