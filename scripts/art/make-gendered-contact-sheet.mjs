import sharp from "sharp";
import path from "node:path";

const DIR = "/tmp/claude-0/-home-user-food-shindan/91101eff-5626-5fdf-973c-2733dd4cf0b0/scratchpad/art-samples/all-gendered";
const FAMILY1_FALLBACK = "/tmp/claude-0/-home-user-food-shindan/91101eff-5626-5fdf-973c-2733dd4cf0b0/scratchpad/art-samples/all-gendered";

const W = 130, H = 130;

async function makeSheet(gender, outPath) {
  const COLS = 8, ROWS = 8;
  const composites = [];
  for (let i = 0; i < 64; i++) {
    const code = `T${String(i + 1).padStart(2, "0")}-${gender}`;
    const col = i % COLS;
    const row = Math.floor(i / COLS);
    const buf = await sharp(path.join(DIR, `${code}.png`)).resize(W, H, { fit: "cover" }).toBuffer();
    composites.push({ input: buf, left: col * W, top: row * H });
  }
  await sharp({ create: { width: W * COLS, height: H * ROWS, channels: 3, background: "#ffffff" } })
    .composite(composites)
    .png()
    .toFile(outPath);
  console.log("saved", outPath);
}

await makeSheet("f", "/tmp/claude-0/-home-user-food-shindan/91101eff-5626-5fdf-973c-2733dd4cf0b0/scratchpad/art-samples/gendered-sheet-f.png");
await makeSheet("m", "/tmp/claude-0/-home-user-food-shindan/91101eff-5626-5fdf-973c-2733dd4cf0b0/scratchpad/art-samples/gendered-sheet-m.png");
