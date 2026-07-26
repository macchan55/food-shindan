// Generates a male AND female chibi character-dex portrait per Restaurant DNA type (128
// images total) via OpenAI's gpt-image-2, using a shared vivid-saturated style template +
// per-family color palette + a hand-written per-type concept (prop/pose/expression) so all
// 64 types read as one coherent collectible set while staying visually distinct. Saves
// PNGs to OUT_DIR, named <typeCode>-f.png / <typeCode>-m.png.
//
// Usage: node scripts/art/generate-characters.mjs [outDir] [typeCode-or-outCode...]
//   - outDir defaults to the shared scratchpad art-samples/all directory
//   - optional filter args restrict the run, matching either a bare type code (both
//     genders, e.g. "T33") or a specific gendered code (e.g. "T33-m")
import fs from "node:fs";
import path from "node:path";
import { setGlobalDispatcher, ProxyAgent } from "undici";

const proxyUrl = process.env.HTTPS_PROXY || process.env.https_proxy;
if (proxyUrl) setGlobalDispatcher(new ProxyAgent(proxyUrl));

const OUT_DIR =
  process.argv[2] ||
  "/tmp/claude-0/-home-user-food-shindan/91101eff-5626-5fdf-973c-2733dd4cf0b0/scratchpad/art-samples/all";
const ONLY_CODES = process.argv.slice(3);

fs.mkdirSync(OUT_DIR, { recursive: true });

const STYLE_BASE =
  "An original chibi mascot character design for a collectible character-dex app, inspired by the general genre conventions of cute collectible-creature games and gacha-style character reveal art (NOT copying any existing franchise): chunky rounded 2.5-head-tall proportions, bold thick black outlines, glossy cel-shaded rendering with crisp specular highlights on hair/props, big expressive eyes, dynamic confident action pose, HIGHLY SATURATED VIVID colors with strong punchy contrast - NOT muted, NOT pastel, NOT desaturated, NOT washed out. Background: a bright warm golden-yellow to orange radial glow, consistent across the whole collection, clean vector illustration style, crisp linework, professional character design sheet quality, no text, no logos, designed as one vivid, eye-catching entry in a large collectible set of 64 unique characters.";

const FAMILY_PALETTES = {
  "Hospitality Stars": "vivid saturated costume palette of rich gold, crimson red accents, and crisp white, glossy upscale look",
  "Community Hosts": "vivid saturated costume palette of bright orange, hot red, and sunflower yellow, high-energy look",
  "Luxury Leaders": "vivid saturated costume palette of deep royal navy, rich burgundy red, and bright gold trim, opulent high-contrast look",
  "Scale Builders": "vivid saturated costume palette of bright teal, electric blue, and silver-white accents, confident energetic look",
  "Culinary Artists": "vivid saturated costume palette of fiery red, charcoal black, and bright ember orange, intense passionate look",
  "Food Craftsmen": "vivid saturated costume palette of rich terracotta orange, deep brown, and warm mustard yellow, sturdy energetic look",
  "Premium Producers": "vivid saturated costume palette of rich royal purple, bright gold, and crisp white accents, luxe high-contrast look",
  "Food Business Innovators": "vivid saturated costume palette of electric blue, bright emerald green, and white accents, futuristic energetic look",
};

