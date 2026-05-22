// Builds icon.icns directly, with Apple's macOS template padding
// preserved. Runs AFTER `npm run tauri:icon` because Tauri's icon
// CLI auto-crops transparent margins (it assumes platforms apply
// their own masks) — which strips the very padding macOS needs to
// render Pallio at the same dock proportion as Finder, Chrome, etc.
//
// Apple's macOS App Icon template:
//   - Canvas:        1024 × 1024
//   - Visible tile:  824 × 824 centred (≈ 80.5% of canvas)
//   - Transparent margin: 100 px on every side
//   - macOS reads .icns 1:1 — no re-padding at runtime
//
// Run: node assets/build-macos-icon.mjs
//      (chained after `tauri:icon` in the build script)

import path from "node:path"
import { fileURLToPath } from "node:url"
import { execFileSync } from "node:child_process"
import fs from "node:fs/promises"
import os from "node:os"
import sharp from "sharp"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, "..")
const SRC = path.join(ROOT, "public", "favicon.svg")
const ICONS_DIR = path.join(ROOT, "src-tauri", "icons")
const OUT = path.join(ICONS_DIR, "icon.icns")

// 76% of canvas — calibrated against the user's actual dock.
// Apple's HIG template (82.4%) makes Pallio look ~15% oversized.
// A pure 70% inset made it ~5% undersized. 76% lands smack on top
// of the visible-tile size of Chrome, VS Code, Notes, Sleekr,
// Finder, etc. on macOS Sequoia. Adjust if Apple changes dock
// rendering in a future macOS release.
const TILE_SCALE = 0.76

// Render the design at `tileSize` pixels, centered in a transparent
// `canvasSize` PNG. Returns a buffer ready for the iconset.
async function renderPadded(canvasSize) {
  const tileSize = Math.round(canvasSize * TILE_SCALE)
  const tileBuf = await sharp(SRC, { density: 1200 })
    .resize(tileSize, tileSize, { fit: "contain", kernel: "lanczos3" })
    .png()
    .toBuffer()
  return sharp({
    create: {
      width: canvasSize,
      height: canvasSize,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([{ input: tileBuf, gravity: "center" }])
    .png({ compressionLevel: 9 })
    .toBuffer()
}

// Apple's required iconset entries — name → pixel size.
const ENTRIES = [
  ["icon_16x16.png",         16],
  ["icon_16x16@2x.png",      32],
  ["icon_32x32.png",         32],
  ["icon_32x32@2x.png",      64],
  ["icon_128x128.png",      128],
  ["icon_128x128@2x.png",   256],
  ["icon_256x256.png",      256],
  ["icon_256x256@2x.png",   512],
  ["icon_512x512.png",      512],
  ["icon_512x512@2x.png",  1024],
]

const tmp = await fs.mkdtemp(path.join(os.tmpdir(), "pallio-iconset-"))
const iconset = path.join(tmp, "Pallio.iconset")
await fs.mkdir(iconset, { recursive: true })

// Dedup renders by size — several entries share dimensions.
const cache = new Map()
async function renderCached(size) {
  if (cache.has(size)) return cache.get(size)
  const buf = await renderPadded(size)
  cache.set(size, buf)
  return buf
}

for (const [name, size] of ENTRIES) {
  const buf = await renderCached(size)
  await fs.writeFile(path.join(iconset, name), buf)
}

// `iconutil` is built into macOS — ships with the developer tools.
// Bails clearly on Linux / Windows where this script can't run.
try {
  execFileSync("iconutil", ["-c", "icns", iconset, "-o", OUT], { stdio: "inherit" })
} catch (err) {
  console.error("iconutil failed — is this running on macOS with Xcode CLT installed?")
  throw err
}

await fs.rm(tmp, { recursive: true, force: true })

// Also overwrite the standalone PNG sources Tauri references at
// build time. Critical: Tauri embeds `icon.png` into the macOS
// binary and uses it for the runtime dock icon in dev mode (when
// there's no .app bundle to read icon.icns from). Without padding
// here, the dock icon stays auto-cropped regardless of what
// icon.icns contains.
const STANDALONE = [
  ["icon.png",          1024],
  ["32x32.png",           32],
  ["64x64.png",           64],
  ["128x128.png",        128],
  ["128x128@2x.png",     256],
]
for (const [name, size] of STANDALONE) {
  const buf = await renderCached(size)
  await fs.writeFile(path.join(ICONS_DIR, name), buf)
}

console.log(`Wrote ${OUT} + ${STANDALONE.length} PNG sources (${(TILE_SCALE * 100).toFixed(1)}% tile inset)`)
