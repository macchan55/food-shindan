export function ProgressBar({ current, total }: { current: number; total: number }) {
  const pct = total > 0 ? Math.round((current / total) * 100) : 0;
  return (
    <div className="w-full">
      <div className="h-2 w-full overflow-hidden rounded-full bg-brand-soft">
        <div
          className="h-full rounded-full bg-brand transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
