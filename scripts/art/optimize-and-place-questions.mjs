// Resizes + converts the 64 per-question illustrations to web-friendly WebP and places them
// in public/questions/<QuestionCode>.webp. Source PNGs live in the scratchpad (not
// committed); only the optimized output is checked into the repo. Supersedes the earlier
// shared 20-scene banners (public/scenes/), which this script's caller removes.
import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";

const SRC_DIR =
  "/tmp/claude-0/-home-user-food-shindan/91101eff-5626-5fdf-973c-2733dd4cf0b0/scratchpad/art-samples/questions";
const OUT_DIR = path.join(process.cwd(), "public", "questions");
fs.mkdirSync(OUT_DIR, { recursive: true });

let totalBytes = 0;
for (let i = 1; i <= 64; i++) {
  const code = `Q${String(i).padStart(2, "0")}`;
  const src = path.join(SRC_DIR, `${code}.png`);
  const outPath = path.join(OUT_DIR, `${code}.webp`);
  await sharp(src).resize(900, 600).webp({ quality: 82 }).toFile(outPath);
  totalBytes += fs.statSync(outPath).size;
}
console.log(`wrote 64 files, total ${(totalBytes / 1024 / 1024).toFixed(1)} MB -> ${OUT_DIR}`);
