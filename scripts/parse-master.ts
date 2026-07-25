/**
 * Parse docs/spec/02-job-format-role-master.md's markdown table into structured JSON.
 * Source of truth for job / format(業態) / role master vectors used in career matching.
 */
import fs from "node:fs";
import path from "node:path";

const SRC = path.join(__dirname, "..", "docs", "spec", "02-job-format-role-master.md");
const OUT = path.join(__dirname, "seed-data", "master.json");

const CATEGORY_MAP: Record<string, "job" | "format" | "role"> = {
  職種: "job",
  業態: "format",
  役職: "role",
};

const AXIS_ORDER = ["HOS", "CRA", "TEA", "LEA", "BUS", "CRE", "GRO", "STA", "CHA", "OWN"];

type MasterRecord = {
  id: string;
  category: "job" | "format" | "role";
  name: string;
  vector: Record<string, number>;
};

function main() {
  const raw = fs.readFileSync(SRC, "utf-8");
  const lines = raw.split("\n");

  const records: MasterRecord[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed.startsWith("|")) continue;
    if (!/^\|\s*(JOB|GEN|ROL)-\d{3}\s*\|/.test(trimmed)) continue;

    const cells = trimmed
      .split("|")
      .map((c) => c.trim())
      .filter((_, idx, arr) => idx > 0 && idx < arr.length - 1); // drop leading/trailing empties from split

    const [id, categoryJa, name, ...scores] = cells;
    const category = CATEGORY_MAP[categoryJa];
    if (!category) throw new Error(`Unknown category "${categoryJa}" for ${id}`);
    if (scores.length !== AXIS_ORDER.length) {
      throw new Error(`${id}: expected ${AXIS_ORDER.length} scores, got ${scores.length}`);
    }

    const vector: Record<string, number> = {};
    AXIS_ORDER.forEach((axis, i) => {
      const v = Number(scores[i]);
      if (Number.isNaN(v)) throw new Error(`${id}: non-numeric score "${scores[i]}" for ${axis}`);
      vector[axis] = v;
    });

    records.push({ id, category, name, vector });
  }

  if (records.length !== 95) {
    throw new Error(`Expected 95 master records, parsed ${records.length}`);
  }
  const jobs = records.filter((r) => r.category === "job");
  const formats = records.filter((r) => r.category === "format");
  const roles = records.filter((r) => r.category === "role");
  if (jobs.length !== 40) throw new Error(`Expected 40 jobs, got ${jobs.length}`);
  if (formats.length !== 35) throw new Error(`Expected 35 formats, got ${formats.length}`);
  if (roles.length !== 20) throw new Error(`Expected 20 roles, got ${roles.length}`);

  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify(records, null, 2));
  console.log(
    `Parsed ${records.length} master records (jobs=${jobs.length}, formats=${formats.length}, roles=${roles.length}) -> ${OUT}`
  );
}

main();
