import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";

const sizes = [192, 512];

async function generateIcon(size) {
  const iconSvgPath = join(process.cwd(), "public", "icon.svg");
  const svgBuffer = await readFile(iconSvgPath);

  const png = await sharp(svgBuffer).resize(size, size).png().toBuffer();

  const filename = `icon-${size}x${size}.png`;
  const path = join(process.cwd(), "public", filename);
  await writeFile(path, png);
  console.log(`Generated ${filename}`);
}

async function main() {
  for (const size of sizes) {
    await generateIcon(size);
  }
}

main().catch(console.error);
