import sharp from "sharp";
import path from "node:path";

const DIR = "/tmp/claude-0/-home-user-food-shindan/91101eff-5626-5fdf-973c-2733dd4cf0b0/scratchpad/art-samples/scenes";
const OUT = "/tmp/claude-0/-home-user-food-shindan/91101eff-5626-5fdf-973c-2733dd4cf0b0/scratchpad/art-samples/scene-contact-sheet.png";

const W = 300, H = 200;
const COLS = 4, ROWS = 5;

const composites = [];
for (let i = 0; i < 20; i++) {
  const code = `scene-${String(i + 1).padStart(2, "0")}`;
  const col = i % COLS;
  const row = Math.floor(i / COLS);
  const buf = await sharp(path.join(DIR, `${code}.png`)).resize(W, H, { fit: "cover" }).toBuffer();
  composites.push({ input: buf, left: col * W, top: row * H });
}

await sharp({ create: { width: W * COLS, height: H * ROWS, channels: 3, background: "#ffffff" } })
  .composite(composites)
  .png()
  .toFile(OUT);
console.log("saved", OUT);
