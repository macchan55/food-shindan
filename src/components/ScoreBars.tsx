import { CORE_AXES, CORE_AXIS_SHORT_LABELS } from "@/lib/axes";

export function ScoreBars({ scores }: { scores: Record<string, { normalized: number }> }) {
  return (
    <div className="flex flex-col gap-3">
      {CORE_AXES.map((axis) => {
        const value = scores[axis]?.normalized ?? 0;
        return (
          <div key={axis} className="flex items-center gap-3">
            <span className="w-28 shrink-0 text-sm text-foreground/70">
              {CORE_AXIS_SHORT_LABELS[axis]}
            </span>
            <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-brand-soft">
              <div
                className="h-full rounded-full bg-brand"
                style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
              />
            </div>
            <span className="w-8 shrink-0 text-right text-sm tabular-nums text-foreground/60">
              {value}
            </span>
          </div>
        );
      })}
    </div>
  );
}
