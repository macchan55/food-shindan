"use client";

import { useState } from "react";

export function RankingList({
  title,
  items,
}: {
  title: string;
  items: { id: string; name: string; matchScore: number }[];
}) {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? items : items.slice(0, 3);
  const hasMore = items.length > 3;

  return (
    <div>
      <h3 className="mb-2 text-sm font-bold text-foreground/70">{title}</h3>
      <ol className="flex flex-col gap-2">
        {visible.map((item, i) => (
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
      {hasMore && (
        <button
          onClick={() => setExpanded((v) => !v)}
          className="mt-2 text-xs font-bold text-brand-dark underline underline-offset-2"
        >
          {expanded ? "閉じる" : `詳細を見る（${items.length}位まで）`}
        </button>
      )}
    </div>
  );
}
