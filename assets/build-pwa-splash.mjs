// Generates the per-device PWA splash images iOS Safari uses when the
// app is launched from the home screen. Apple doesn't honour the PWA
// manifest's `background_color` for the splash — you have to ship
// pixel-exact PNGs at every device's portrait + landscape resolution
// and reference them via media-query'd `apple-touch-startup-image`
// link tags. Skip this and iOS shows a white flash on cold launch.
//
// Run: node assets/build-pwa-splash.mjs
// Output: public/splash/<w>x<h>.png  (one per entry below)

import path from "node:path"
import { fileURLToPath } from "node:url"
import sharp from "sharp"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, "..")
const outDir = path.join(root, "public", "splash")

// #0a0a0a — matches manifest.json background_color and the app's
// bg-app-black token. Dark-first design — Pallio's splash is dark in
// both system themes.
const BG = { r: 10, g: 10, b: 10, alpha: 1 }

// Logo as a fraction of the SHORTER dimension. 0.28 keeps it readable
// on small phones (375px wide) without crowding tablet splashes.
const LOGO_RATIO = 0.28

const LOGO = path.join(root, "assets", "icon-only.png")

// Per-device portrait sizes. iOS picks the right one via media query
// (device-width × device-height × -webkit-device-pixel-ratio + orientation).
// Source: Apple "About the safe area in iOS" + WebKit changelog notes.
// We ship portrait only — most users hold phones vertically, and
// shipping landscape doubles asset weight for a marginal gain.
const sizes = [
  // iPhone 16/15 Pro Max & 14/13/12 Pro Max
  { w: 1320, h: 2868, dpr: 3, dw: 440, dh: 956 },
  { w: 1290, h: 2796, dpr: 3, dw: 430, dh: 932 },
  { w: 1284, h: 2778, dpr: 3, dw: 428, dh: 926 },
  // iPhone 16/15 Pro, 15, 14
  { w: 1206, h: 2622, dpr: 3, dw: 402, dh: 874 },
  { w: 1179, h: 2556, dpr: 3, dw: 393, dh: 852 },
  // iPhone 13/12/11 Pro, X, XS
  { w: 1170, h: 2532, dpr: 3, dw: 390, dh: 844 },
  { w: 1125, h: 2436, dpr: 3, dw: 375, dh: 812 },
  // iPhone 11 Pro Max / XS Max
  { w: 1242, h: 2688, dpr: 3, dw: 414, dh: 896 },
  // iPhone 11 / XR (2x)
  { w: 828, h: 1792, dpr: 2, dw: 414, dh: 896 },
  // iPhone 8 Plus / 7 Plus / 6s Plus
  { w: 1242, h: 2208, dpr: 3, dw: 414, dh: 736 },
  // iPhone 8 / 7 / 6s / SE 2/3 (2x)
  { w: 750, h: 1334, dpr: 2, dw: 375, dh: 667 },
  // iPad Pro 12.9"
  { w: 2048, h: 2732, dpr: 2, dw: 1024, dh: 1366 },
  // iPad Pro 11" / Air 10.9"
  { w: 1668, h: 2388, dpr: 2, dw: 834, dh: 1194 },
  { w: 1640, h: 2360, dpr: 2, dw: 820, dh: 1180 },
  // iPad 10.2" / 10.9"
  { w: 1620, h: 2160, dpr: 2, dw: 810, dh: 1080 },
  // iPad mini
  { w: 1488, h: 2266, dpr: 2, dw: 744, dh: 1133 },
]

for (const { w, h } of sizes) {
  const logoSize = Math.round(Math.min(w, h) * LOGO_RATIO)
  const logoBuf = await sharp(LOGO)
    .resize(logoSize, logoSize, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
      kernel: "lanczos3",
    })
    .png()
    .toBuffer()

  const out = path.join(outDir, `${w}x${h}.png`)
  await sharp({
    create: { width: w, height: h, channels: 4, background: BG },
  })
    .composite([{ input: logoBuf, gravity: "center" }])
    .png({ compressionLevel: 9 })
    .toFile(out)
  console.log(`  ${w}x${h}`)
}

// Emit the <link> tags the way iOS expects them so we can paste into
// index.html. Logged to stdout; not written automatically — fewer
// surprises that way.
const links = sizes
  .map(
    ({ w, h, dpr, dw, dh }) =>
      `    <link rel="apple-touch-startup-image" media="(device-width: ${dw}px) and (device-height: ${dh}px) and (-webkit-device-pixel-ratio: ${dpr}) and (orientation: portrait)" href="/splash/${w}x${h}.png" />`,
  )
  .join("\n")

console.log(`\nWrote ${sizes.length} splash images to public/splash/.\n`)
console.log("Paste into index.html <head>:\n")
console.log(links)
