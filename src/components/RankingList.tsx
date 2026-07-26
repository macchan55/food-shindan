export function RankingList({
  title,
  items,
}: {
  title: string;
  items: { id: string; name: string; matchScore: number }[];
}) {
  return (
    <div>
      <h3 className="mb-2 text-sm font-bold text-foreground/70">{title}</h3>
      <ol className="flex flex-col gap-2">
        {items.map((item, i) => (
          <li
            key={item.id}
            className="flex items-center justify-between rounded-2xl border border-border bg-background px-3 py-2"
          >
            <span className="flex items-center gap-2">
              <span className="text-xs font-bold text-brand-dark">{i + 1}位</span>
              <span className="font-medium">{item.name}</span>
            </span>
            <span className="text-xs text-foreground/50">適合度 {item.matchScore}%</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
