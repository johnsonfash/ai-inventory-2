// Post-processor for `npx capacitor-assets generate`. The generator
// emits iOS + Android assets correctly but its PWA output is
// half-broken for our Vite layout:
//   1. It writes PNG icons to `<root>/icons/` instead of
//      `public/icons/`, so Vite doesn't serve them in production
//      (publicDir = "public").
//   2. It may rewrite public/manifest.json's icon entries with
//      `../icons/...` relative paths, which resolve above the
//      served root.
//
// build-icon.mjs already emits the correct PWA PNG icons under
// public/icons/ from the canonical SVG source. This script cleans
// up after the capacitor-assets run so the manifest stays internally
// consistent and there's no duplicate icons/ folder at the repo
// root for someone to confuse with the served one.
//
// Run after `npx capacitor-assets generate`.

import fs from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, "..")

// 1. Wipe the leftover root-level icons/ folder. build-icon.mjs has
//    already written the canonical copies under public/icons/.
const strayIcons = path.join(ROOT, "icons")
try {
  await fs.rm(strayIcons, { recursive: true })
  console.log(`Removed stray ${path.relative(ROOT, strayIcons)}/`)
} catch (err) {
  if (err.code !== "ENOENT") throw err
}

// 2. Reset manifest.json icon entries to our canonical paths. The
//    generator sometimes rewrites them with `../icons/` relative
//    paths — undo that.
const manifestPath = path.join(ROOT, "public", "manifest.json")
const manifest = JSON.parse(await fs.readFile(manifestPath, "utf8"))

const canonicalIcons = [
  { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
  { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
  { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
]

if (!Array.isArray(manifest.icons) || JSON.stringify(manifest.icons) !== JSON.stringify(canonicalIcons)) {
  manifest.icons = canonicalIcons
  await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2) + "\n")
  console.log(`Reset ${path.relative(ROOT, manifestPath)} icons — ${canonicalIcons.length} entries`)
}
