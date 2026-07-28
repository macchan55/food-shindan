"use client";

import { useState } from "react";

// Native <input type="date"> renders inconsistently on iOS Safari (the native picker
// widget doesn't reliably shrink to its box, overflowing narrow layouts) even though these
// fields only ever need year+month precision for a resume. Two plain <select> elements
// avoid the native date widget entirely and render predictably at any width.
//
// Year and month are tracked as local state, initialized once from `value`, so a year
// picked before its month isn't discarded: a fully-controlled version that only ever
// reflects the combined "YYYY-MM-01" string has nowhere to hold a year by itself, since the
// parent's value stays "" until both parts are chosen. When the parent needs to reset this
// field (e.g. after the form is submitted), pass a new `key` from the caller to remount it
// rather than syncing local state from a changing `value` prop via an effect.
export function YearMonthField({
  label,
  value,
  onChange,
  yearFrom,
  yearTo,
}: {
  label: string;
  value: string; // "" | "YYYY-MM-DD"
  onChange: (value: string) => void;
  yearFrom: number;
  yearTo: number;
}) {
  const [year, setYear] = useState(() => (value ? value.split("-")[0] : ""));
  const [month, setMonth] = useState(() => (value ? value.split("-")[1] : ""));

  const years: number[] = [];
  for (let y = yearTo; y >= yearFrom; y--) years.push(y);

  function handleYear(nextYear: string) {
    setYear(nextYear);
    onChange(nextYear && month ? `${nextYear}-${month}-01` : "");
  }

  function handleMonth(nextMonth: string) {
    setMonth(nextMonth);
    onChange(year && nextMonth ? `${year}-${nextMonth}-01` : "");
  }

  return (
    <label className="block min-w-0 flex-1 text-sm font-bold text-foreground/70">
      <span className="mb-1 block">{label}</span>
      <div className="flex gap-2">
        <select
          value={year}
          onChange={(e) => handleYear(e.target.value)}
          className="w-1/2 min-w-0 rounded-xl border border-border bg-background px-2 py-2 text-base font-normal outline-none focus:border-brand"
        >
          <option value="">年</option>
          {years.map((y) => (
            <option key={y} value={String(y)}>
              {y}年
            </option>
          ))}
        </select>
        <select
          value={month}
          onChange={(e) => handleMonth(e.target.value)}
          className="w-1/2 min-w-0 rounded-xl border border-border bg-background px-2 py-2 text-base font-normal outline-none focus:border-brand"
        >
          <option value="">月</option>
          {Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0")).map((m) => (
            <option key={m} value={m}>
              {Number(m)}月
            </option>
          ))}
        </select>
      </div>
    </label>
  );
}
