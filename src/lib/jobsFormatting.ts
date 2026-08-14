// Client-safe display shape/formatting shared by JobTeaser and /jobs — deliberately
// separate from src/lib/jobsService.ts (which is "server-only" and can't be imported from
// client components at all, even for its types, without extra type-only import care).
export type JobPostingView = {
  id: string;
  storeName: string;
  storeNameRevealed: boolean;
  isMichelin: boolean;
  area: string | null;
  businessFormat: string | null;
  role: string | null;
  annualIncomeMin: number | null;
  annualIncomeMax: number | null;
  summary: string;
  isConfidential: boolean;
  interviewRequested?: boolean;
};

export function incomeLabel(min: number | null, max: number | null): string | null {
  if (!min && !max) return null;
  const fmt = (n: number) => `${Math.round(n / 10000)}万円`;
  if (min && max) return `年収 ${fmt(min)}〜${fmt(max)}`;
  if (min) return `年収 ${fmt(min)}〜`;
  return `〜年収 ${fmt(max as number)}`;
}
