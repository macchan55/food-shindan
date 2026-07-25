// Resizes + converts generated character portraits to web-friendly WebP and places them
// in public/characters/<typeCode>.webp. Source PNGs live in the scratchpad (not committed);
// only the optimized output is checked into the repo.
import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";

const SOURCE_DIRS = [
  "/tmp/claude-0/-home-user-food-shindan/91101eff-5626-5fdf-973c-2733dd4cf0b0/scratchpad/art-samples/family1",
  "/tmp/claude-0/-home-user-food-shindan/91101eff-5626-5fdf-973c-2733dd4cf0b0/scratchpad/art-samples/all",
];
const OUT_DIR = path.join(process.cwd(), "public", "characters");
fs.mkdirSync(OUT_DIR, { recursive: true });

const codes = Array.from({ length: 64 }, (_, i) => `T${String(i + 1).padStart(2, "0")}`);

function findSource(code) {
  for (const dir of SOURCE_DIRS) {
    const p = path.join(dir, `${code}.png`);
    if (fs.existsSync(p)) return p;
  }
  throw new Error(`source not found for ${code}`);
}

let totalBytes = 0;
for (const code of codes) {
  const src = findSource(code);
  const outPath = path.join(OUT_DIR, `${code}.webp`);
  await sharp(src).resize(640, 640).webp({ quality: 85 }).toFile(outPath);
  totalBytes += fs.statSync(outPath).size;
}
console.log(`wrote ${codes.length} files, total ${(totalBytes / 1024 / 1024).toFixed(1)} MB -> ${OUT_DIR}`);
