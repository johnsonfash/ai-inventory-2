// Generates 1x/2x/3x splash logo assets for the iOS LaunchScreen
// imageset. The launch screen XIB centres a UIImageView pinned to
// SplashLogo (asset name); iOS picks the right density at runtime.
//
// Sized at 200pt natural so it lands ~30% of a portrait iPhone width
// — readable but uncrowded, like the PWA splash.
//
// Run: node assets/build-ios-splash-logo.mjs

import path from "node:path"
import { fileURLToPath } from "node:url"
import sharp from "sharp"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, "..")
const out = path.join(root, "src-tauri", "gen", "apple", "Assets.xcassets", "SplashLogo.imageset")

const LOGO = path.join(root, "assets", "icon-only.png")
const NATURAL = 200 // points

for (const scale of [1, 2, 3]) {
  const px = NATURAL * scale
  const dest = path.join(out, `splash-logo@${scale}x.png`)
  await sharp(LOGO)
    .resize(px, px, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 }, kernel: "lanczos3" })
    .png({ compressionLevel: 9 })
    .toFile(dest)
  console.log(`  ${scale}x → ${dest}`)
}
