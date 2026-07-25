// Generates one wide banner illustration per question (64 total) via gpt-image-2, reusing
// the scene-vignette style but tailored to each question's specific moment/text rather than
// just its parent scene, so every question in a scene still looks distinct. Reads question
// data straight from scripts/seed-data/questions.json (no per-question hand-written concepts
// needed - the question text + scene context is descriptive enough on its own).
// Usage: node scripts/art/generate-question-scenes.mjs [outDir] [questionCode...]
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { setGlobalDispatcher, ProxyAgent } from "undici";

const proxyUrl = process.env.HTTPS_PROXY || process.env.https_proxy;
if (proxyUrl) setGlobalDispatcher(new ProxyAgent(proxyUrl));

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const QUESTIONS_PATH = path.join(__dirname, "..", "seed-data", "questions.json");
const questions = JSON.parse(fs.readFileSync(QUESTIONS_PATH, "utf-8"));

const OUT_DIR =
  process.argv[2] ||
  "/tmp/claude-0/-home-user-food-shindan/91101eff-5626-5fdf-973c-2733dd4cf0b0/scratchpad/art-samples/questions";
const ONLY_CODES = process.argv.slice(3);

fs.mkdirSync(OUT_DIR, { recursive: true });

const STYLE_BASE =
  "A cute wide banner illustration for a Japanese restaurant-industry career quiz app aimed at women in their 20s, depicting a small vignette inside or around a restaurant: chibi-proportioned staff/customer characters (2.5-head-tall, bold clean black outlines, big expressive eyes), warm inviting flat-color palette, soft simple background, clean vector illustration style, crisp linework, gentle sense of humor, no text, no logos, landscape composition with clear open space near the top third for a text overlay later.";

const targets = ONLY_CODES.length
  ? questions.filter((q) => ONLY_CODES.includes(q.questionId))
  : questions;

async function generateOne(q) {
  const prompt = `${STYLE_BASE} Scene setting: ${q.sceneTitle} - ${q.visualBrief}. Specific moment to depict (in Japanese, describing the exact situation): ${q.text}`;
  const outFile = path.join(OUT_DIR, `${q.questionId}.png`);

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
      console.log(q.questionId, "saved");
      return;
    }
    const errText = await res.text();
    console.error(q.questionId, `attempt ${attempt} FAILED`, res.status, errText.slice(0, 300));
    if (attempt < 4) await new Promise((r) => setTimeout(r, 15000));
  }
  console.error(q.questionId, "GAVE UP after 4 attempts");
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

console.log(`Generating ${targets.length} question illustrations -> ${OUT_DIR}`);
await pool(targets, 4, generateOne);
console.log("all done");
