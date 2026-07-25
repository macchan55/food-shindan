/**
 * Parse docs/spec/01-64-types.md into structured JSON.
 * Source of truth for the 64 Restaurant DNA types.
 */
import fs from "node:fs";
import path from "node:path";

const SRC = path.join(__dirname, "..", "docs", "spec", "01-64-types.md");
const OUT = path.join(__dirname, "seed-data", "types.json");

const FAMILIES: Record<string, { axis1: string; axis2: string; axis3: string }> = {
  "Hospitality Stars": { axis1: "Guest", axis2: "Craft", axis3: "High-end" },
  "Community Hosts": { axis1: "Guest", axis2: "Craft", axis3: "Mass" },
  "Luxury Leaders": { axis1: "Guest", axis2: "Business", axis3: "High-end" },
  "Scale Builders": { axis1: "Guest", axis2: "Business", axis3: "Mass" },
  "Culinary Artists": { axis1: "Product", axis2: "Craft", axis3: "High-end" },
  "Food Craftsmen": { axis1: "Product", axis2: "Craft", axis3: "Mass" },
  "Premium Producers": { axis1: "Product", axis2: "Business", axis3: "High-end" },
  "Food Business Innovators": { axis1: "Product", axis2: "Business", axis3: "Mass" },
};

type DiagnosisType = {
  typeId: string; // T01..T64
  name: string;
  catchcopy: string;
  description: string;
  family: string;
  primaryArchetype: string;
  strengths: string[];
  weaknesses: string[];
  suitedJobs: string[];
  suitedFormats: string[];
  suitedRoles: string[];
  tags: {
    axis1: string; // Guest | Product
    axis2: string; // Craft | Business
    axis3: string; // High-end | Mass
    axis4: string; // Specialist | Leader
    axis5: string; // Arrange | Venture
    axis6: string; // Intuitive | Data
  };
};

function splitList(s: string): string[] {
  return s
    .split(/[／\/]/)
    .map((x) => x.trim())
    .filter(Boolean);
}

function main() {
  const raw = fs.readFileSync(SRC, "utf-8");
  // Split on "### T\d\d｜..." headers
  const blocks = raw.split(/\n(?=### T\d{2}｜)/);

  const types: DiagnosisType[] = [];

  for (const block of blocks) {
    const headerMatch = block.match(/^### (T\d{2})｜(.+)$/m);
    if (!headerMatch) continue;
    const [, typeId, name] = headerMatch;

    const lines = block.split("\n").map((l) => l.trim());
    const headerIdx = lines.findIndex((l) => l.startsWith("### "));

    // catchcopy = first non-empty line after header
    let cursor = headerIdx + 1;
    while (lines[cursor] === "") cursor++;
    const catchcopy = lines[cursor];
    cursor++;
    while (lines[cursor] === "") cursor++;

    // description = next non-empty line before the "- ファミリー:" bullet list
    const descLines: string[] = [];
    while (cursor < lines.length && !lines[cursor].startsWith("- ファミリー:")) {
      if (lines[cursor] !== "") descLines.push(lines[cursor]);
      cursor++;
    }
    const description = descLines.join("\n");

    const getField = (label: string): string => {
      const line = lines.find((l) => l.startsWith(`- ${label}:`));
      if (!line) throw new Error(`${typeId}: missing field "${label}"`);
      return line.replace(`- ${label}:`, "").trim();
    };

    const family = getField("ファミリー");
    const primaryArchetype = getField("主要アーキタイプ");
    const strengths = splitList(getField("主な強み"));
    const weaknesses = splitList(getField("注意点"));
    const suitedJobs = splitList(getField("向いている職種"));
    const suitedFormats = splitList(getField("向いている業態"));
    const suitedRoles = splitList(getField("向いている役職"));
    const tagLine = getField("判定タグ");
    const tagParts = splitList(tagLine);
    if (tagParts.length !== 6) {
      throw new Error(`${typeId}: expected 6 judgment tags, got ${tagParts.length}: ${tagLine}`);
    }
    const [axis1, axis2, axis3, axis4, axis5, axis6] = tagParts;

    const familyDef = FAMILIES[family];
    if (!familyDef) throw new Error(`${typeId}: unknown family "${family}"`);
    if (
      familyDef.axis1 !== axis1 ||
      familyDef.axis2 !== axis2 ||
      familyDef.axis3 !== axis3
    ) {
      throw new Error(
        `${typeId}: tag axis1-3 (${axis1}/${axis2}/${axis3}) does not match family "${family}" definition`
      );
    }

    types.push({
      typeId,
      name,
      catchcopy,
      description,
      family,
      primaryArchetype,
      strengths,
      weaknesses,
      suitedJobs,
      suitedFormats,
      suitedRoles,
      tags: { axis1, axis2, axis3, axis4, axis5, axis6 },
    });
  }

  if (types.length !== 64) {
    throw new Error(`Expected 64 types, parsed ${types.length}`);
  }

  // Verify all 64 tag combinations are unique (this was the bug the README says was fixed)
  const tagKey = (t: DiagnosisType) =>
    [t.tags.axis1, t.tags.axis2, t.tags.axis3, t.tags.axis4, t.tags.axis5, t.tags.axis6].join("|");
  const seen = new Set<string>();
  for (const t of types) {
    const key = tagKey(t);
    if (seen.has(key)) throw new Error(`Duplicate tag combination: ${key} (${t.typeId})`);
    seen.add(key);
  }
  if (seen.size !== 64) throw new Error(`Expected 64 unique tag combos, got ${seen.size}`);

  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify(types, null, 2));
  console.log(`Parsed ${types.length} types -> ${OUT}`);
}

main();