const CHARACTERS = [
  { code: "T01", family: "Hospitality Stars", concept: "an elegant hotel concierge character with white gloves and a silver serving tray, calm and composed expression, subtle anticipatory pose" },
  { code: "T02", family: "Hospitality Stars", concept: "a sharp service-analyst character holding a clipboard and a magnifying glass, observant and thoughtful expression" },
  { code: "T03", family: "Hospitality Stars", concept: "a playful service-innovator character holding a megaphone and a smartphone, energetic and creative pose" },
  { code: "T04", family: "Hospitality Stars", concept: "a stylish CX-strategist character holding a tablet showing a brand chart, confident and analytical expression" },
  { code: "T05", family: "Hospitality Stars", concept: "an authoritative restaurant maitre-d character holding a leather reservation book, commanding and composed pose" },
  { code: "T06", family: "Hospitality Stars", concept: "a professional training-officer character wearing a headset and holding a training binder, organized and instructive pose" },
  { code: "T07", family: "Hospitality Stars", concept: "an adventurous hospitality-pioneer character holding a suitcase and a passport, excited exploring pose" },
  { code: "T08", family: "Hospitality Stars", concept: "a visionary hospitality-executive character in an elegant suit holding a small blueprint scroll of a restaurant, confident leadership pose" },

  { code: "T09", family: "Community Hosts", concept: "a warm friendly waiter character holding a drink tray, big welcoming smile, cheerful waving pose" },
  { code: "T10", family: "Community Hosts", concept: "a meticulous service-trainer character holding a stopwatch and a service manual, precise confident pose" },
  { code: "T11", family: "Community Hosts", concept: "a cheerful neighborhood-star character holding a flyer, surrounded by tiny heart sparkles, super friendly pose" },
  { code: "T12", family: "Community Hosts", concept: "a savvy marketing character holding a smartphone showing an upward graph, excited pointing pose" },
  { code: "T13", family: "Community Hosts", concept: "a warm caring manager character wearing an apron, hand on heart, gentle reassuring pose" },
  { code: "T14", family: "Community Hosts", concept: "a dynamic floor-commander character wearing a headset, pointing decisively, energetic action pose" },
  { code: "T15", family: "Community Hosts", concept: "a warm entrepreneurial character holding a small handmade shop signboard, proud founding pose" },
  { code: "T16", family: "Community Hosts", concept: "a confident business-producer character holding a blueprint of a restaurant chain, visionary pose" },

  { code: "T17", family: "Luxury Leaders", concept: "an elegant sommelier character holding a wine glass and bottle, refined graceful pose" },
  { code: "T18", family: "Luxury Leaders", concept: "a sharp analyst character holding a tablet with a revenue chart, poised calculating expression" },
  { code: "T19", family: "Luxury Leaders", concept: "a chic creative-director character holding a stylish mood board, artistic confident pose" },
  { code: "T20", family: "Luxury Leaders", concept: "a sophisticated strategist character holding a magnifying glass over a small world map, thoughtful visionary pose" },
  { code: "T21", family: "Luxury Leaders", concept: "a distinguished maitre-d character in a tailored suit holding white gloves, dignified composed pose" },
  { code: "T22", family: "Luxury Leaders", concept: "a commanding executive character holding an organizational chart, authoritative pose" },
  { code: "T23", family: "Luxury Leaders", concept: "a chic entrepreneur character holding a golden key, proud visionary pose" },
  { code: "T24", family: "Luxury Leaders", concept: "a regal CEO character in an elegant coat holding a small golden trophy, powerful confident pose" },

  { code: "T25", family: "Scale Builders", concept: "an energetic improvement-specialist character holding an upward-arrow graph board, dynamic pointing pose" },
  { code: "T26", family: "Scale Builders", concept: "a meticulous accountant-analyst character holding a calculator and ledger, focused pose" },
  { code: "T27", family: "Scale Builders", concept: "an adventurous trend-hunter character holding a magnifying glass over a tiny storefront model, excited discovering pose" },
  { code: "T28", family: "Scale Builders", concept: "a tech-savvy strategist character holding a glowing tablet with app icons, futuristic confident pose" },
  { code: "T29", family: "Scale Builders", concept: "a decisive floor-commander character mid-stride holding a walkie-talkie, action-hero pose" },
  { code: "T30", family: "Scale Builders", concept: "an organized operations-officer character holding a multi-store map with pins, methodical pose" },
  { code: "T31", family: "Scale Builders", concept: "a powerful franchise-mogul character holding a contract scroll, commanding pose" },
  { code: "T32", family: "Scale Builders", concept: "a triumphant expansion-champion character standing atop a stack of blueprints, victorious pose" },

  { code: "T33", family: "Culinary Artists", concept: "an intense grill-master character holding tongs over a sizzling flame effect, focused determined expression" },
  { code: "T34", family: "Culinary Artists", concept: "a studious chef-researcher character holding a small test tube of sauce and a notebook, curious analytical pose" },
  { code: "T35", family: "Culinary Artists", concept: "an artistic lone-wolf chef character holding a plate like a canvas with a garnishing tool like a paintbrush, dramatic creative pose" },
  { code: "T36", family: "Culinary Artists", concept: "a scientific chef-innovator character holding a beaker and molecular-gastronomy tools, precise curious pose" },
  { code: "T37", family: "Culinary Artists", concept: "a wise legendary head-chef character in a tall chef hat holding a ladle like a scepter, dignified masterful pose" },
  { code: "T38", family: "Culinary Artists", concept: "a meticulous quality-officer character holding a clipboard and a thermometer, precise inspecting pose" },
  { code: "T39", family: "Culinary Artists", concept: "an adventurous globe-trotting chef character holding a chef knife and a small world globe, bold pioneering pose" },
  { code: "T40", family: "Culinary Artists", concept: "a charismatic celebrity-chef-producer character holding a chef knife like a microphone, star-quality confident pose" },

  { code: "T41", family: "Food Craftsmen", concept: "an energetic wok-cook character holding a flaming wok mid-toss, dynamic speedy action pose" },
  { code: "T42", family: "Food Craftsmen", concept: "a methodical process-engineer character holding a flowchart of kitchen operations, analytical pose" },
  { code: "T43", family: "Food Craftsmen", concept: "an inventive street-food character holding a tray of quirky snacks beside a small food cart, playful inventive pose" },
  { code: "T44", family: "Food Craftsmen", concept: "a practical product-developer character holding a packaged food sample, thoughtful pose" },
  { code: "T45", family: "Food Craftsmen", concept: "a superhuman speed-cook character with motion-blur arms flipping multiple pans at once, heroic energetic pose" },
  { code: "T46", family: "Food Craftsmen", concept: "an authoritative factory-commander character in a hygiene cap and coat holding a production checklist, commanding pose" },
  { code: "T47", family: "Food Craftsmen", concept: "a proud founder character holding a signature dish on a tray like a trophy, beaming proud pose" },
  { code: "T48", family: "Food Craftsmen", concept: "an industrial leader character holding a supply-chain flowchart, steady confident pose" },

  { code: "T49", family: "Premium Producers", concept: "a refined connoisseur character holding a golden ingredient like a jewel, admiring appraising pose" },
  { code: "T50", family: "Premium Producers", concept: "a precise cost-engineer character holding a calculator and a golden price tag, meticulous pose" },
  { code: "T51", family: "Premium Producers", concept: "an artistic brand-creator character holding a glowing brand-logo sketch, inspired creative pose" },
  { code: "T52", family: "Premium Producers", concept: "a sharp deal-making character holding a handshake silhouette and a contract, confident networking pose" },
  { code: "T53", family: "Premium Producers", concept: "a masterful creative-director character conducting floating brand icons like an orchestra conductor, elegant commanding pose" },
  { code: "T54", family: "Premium Producers", concept: "a polished executive character holding a premium product-line chart, composed authoritative pose" },
  { code: "T55", family: "Premium Producers", concept: "a glamorous entrepreneur character holding a small luxury gift box, confident proud pose" },
  { code: "T56", family: "Premium Producers", concept: "a majestic CEO character in a champagne-gold coat holding a small globe with brand pins, regal visionary pose" },

  { code: "T57", family: "Food Business Innovators", concept: "a sharp-eyed talent-scout-like character tasting a dish while holding a market-trend tablet, keen judging pose" },
  { code: "T58", family: "Food Business Innovators", concept: "a tech-savvy data-researcher character holding a floating holographic data chart, curious analytical pose" },
  { code: "T59", family: "Food Business Innovators", concept: "a bold menu-inventor character holding a glowing lightbulb-shaped dish, excited eureka pose" },
  { code: "T60", family: "Food Business Innovators", concept: "a futuristic developer character holding a tablet with app blueprints and gears, innovative confident pose" },
  { code: "T61", family: "Food Business Innovators", concept: "a driven team-lead character holding a product roadmap chart, motivating pose" },
  { code: "T62", family: "Food Business Innovators", concept: "a composed operations-chief character holding a company org chart, steady authoritative pose" },
  { code: "T63", family: "Food Business Innovators", concept: "an energetic startup-founder character holding a rocket-shaped app icon, excited launching pose" },
  { code: "T64", family: "Food Business Innovators", concept: "a powerful visionary-CEO character standing confidently beside a glowing globe reshaping into a new symbol, epic transformative pose" },
];

