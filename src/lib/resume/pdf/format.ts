export function formatYearMonth(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return `${d.getFullYear()}年${d.getMonth() + 1}月`;
}

export function splitYearMonth(iso: string | null): { year: string; month: string } {
  if (!iso) return { year: "", month: "" };
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return { year: "", month: "" };
  return { year: String(d.getFullYear()), month: String(d.getMonth() + 1) };
}

export function today(): string {
  const d = new Date();
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
}
