import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import pngToIco from "png-to-ico";

const root = process.cwd();
const outDir = path.join(root, "public");

// Brand colors used across the site: deep black + champagne/gold.
const COLORS = {
  bg: "#0B0B0C",
  gold: "#C8A96A",
  gold2: "#E7D39A",
};

function iconSvg(size = 512) {
  // Simple "Q" mark: ring + tail, no fonts (stable rasterization).
  // Keep plenty of padding so it stays legible at 16px.
  const pad = Math.round(size * 0.12);
  const cx = size / 2;
  const cy = size / 2;
  const r = (size - pad * 2) / 2;
  const stroke = Math.max(40, Math.round(size * 0.11));

  // Tail starts slightly inside the ring and exits outside.
  const tailX1 = cx + r * 0.25;
  const tailY1 = cy + r * 0.25;
  const tailX2 = cx + r * 0.68;
  const tailY2 = cy + r * 0.68;

  const radius = Math.round(size * 0.18);

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <radialGradient id="g" cx="30%" cy="25%" r="80%">
      <stop offset="0%" stop-color="${COLORS.gold2}" stop-opacity="0.20"/>
      <stop offset="55%" stop-color="${COLORS.gold}" stop-opacity="0.14"/>
      <stop offset="100%" stop-color="${COLORS.bg}" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="stroke" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${COLORS.gold2}"/>
      <stop offset="100%" stop-color="${COLORS.gold}"/>
    </linearGradient>
    <filter id="softGlow" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="${Math.max(6, Math.round(size * 0.012))}" result="b"/>
      <feColorMatrix in="b" type="matrix"
        values="1 0 0 0 0
                0 1 0 0 0
                0 0 1 0 0
                0 0 0 0.35 0"/>
      <feMerge>
        <feMergeNode/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>

  <rect x="0" y="0" width="${size}" height="${size}" rx="${radius}" fill="${COLORS.bg}"/>
  <rect x="0" y="0" width="${size}" height="${size}" rx="${radius}" fill="url(#g)"/>

  <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="url(#stroke)" stroke-width="${stroke}" filter="url(#softGlow)"/>
  <line x1="${tailX1}" y1="${tailY1}" x2="${tailX2}" y2="${tailY2}"
        stroke="url(#stroke)" stroke-width="${Math.max(32, Math.round(stroke * 0.75))}"
        stroke-linecap="round" filter="url(#softGlow)"/>
</svg>`;
}

async function writeFile(rel, buf) {
  const p = path.join(outDir, rel);
  await fs.mkdir(path.dirname(p), { recursive: true });
  await fs.writeFile(p, buf);
}

async function main() {
  const svg512 = iconSvg(512);
  await writeFile("favicon.svg", Buffer.from(svg512, "utf8"));

  const pngSizes = [
    { file: "favicon-16x16.png", size: 16 },
    { file: "favicon-32x32.png", size: 32 },
    { file: "favicon-48x48.png", size: 48 },
    { file: "apple-touch-icon.png", size: 180 },
    { file: "icon-192.png", size: 192 },
    { file: "icon-512.png", size: 512 },
  ];

  for (const { file, size } of pngSizes) {
    const png = await sharp(Buffer.from(svg512, "utf8"))
      .resize(size, size)
      .png({ compressionLevel: 9, adaptiveFiltering: true })
      .toBuffer();
    await writeFile(file, png);
  }

  const ico = await pngToIco([
    path.join(outDir, "favicon-16x16.png"),
    path.join(outDir, "favicon-32x32.png"),
    path.join(outDir, "favicon-48x48.png"),
  ]);
  await writeFile("favicon.ico", ico);

  const manifest = {
    name: "Quickfund",
    short_name: "Quickfund",
    start_url: "/",
    display: "standalone",
    background_color: COLORS.bg,
    theme_color: COLORS.bg,
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
  await writeFile("site.webmanifest", Buffer.from(JSON.stringify(manifest, null, 2) + "\n", "utf8"));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

