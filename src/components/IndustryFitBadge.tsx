const TIER_LABEL: Record<string, string> = { high: "高適性", mid: "中適性", low: "個性派適性" };
const TIER_TEXT: Record<string, string> = {
  high: "飲食業界で人を喜ばせることや、チームで成果を出すことに強いやりがいを感じやすいタイプです。",
  mid: "飲食業界でも活躍できますが、店舗や役割選びが重要です。自分の強みが活かせる環境を選ぶことで能力を発揮できます。",
  low: "接客や店舗運営よりも、商品開発、品質管理、食品製造、本部企画などの専門性を活かす役割の方が力を発揮しやすい可能性があります。",
};

export function IndustryFitBadge({ score, tier }: { score: number; tier: string }) {
  return (
    <div className="rounded-3xl border border-white/60 bg-white/80 p-4 text-left shadow-sm backdrop-blur">
      <div className="flex items-center justify-between">
        <span className="text-sm font-bold text-foreground/70">飲食業界適性</span>
        <span className="rounded-full bg-brand-soft px-3 py-1 text-sm font-bold text-brand-dark">
          {TIER_LABEL[tier] ?? tier}・{score}点
        </span>
      </div>
      <p className="mt-2 text-sm leading-relaxed text-foreground/70">
        {TIER_TEXT[tier] ?? ""}
      </p>
    </div>
  );
}
