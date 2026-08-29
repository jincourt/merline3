/**
 * Recolors the white Merline logo GIF to brand indigo for light backgrounds.
 *
 * Source: public/merline.gif (white, transparent)
 * Output: public/merline-indigo.gif (indigo #4f46e5, transparent)
 *
 * Color matches --indigo in app/globals.css (#4f46e5).
 *
 * Usage: bun run recolor-merline-gif
 */

import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const require = createRequire(import.meta.url);
const { GIFEncoder, quantize, applyPalette } = require("gifenc");

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

/** Brand indigo — keep in sync with --indigo in app/globals.css */
const INDIGO = [79, 70, 229];

const INPUT = path.join(ROOT, "public", "merline.gif");
const OUTPUT = path.join(ROOT, "public", "merline-indigo.gif");

function recolorFrame(frame) {
  for (let i = 0; i < frame.length; i += 4) {
    if (frame[i + 3] > 0) {
      frame[i] = INDIGO[0];
      frame[i + 1] = INDIGO[1];
      frame[i + 2] = INDIGO[2];
    }
  }
}

async function main() {
  if (!fs.existsSync(INPUT)) {
    console.error(`Missing input GIF: ${INPUT}`);
    process.exit(1);
  }

  const meta = await sharp(INPUT, { animated: true }).metadata();
  const { data, info } = await sharp(INPUT, { animated: true })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const frameW = info.width;
  const frameH = info.pageHeight || Math.floor(info.height / (meta.pages || 1));
  const pages = meta.pages || 1;
  const delays = meta.delay || Array(pages).fill(10);
  const framePixels = frameW * frameH;

  const gif = GIFEncoder({ auto: true });
  let sharedPalette = null;

  for (let page = 0; page < pages; page++) {
    const start = page * framePixels * 4;
    const frame = new Uint8ClampedArray(
      data.subarray(start, start + framePixels * 4),
    );

    recolorFrame(frame);

    const palette =
      sharedPalette ||
      quantize(frame, 256, {
        format: "rgba4444",
        oneBitAlpha: true,
        clearAlpha: true,
        clearAlphaThreshold: 127,
        clearAlphaColor: 0x00,
      });
    if (!sharedPalette) sharedPalette = palette;

    const index = applyPalette(frame, palette, "rgba4444");
    const transparentIndex = palette.findIndex((color) => color[3] === 0);

    gif.writeFrame(index, frameW, frameH, {
      palette,
      // sharp metadata delay is in ms; gifenc expects ms too (÷10 → GIF centiseconds)
      delay: delays[page],
      repeat: page === 0 ? 0 : undefined,
      transparent: transparentIndex >= 0,
      transparentIndex: transparentIndex >= 0 ? transparentIndex : 0,
    });
  }

  gif.finish();
  fs.writeFileSync(OUTPUT, Buffer.from(gif.bytes()));

  const outMeta = await sharp(OUTPUT, { animated: true }).metadata();
  const outSize = fs.statSync(OUTPUT).size;

  console.log(`Wrote ${path.relative(ROOT, OUTPUT)}`);
  console.log(`  frames: ${outMeta.pages}, size: ${(outSize / 1024).toFixed(1)} KB`);
  console.log(`  color: #${INDIGO.map((v) => v.toString(16).padStart(2, "0")).join("")}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
