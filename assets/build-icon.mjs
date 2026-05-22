// Builds every brand-icon raster the app needs — three sources for
// @capacitor/assets (icon-only / icon-foreground / icon-background)
// plus the standalone files the PWA manifest and index.html
// reference directly (public/icon-{192,512}.png, etc.).
//
// One canonical source: public/favicon.svg — the price-tag P mark
// (Pallio icon #10 from the design pass). All raster sizes are
// produced from it via sharp at native size, so we never upscale.
//
// Run with: node assets/build-icon.mjs
// Then:     npx capacitor-assets generate
//           (consumes assets/icon-{only,foreground,background}.png)

import path from "node:path"
import { fileURLToPath } from "node:url"
import sharp from "sharp"
import fs from "node:fs/promises"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, "..")
const PUBLIC = path.join(ROOT, "public")

const CANVAS = 1024
// Android adaptive icons crop the inner 66% disc. Setting the mark
// to ~70% of canvas means the full design is visible on every Android
// launcher (round, square, squircle) and still looks substantial on
// iOS where there's no cropping.
const MARK_SCALE = 0.7

// macOS app-icon template: the visible rounded "tile" should occupy
// ~824×824 inside the 1024×1024 canvas, with ~100px transparent
// margin on each side. macOS displays the icon 1:1 in the dock — no
// re-padding — so when we fill the whole canvas, Pallio reads as
// oversized next to every native app. Same template Apple ships in
// the macOS Icon Composer + recommends in the HIG.
const TILE_SCALE = 0.824

const MARK_SRC = path.join(PUBLIC, "favicon.svg")

// Brand violet, matches StatusBar/theme tokens.
const BRAND_BG = { r: 124, g: 58, b: 237, alpha: 1 } // #7c3aed

// Compose-at-size helper. Renders the brand mark at the requested
// raster size from the SVG source (no upscaling artifacts), centred
// on a fill of the caller's choosing.
const renderIcon = async (size, { background = "transparent" } = {}) => {
  const markSize = Math.round(size * MARK_SCALE)
  const markBuf = await sharp(MARK_SRC)
    .resize(markSize, markSize, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
      kernel: "lanczos3",
    })
    .png()
    .toBuffer()

  const bg = background === "transparent"
    ? await sharp({
        create: {
          width: size,
          height: size,
          channels: 4,
          background: { r: 0, g: 0, b: 0, alpha: 0 },
        },
      }).png().toBuffer()
    : await sharp({
        create: {
          width: size,
          height: size,
          channels: 4,
          background,
        },
      }).png().toBuffer()

  return sharp(bg).composite([{ input: markBuf, gravity: "center" }]).png().toBuffer()
}

// The full design at native source size (the favicon.svg includes
// its own light-violet background) for capacitor-assets icon-only.
const renderFullDesign = async (size) => {
  return sharp(MARK_SRC, { density: 600 })
    .resize(size, size, { fit: "contain", kernel: "lanczos3" })
    .png()
    .toBuffer()
}

// macOS-style render — the tile inset inside a transparent canvas.
// Feeds tauri:icon so the generated icon.icns matches the visual
// scale of native macOS dock icons (Finder, Safari, etc.).
const renderTilePadded = async (size) => {
  const tileSize = Math.round(size * TILE_SCALE)
  const tileBuf = await renderFullDesign(tileSize)
  return sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([{ input: tileBuf, gravity: "center" }])
    .png()
    .toBuffer()
}

// 1) tauri:icon source at 1024×1024 — fills the canvas (no
//    transparent margin). Reasoning:
//    - iOS / Android / Windows / Linux all expect the icon to fill
//      the canvas; their platforms apply their own masks.
//    - macOS needs ~24% margin around the tile to look right in the
//      dock, but that's handled in build-macos-icon.mjs which writes
//      its own padded icon.png + icon.icns AFTER `tauri icon` runs.
//    - The Tauri CLI auto-crops transparent padding from this source
//      anyway, so adding margins here is wasted work.
//
//    icon-foreground: mark on transparent (Android adaptive top layer)
//    icon-background: solid brand violet (Android adaptive bottom layer)
const composedFull = await renderFullDesign(CANVAS)
await sharp(composedFull).toFile(path.join(__dirname, "icon-only.png"))

const composedFg = await renderIcon(CANVAS, { background: "transparent" })
await sharp(composedFg).toFile(path.join(__dirname, "icon-foreground.png"))

await sharp({
  create: {
    width: CANVAS,
    height: CANVAS,
    channels: 4,
    background: BRAND_BG,
  },
})
  .png()
  .toFile(path.join(__dirname, "icon-background.png"))

// 2) Standalone files the manifest + index.html reference by exact
//    name. Re-rendered from the same source so a brand refresh
//    keeps every surface in sync.
const standalone = [
  { name: "icon-16.png", size: 16 },
  { name: "icon-32.png", size: 32 },
  { name: "icon-48.png", size: 48 },
  { name: "icon-64.png", size: 64 },
  { name: "icon-128.png", size: 128 },
  { name: "icon-180.png", size: 180 }, // apple-touch-icon
  { name: "icon-192.png", size: 192 },
  { name: "icon-256.png", size: 256 },
  { name: "icon-384.png", size: 384 },
  { name: "icon-512.png", size: 512 },
  { name: "favicon-16.png", size: 16 },
  { name: "favicon-32.png", size: 32 },
  { name: "apple-touch-icon.png", size: 180 },
]

await fs.mkdir(path.join(PUBLIC, "icons"), { recursive: true })

for (const { name, size } of standalone) {
  const buf = await renderFullDesign(size)
  await sharp(buf).toFile(path.join(PUBLIC, "icons", name))
}

// 2b) Mark-only variants — the price-tag mark on transparent, no
//     rounded-card background. Used by the splash screen + the auth
//     page headers, where the card frame from icon-only competes
//     with the surrounding canvas instead of integrating.
const markOnlySizes = [256, 384, 512]
for (const size of markOnlySizes) {
  const buf = await renderIcon(size, { background: "transparent" })
  await sharp(buf).toFile(path.join(PUBLIC, "icons", `mark-${size}.png`))
}

// 3) Maskable icon — single layer, mark inset to 60% so Android's
//    safe-zone crop (the inner 80%) never clips the mark. Solid
//    brand bg fills the rest.
const MASKABLE = 512
const MASKABLE_INSET = 0.6
const maskableMarkSize = Math.round(MASKABLE * MASKABLE_INSET)
const maskableMarkBuf = await sharp(MARK_SRC, { density: 400 })
  .resize(maskableMarkSize, maskableMarkSize, {
    fit: "contain",
    background: { r: 0, g: 0, b: 0, alpha: 0 },
    kernel: "lanczos3",
  })
  .png()
  .toBuffer()
const maskableBg = await sharp({
  create: {
    width: MASKABLE,
    height: MASKABLE,
    channels: 4,
    background: BRAND_BG,
  },
}).png().toBuffer()
const maskableBuf = await sharp(maskableBg)
  .composite([{ input: maskableMarkBuf, gravity: "center" }])
  .png()
  .toBuffer()
await sharp(maskableBuf).toFile(path.join(PUBLIC, "icons", "maskable-512.png"))

console.log(
  [
    `Wrote assets/icon-only.png + icon-foreground.png + icon-background.png (${CANVAS}×${CANVAS})`,
    `Wrote public/icons/${standalone.map((s) => s.name).join(", public/icons/")}`,
    `Wrote public/icons/maskable-512.png`,
  ].join("\n"),
)
