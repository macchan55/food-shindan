// Resizes + converts the 128 gendered character portraits to web-friendly WebP and places
// them in public/characters/<TypeCode>-f.webp / -m.webp, alongside the existing
// public/characters/<TypeCode>.webp (kept as the fallback for sessions where the user
// skipped the gender picker - see src/lib/diagnosis/serialize.ts).
import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";

const SRC_DIR =
  "/tmp/claude-0/-home-user-food-shindan/91101eff-5626-5fdf-973c-2733dd4cf0b0/scratchpad/art-samples/all-gendered";
const OUT_DIR = path.join(process.cwd(), "public", "characters");
fs.mkdirSync(OUT_DIR, { recursive: true });

let totalBytes = 0;
let count = 0;
for (let i = 1; i <= 64; i++) {
  const base = `T${String(i).padStart(2, "0")}`;
  for (const g of ["f", "m"]) {
    const code = `${base}-${g}`;
    const src = path.join(SRC_DIR, `${code}.png`);
    const outPath = path.join(OUT_DIR, `${code}.webp`);
    await sharp(src).resize(640, 640).webp({ quality: 85 }).toFile(outPath);
    totalBytes += fs.statSync(outPath).size;
    count++;
  }
}
console.log(`wrote ${count} files, total ${(totalBytes / 1024 / 1024).toFixed(1)} MB -> ${OUT_DIR}`);