// Each type gets a male and a female character-art variant so the result screen can match
// the gender the user picks (src/app/diagnosis/StartButton.tsx). Same prop/pose/personality
// and family palette either way - only the character's gender presentation changes.
const GENDERS = [
  { suffix: "f", label: "female", modifier: "the character is designed as female/feminine" },
  { suffix: "m", label: "male", modifier: "the character is designed as male/masculine" },
];

function matchesFilter(outCode, baseCode) {
  if (!ONLY_CODES.length) return true;
  return ONLY_CODES.includes(outCode) || ONLY_CODES.includes(baseCode);
}

const targets = CHARACTERS.flatMap((char) =>
  GENDERS.map((g) => ({ ...char, outCode: `${char.code}-${g.suffix}`, genderModifier: g.modifier }))
).filter((t) => matchesFilter(t.outCode, t.code));

async function generateOne(char) {
  const palette = FAMILY_PALETTES[char.family];
  const prompt = `${STYLE_BASE} ${char.concept}, ${char.genderModifier}. ${palette}.`;
  const outFile = path.join(OUT_DIR, `${char.outCode}.png`);

  for (let attempt = 1; attempt <= 4; attempt++) {
    const res = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ model: "gpt-image-2", prompt, size: "1024x1024", quality: "high", n: 1 }),
    });
    if (res.ok) {
      const json = await res.json();
      fs.writeFileSync(outFile, Buffer.from(json.data[0].b64_json, "base64"));
      console.log(char.outCode, "saved");
      return;
    }
    const errText = await res.text();
    console.error(char.outCode, `attempt ${attempt} FAILED`, res.status, errText.slice(0, 300));
    if (attempt < 4) await new Promise((r) => setTimeout(r, 15000));
  }
  console.error(char.outCode, "GAVE UP after 4 attempts");
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

console.log(`Generating ${targets.length} character images (male+female) -> ${OUT_DIR}`);
await pool(targets, 4, generateOne);
console.log("all done");
