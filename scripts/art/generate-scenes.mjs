// Generates one wide banner illustration per diagnosis scene (20 total) via gpt-image-2,
// reusing the character-portrait style language but composed as a small restaurant vignette
// (1-2 generic chibi staff/customers + environment) instead of a single character card.
// Usage: node scripts/art/generate-scenes.mjs [outDir] [sceneId...]
import fs from "node:fs";
import path from "node:path";
import { setGlobalDispatcher, ProxyAgent } from "undici";

const proxyUrl = process.env.HTTPS_PROXY || process.env.https_proxy;
if (proxyUrl) setGlobalDispatcher(new ProxyAgent(proxyUrl));

const OUT_DIR =
  process.argv[2] ||
  "/tmp/claude-0/-home-user-food-shindan/91101eff-5626-5fdf-973c-2733dd4cf0b0/scratchpad/art-samples/scenes";
const ONLY_IDS = process.argv.slice(3).map(Number);

fs.mkdirSync(OUT_DIR, { recursive: true });

const STYLE_BASE =
  "A cute wide banner illustration for a Japanese restaurant-industry career quiz app aimed at women in their 20s, depicting a small vignette inside or around a restaurant: chibi-proportioned staff/customer characters (2.5-head-tall, bold clean black outlines, big expressive eyes), warm inviting flat-color palette, soft simple background, clean vector illustration style, crisp linework, gentle sense of humor, no text, no logos, landscape composition with clear open space near the top third for a text overlay later.";

const SCENES = [
  { id: 1, concept: "a half-open shutter at a restaurant entrance just before opening, a staff character jogging with trays, a manager character glancing at a wristwatch, slightly frantic but cheerful morning energy" },
  { id: 2, concept: "a restaurant door swinging open as a slightly nervous first-time customer character steps in, a smiling staff character ready to greet them" },
  { id: 3, concept: "a packed lunchtime restaurant scene, full tables, a staff character juggling multiple order tickets, a chef character shouting through a kitchen pass window, energetic chaos" },
  { id: 4, concept: "a staff character double-checking a receipt with a worried expression, the kitchen behind them frozen mid-motion, a tense but comedic 'uh oh' moment" },
  { id: 5, concept: "a customer character with a serious flat expression sitting at a table, a nervous staff character approaching politely, other staff in the background looking tense" },
  { id: 6, concept: "a brand-new staff character with a shiny name tag standing stiffly with a nervous stiff smile, senior staff character welcoming them warmly" },
  { id: 7, concept: "a warm cozy scene of a regular customer character being greeted like family by a staff character, both smiling, 'the usual' warmth" },
  { id: 8, concept: "a small team gathered around a table full of prototype dishes and notes, everyone taking a thoughtful bite with serious focused expressions, new-menu tasting meeting" },
  { id: 9, concept: "a small team gathered around a table covered in sales reports and charts, everyone groaning thoughtfully while looking at the numbers" },
  { id: 10, concept: "a small meeting scene with two staff characters gesturing mid-debate with speech-bubble-like hand gestures, differing opinions, comedic tension" },
  { id: 11, concept: "a quiet closed restaurant after closing time, soft warm lighting, tired but relieved staff characters finally sitting down to rest" },
  { id: 12, concept: "three characters of different ages (young staff, a manager, a chef) each gazing thoughtfully into the distance with a small daydream cloud showing their future selves" },
  { id: 13, concept: "a small team gathered around a table with a limited stack of coins/budget icons, discussing where to invest, thoughtful planning mood" },
  { id: 14, concept: "a staff character standing before a large unfamiliar door labeled with a new role, looking both nervous and excited, a new mission ahead" },
  { id: 15, concept: "a fork-in-the-road composition with a manual/checklist icon on one path and a handcrafted artisan tool on the other, a staff character standing at the crossroads" },
  { id: 16, concept: "a slightly weary but determined staff character mid-shift with small sweat drops, a long line of clock icons behind them showing consecutive busy days" },
  { id: 17, concept: "a fork-in-the-road composition with a chef's knife path on one side and a manager's clipboard path on the other, a staff character standing at the crossroads looking at both" },
  { id: 18, concept: "a split scene: a quiet elegant counter restaurant on one side and a lively bustling popular restaurant on the other, both inviting in different ways" },
  { id: 19, concept: "a split scene: a manager character deciding by gut feeling with a thought-bubble heart icon on one side, and a manager character studying a spreadsheet on a laptop on the other side" },
  { id: 20, concept: "a staff character noticing a small trouble happening at a coworker's station outside their own assigned area, one foot already stepping forward to help, determined expression" },
];

const targets = ONLY_IDS.length ? SCENES.filter((s) => ONLY_IDS.includes(s.id)) : SCENES;

async function generateOne(scene) {
  const prompt = `${STYLE_BASE} Scene: ${scene.concept}.`;
  const code = `scene-${String(scene.id).padStart(2, "0")}`;
  const outFile = path.join(OUT_DIR, `${code}.png`);

  for (let attempt = 1; attempt <= 4; attempt++) {
    const res = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ model: "gpt-image-2", prompt, size: "1536x1024", quality: "high", n: 1 }),
    });
    if (res.ok) {
      const json = await res.json();
      fs.writeFileSync(outFile, Buffer.from(json.data[0].b64_json, "base64"));
      console.log(code, "saved");
      return;
    }
    const errText = await res.text();
    console.error(code, `attempt ${attempt} FAILED`, res.status, errText.slice(0, 300));
    if (attempt < 4) await new Promise((r) => setTimeout(r, 15000));
  }
  console.error(code, "GAVE UP after 4 attempts");
}

async function pool(items, limit, fn) {
  let i = 0;
  async function worker() {
    while (i < items.length) {
      const idx = i++;
      await fn(items[idx]);
    }
  }
  await Promise.all(Array.from({ length: limit }, worker));
}

console.log(`Generating ${targets.length} scenes -> ${OUT_DIR}`);
await pool(targets, 4, generateOne);
console.log("all done");
