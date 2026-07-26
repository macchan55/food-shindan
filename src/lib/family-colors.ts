// Per-family accent colors for the result screen's "reveal" hero, matching the palettes
// used when generating the character portraits (scripts/art/generate-characters.mjs).
// heroFrom/heroTo drive a rich background gradient (deeper/more saturated than the soft
// pastel tints used elsewhere in the app - this section is meant to feel like a spotlight
// moment, not a quiet card). glow drives the portrait's ring + sparkle accents.
export type FamilyColor = { heroFrom: string; heroTo: string; glow: string };

export const FAMILY_COLORS: Record<string, FamilyColor> = {
  "Hospitality Stars": { heroFrom: "#f3b25c", heroTo: "#f28fb0", glow: "#ffe3a3" },
  "Community Hosts": { heroFrom: "#ff9a56", heroTo: "#ff5f6d", glow: "#ffd18f" },
  "Luxury Leaders": { heroFrom: "#463572", heroTo: "#9c3d5c", glow: "#e8b64f" },
  "Scale Builders": { heroFrom: "#1f9e96", heroTo: "#2f7bc9", glow: "#9df0e6" },
  "Culinary Artists": { heroFrom: "#b7391f", heroTo: "#e2711d", glow: "#ffb56b" },
  "Food Craftsmen": { heroFrom: "#a85a1d", heroTo: "#d99a44", glow: "#ffd89a" },
  "Premium Producers": { heroFrom: "#6f3a95", heroTo: "#c98f2e", glow: "#f0cf7a" },
  "Food Business Innovators": { heroFrom: "#1f7ae0", heroTo: "#22b56f", glow: "#9be8ff" },
};

export const DEFAULT_FAMILY_COLOR: FamilyColor = {
  heroFrom: "#e8547a",
  heroTo: "#ff9a56",
  glow: "#ffd18f",
};

export function familyColor(family: string): FamilyColor {
  return FAMILY_COLORS[family] ?? DEFAULT_FAMILY_COLOR;
}
