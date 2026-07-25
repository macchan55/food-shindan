import sharp from "sharp";
import fs from "node:fs";

const FAMILY1_DIR = "/tmp/claude-0/-home-user-food-shindan/91101eff-5626-5fdf-973c-2733dd4cf0b0/scratchpad/art-samples/family1";
const ALL_DIR = "/tmp/claude-0/-home-user-food-shindan/91101eff-5626-5fdf-973c-2733dd4cf0b0/scratchpad/art-samples/all";
const OUT = "/tmp/claude-0/-home-user-food-shindan/91101eff-5626-5fdf-973c-2733dd4cf0b0/scratchpad/art-samples/contact-sheet.png";

const THUMB = 180;
const COLS = 8;
const ROWS = 8;

function findFile(code) {
  const p1 = `${FAMILY1_DIR}/${code}.png`;
  const p2 = `${ALL_DIR}/${code}.png`;
  if (fs.existsSync(p1)) return p1;
  if (fs.existsSync(p2)) return p2;
  throw new Error(`missing ${code}`);
}

const codes = Array.from({ length: 64 }, (_, i) => `T${String(i + 1).padStart(2, "0")}`);

const composites = [];
for (let i = 0; i < codes.length; i++) {
  const code = codes[i];
  const col = i % COLS;
  const row = Math.floor(i / COLS);
  const buf = await sharp(findFile(code)).resize(THUMB, THUMB).toBuffer();
  composites.push({ input: buf, left: col * THUMB, top: row * THUMB });
}

await sharp({
  create: {
    width: THUMB * COLS,
    height: THUMB * ROWS,
    channels: 3,
    background: "#ffffff",
  },
})
  .composite(composites)
  .png()
  .toFile(OUT);

console.log("saved", OUT);
