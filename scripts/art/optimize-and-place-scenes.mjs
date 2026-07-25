// Resizes + converts the 20 scene illustrations to web-friendly WebP and places them in
// public/scenes/scene-<NN>.webp. Source PNGs live in the scratchpad (not committed); only
// the optimized output is checked into the repo.
import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";

const SRC_DIR =
  "/tmp/claude-0/-home-user-food-shindan/91101eff-5626-5fdf-973c-2733dd4cf0b0/scratchpad/art-samples/scenes";
const OUT_DIR = path.join(process.cwd(), "public", "scenes");
fs.mkdirSync(OUT_DIR, { recursive: true });

let totalBytes = 0;
for (let i = 1; i <= 20; i++) {
  const code = `scene-${String(i).padStart(2, "0")}`;
  const src = path.join(SRC_DIR, `${code}.png`);
  const outPath = path.join(OUT_DIR, `${code}.webp`);
  await sharp(src).resize(900, 600).webp({ quality: 82 }).toFile(outPath);
  totalBytes += fs.statSync(outPath).size;
}
console.log(`wrote 20 files, total ${(totalBytes / 1024 / 1024).toFixed(1)} MB -> ${OUT_DIR}`);
