// One-shot script. Composes the brand mark onto a flat #0a0a0a
// (matches Capacitor SplashScreen.backgroundColor + bg-app-black)
// canvas at 2732×2732 — the universal splash source @capacitor/assets
// feeds into every iOS + Android density.
//
// Run with: node assets/build-splash.mjs
// Output:   assets/splash.png        (light theme — dark bg)
//           assets/splash-dark.png   (identical — Pallio's splash
//                                     is dark in both modes)

import path from "node:path"
import { fileURLToPath } from "node:url"
import sharp from "sharp"

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const CANVAS = 2732
const LOGO_RATIO = 0.32 // Brand mark is ~32% of canvas — large enough
                        // to read on a phone, small enough that it
                        // never crops on the smallest iPad densities.
const BG = { r: 10, g: 10, b: 10, alpha: 1 } // #0a0a0a

const logoSrc = path.join(__dirname, "..", "public", "favicon.svg")

const logoSize = Math.round(CANVAS * LOGO_RATIO)

const logoBuf = await sharp(logoSrc, { density: 600 })
  .resize(logoSize, logoSize, {
    fit: "contain",
    background: { r: 0, g: 0, b: 0, alpha: 0 },
    kernel: "lanczos3",
  })
  .png()
  .toBuffer()

const splashBuf = await sharp({
  create: {
    width: CANVAS,
    height: CANVAS,
    channels: 4,
    background: BG,
  },
})
  .composite([{ input: logoBuf, gravity: "center" }])
  .png()
  .toBuffer()

await sharp(splashBuf).toFile(path.join(__dirname, "splash.png"))
await sharp(splashBuf).toFile(path.join(__dirname, "splash-dark.png"))

console.log(`Wrote assets/splash.png + splash-dark.png (${CANVAS}×${CANVAS})`)
