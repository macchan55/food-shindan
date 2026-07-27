import type { ReactElement } from "react";
import type { RirekishoTemplateId } from "@/lib/resume/pdf/types";

// Small decorative mockups evoking each PDF template's actual layout (see
// src/lib/resume/pdf/rirekisho/*Template.tsx) — plain divs standing in for text/photo/
// table, not a real render, so the dashboard hero can showcase the three designs without
// depending on the user having entered any data yet.

function TraditionalMock() {
  return (
    <div className="flex h-full w-full flex-col gap-1 bg-white p-2">
      <p className="text-center text-[7px] font-bold tracking-wide text-neutral-800">履 歴 書</p>
      <div className="flex items-start justify-between gap-1">
        <div className="flex flex-1 flex-col gap-0.5 pt-0.5">
          <div className="h-1 w-8 rounded-sm bg-neutral-300" />
          <div className="h-1.5 w-10 rounded-sm bg-neutral-700" />
        </div>
        <div className="h-5 w-4 shrink-0 border border-neutral-300" />
      </div>
      <div className="mt-0.5 flex flex-col border border-neutral-400">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="flex border-b border-neutral-300 last:border-b-0">
            <div className="h-1.5 w-2.5 border-r border-neutral-300" />
            <div className="h-1.5 flex-1" />
          </div>
        ))}
      </div>
      <div className="mt-0.5 flex flex-1 gap-1">
        <div className="flex-1 rounded-[1px] border border-neutral-300" />
        <div className="flex-1 rounded-[1px] border border-neutral-300" />
      </div>
    </div>
  );
}

function ModernMock() {
  return (
    <div className="flex h-full w-full flex-col gap-1.5 bg-white p-2">
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-0.5 pt-0.5">
          <div className="h-1 w-6 rounded-sm bg-neutral-300" />
          <div className="h-1.5 w-11 rounded-sm bg-neutral-800" />
        </div>
        <div className="h-4 w-3.5 shrink-0 rounded-sm bg-neutral-100" />
      </div>
      {[0, 1, 2].map((i) => (
        <div key={i} className="flex flex-col gap-0.5">
          <div className="flex items-center gap-1">
            <div className="h-2 w-0.5 bg-neutral-800" />
            <div className="h-1 w-6 rounded-sm bg-neutral-400" />
          </div>
          <div className="ml-1.5 h-1 w-11 rounded-sm bg-neutral-200" />
        </div>
      ))}
    </div>
  );
}

function SidebarMock() {
  return (
    <div className="flex h-full w-full bg-white">
      <div className="flex w-[34%] flex-col items-center gap-1 bg-[#3a2c33] px-1 py-2">
        <div className="h-4 w-4 rounded-full border border-white/70 bg-white/10" />
        <div className="h-1 w-5 rounded-sm bg-white/70" />
        <div className="mt-1 h-0.5 w-4 rounded-sm bg-white/30" />
        <div className="h-0.5 w-4 rounded-sm bg-white/30" />
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-2">
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex flex-col gap-0.5">
            <div className="h-1 w-6 rounded-sm bg-brand" />
            <div className="h-1 w-10 rounded-sm bg-neutral-200" />
          </div>
        ))}
      </div>
    </div>
  );
}

const MOCKS: Record<RirekishoTemplateId, () => ReactElement> = {
  traditional: TraditionalMock,
  modern: ModernMock,
  sidebar: SidebarMock,
};

export function ResumeTemplateThumb({
  id,
  label,
}: {
  id: RirekishoTemplateId;
  label: string;
}) {
  const Mock = MOCKS[id];
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="h-28 w-20 overflow-hidden rounded-lg border border-border shadow-sm">
        <Mock />
      </div>
      <span className="text-[11px] font-bold text-foreground/60">{label}</span>
    </div>
  );
}
