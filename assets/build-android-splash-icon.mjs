// Generates the Android 12+ Splash Screen icon at each mipmap density.
// The Android splash API takes ONE windowSplashScreenAnimatedIcon and
// scales it to a 240dp circle on phones / 288dp on tablets. We render
// at 432px (xxxhdpi 108dp safe-zone for adaptive icons) — the system
// scales down per density. Icon is centred on the splash background.
//
// Run: node assets/build-android-splash-icon.mjs

import path from "node:path"
import { fileURLToPath } from "node:url"
import sharp from "sharp"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, "..")
const resDir = path.join(root, "src-tauri", "gen", "android", "app", "src", "main", "res")

const LOGO = path.join(root, "assets", "icon-only.png")

// Per-density px sizes — Android docs §SplashScreen "Specify a custom
// animated icon" recommends 432×432dp source. These are the px equivs.
const densities = [
  { dir: "mipmap-mdpi",    px: 108 },
  { dir: "mipmap-hdpi",    px: 162 },
  { dir: "mipmap-xhdpi",   px: 216 },
  { dir: "mipmap-xxhdpi",  px: 324 },
  { dir: "mipmap-xxxhdpi", px: 432 },
]

for (const { dir, px } of densities) {
  const dest = path.join(resDir, dir, "ic_splash.png")
  await sharp(LOGO)
    .resize(px, px, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 }, kernel: "lanczos3" })
    .png({ compressionLevel: 9 })
    .toFile(dest)
  console.log(`  ${dir}/ic_splash.png (${px}px)`)
}
