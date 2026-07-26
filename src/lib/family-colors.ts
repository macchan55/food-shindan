// Per-family accent colors, matching the palettes used when generating the character
// portraits (scripts/art/generate-characters.mjs) - keeps the result screen's "reveal" tint
// consistent with the character art the user already approved.
export const FAMILY_COLORS: Record<string, { from: string; to: string; text: string }> = {
  "Hospitality Stars": { from: "#fff3e0", to: "#ffe3f0", text: "#a8752f" },
  "Community Hosts": { from: "#fff0da", to: "#ffe0d6", text: "#c15a2c" },
  "Luxury Leaders": { from: "#e9e6f7", to: "#f6e6ee", text: "#4b3b7a" },
  "Scale Builders": { from: "#dff3f2", to: "#e3eefc", text: "#1f7a75" },
  "Culinary Artists": { from: "#fbe3e0", to: "#ffe9d6", text: "#a13a2a" },
  "Food Craftsmen": { from: "#f3e6d6", to: "#fbead9", text: "#8a5a2b" },
  "Premium Producers": { from: "#efe3f7", to: "#fdeedd", text: "#6b3fa0" },
  "Food Business Innovators": { from: "#e0f0ff", to: "#e3fbe9", text: "#1c6fa8" },
};

export const DEFAULT_FAMILY_COLOR = { from: "#ffe3ec", to: "#fff3d6", text: "#c9436a" };

export function familyColor(family: string) {
  return FAMILY_COLORS[family] ?? DEFAULT_FAMILY_COLOR;
}
