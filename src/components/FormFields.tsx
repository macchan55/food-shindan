// Shared text/select/textarea field wrappers for the resume + preferences forms
// (profile/education/work/qualifications/self-pr, /register/preferences). These were
// independently redefined near-identically in each of those pages; consolidated here so
// the styling only has one place to change. `inputClassName` covers the one real visual
// difference between call sites — cards on a cream page background use a white
// (`bg-surface`) input, while forms already sitting inside a white card use `bg-background`
// (the page's cream tone) for contrast — everything else was accidental duplication.
"use client";

const BASE_LABEL = "block min-w-0 flex-1 text-sm font-bold text-foreground/70";
const BASE_INPUT =
  "block w-full min-w-0 max-w-full rounded-xl border border-border px-3 py-2 text-base font-normal outline-none focus:border-brand";

export function TextField({
  label,
  value,
  onChange,
  type = "text",
  required = false,
  placeholder,
  listId,
  inputClassName = "bg-background",
}: {
  label: string;
  value: string | null;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
  placeholder?: string;
  listId?: string;
  inputClassName?: string;
}) {
  return (
    <label className={BASE_LABEL}>
      <span className="mb-1 block">{label}</span>
      <input
        type={type}
        required={required}
        value={value ?? ""}
        placeholder={placeholder}
        list={listId}
        onChange={(e) => onChange(e.target.value)}
        className={`${BASE_INPUT} ${inputClassName}`}
      />
    </label>
  );
}

export type SelectOption = string | { value: string; label: string };

function normalizeOption(o: SelectOption): { value: string; label: string } {
  return typeof o === "string" ? { value: o, label: o } : o;
}

export function SelectField({
  label,
  value,
  options,
  onChange,
  required = false,
  // false for fields that always hold a real value (e.g. a status enum with a non-empty
  // default) — an empty option there would let the user select an invalid "" value.
  includeBlankOption = true,
  inputClassName = "bg-background",
}: {
  label: string;
  value: string;
  options: SelectOption[];
  onChange: (v: string) => void;
  required?: boolean;
  includeBlankOption?: boolean;
  inputClassName?: string;
}) {
  return (
    <label className={BASE_LABEL}>
      <span className="mb-1 block">{label}</span>
      <select
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`${BASE_INPUT} ${inputClassName}`}
      >
        {includeBlankOption && <option value="">選択してください</option>}
        {options.map(normalizeOption).map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function TextAreaField({
  label,
  value,
  onChange,
  rows = 3,
  placeholder,
  helperText,
  inputClassName = "bg-background",
}: {
  label: string;
  value: string | null;
  onChange: (v: string) => void;
  rows?: number;
  placeholder?: string;
  helperText?: string;
  inputClassName?: string;
}) {
  return (
    <label className="flex flex-col gap-1 text-sm font-bold text-foreground/70">
      {label}
      <textarea
        rows={rows}
        value={value ?? ""}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={`rounded-xl border border-border px-3 py-2 text-base font-normal leading-relaxed outline-none focus:border-brand ${inputClassName}`}
      />
      {helperText && <span className="text-xs font-normal text-foreground/50">{helperText}</span>}
    </label>
  );
}
