import "server-only";
import path from "node:path";
import { Font } from "@react-pdf/renderer";

let registered = false;

/** Registers the bundled Japanese font once per server process (idempotent). */
export function registerJapaneseFont() {
  if (registered) return;
  // A static (non-variable) font on purpose: the variable NotoSansJP instance produced
  // subtly wrong glyphs for some common kanji (e.g. 調 rendered as 誂) under fontkit.
  const fontPath = path.join(process.cwd(), "assets", "fonts", "NotoSansJP-Static.otf");
  Font.register({
    family: "NotoSansJP",
    fonts: [{ src: fontPath }],
  });
  // react-pdf hyphenates by default, which breaks Japanese line-wrapping mid-word;
  // treat every character as its own breakable unit instead.
  Font.registerHyphenationCallback((word) => Array.from(word));
  registered = true;
}
