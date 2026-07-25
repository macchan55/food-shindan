import fs from "node:fs";
import { setGlobalDispatcher, ProxyAgent } from "undici";

const proxyUrl = process.env.HTTPS_PROXY || process.env.https_proxy;
if (proxyUrl) setGlobalDispatcher(new ProxyAgent(proxyUrl));

const OUT_DIR = "/tmp/claude-0/-home-user-food-shindan/91101eff-5626-5fdf-973c-2733dd4cf0b0/scratchpad/art-samples/family1";

const STYLE_BASE = "An original chibi mascot character design for a collectible character-dex app, inspired by the general genre conventions of cute collectible-creature games (NOT copying any existing franchise): chunky rounded 2.5-head-tall proportions, bold clean black outlines, big expressive eyes, dynamic confident pose, simple flat-color background with a soft radial glow, clean vector illustration style, crisp linework, professional character design sheet quality, no text, no logos, designed as one entry in a large collectible set of 64 unique characters.";

const FAMILY_PALETTE = "warm elegant color palette of gold, cream, and soft blush pink, refined and upscale mood";

const characters = [
  { code: "T01", concept: "an elegant hotel concierge character with white gloves and a silver serving tray, calm and composed expression, subtle anticipatory pose" },
  { code: "T02", concept: "a sharp service-analyst character holding a clipboard and a magnifying glass, observant and thoughtful expression" },
  { code: "T03", concept: "a playful service-innovator character holding a megaphone and a smartphone, energetic and creative pose" },
  { code: "T04", concept: "a stylish CX-strategist character holding a tablet showing a brand chart, confident and analytical expression" },
  { code: "T05", concept: "an authoritative restaurant maître d' character holding a leather reservation book, commanding and composed pose" },
  { code: "T06", concept: "a professional training-officer character wearing a headset and holding a training binder, organized and instructive pose" },
  { code: "T07", concept: "an adventurous hospitality-pioneer character holding a suitcase and a passport, excited exploring pose" },
  { code: "T08", concept: "a visionary hospitality-executive character in an elegant suit holding a small blueprint scroll of a restaurant, confident leadership pose" },
];

async function generateOne(char) {
  const prompt = `${STYLE_BASE} ${char.concept}. ${FAMILY_PALETTE}.`;
  const res = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ model: "gpt-image-2", prompt, size: "1024x1024", quality: "high", n: 1 }),
  });
  if (!res.ok) {
    console.error(char.code, "FAILED", res.status, await res.text());
    return;
  }
  const json = await res.json();
  fs.writeFileSync(`${OUT_DIR}/${char.code}.png`, Buffer.from(json.data[0].b64_json, "base64"));
  console.log(char.code, "saved");
}

async function pool(items, limit, fn) {
  const results = [];
  let i = 0;
  async function worker() {
    while (i < items.length) {
      const idx = i++;
      results[idx] = await fn(items[idx]);
    }
  }
  await Promise.all(Array.from({ length: limit }, worker));
  return results;
}

await pool(characters, 4, generateOne);
console.log("done");
