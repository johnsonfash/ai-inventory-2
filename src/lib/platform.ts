import { isTauri } from "@tauri-apps/api/core"
import { platform } from "@tauri-apps/plugin-os"

// Canonical platform identity used anywhere the app needs to branch
// on where it's running. Values come from `@tauri-apps/plugin-os`
// when inside Tauri, or a synthesized "web" when running in a plain
// browser / PWA. Result is cached at module load so callers can use
// the helpers in render paths without async juggling.

export type PallioPlatform =
  | "web"      // browser tab or installed PWA
  | "macos"    // Tauri on macOS
  | "windows"  // Tauri on Windows
  | "linux"    // Tauri on Linux
  | "ios"      // Tauri on iOS
  | "android"  // Tauri on Android
  | "unknown"  // Tauri detected but platform call failed

let cached: PallioPlatform | null = null

function compute(): PallioPlatform {
  if (!isTauri()) return "web"
  try {
    // platform() is synchronous in Tauri 2 — it reads a value the
    // Rust core injects into the WebView at startup.
    const p = platform() as PallioPlatform
    return p === "macos" || p === "windows" || p === "linux" || p === "ios" || p === "android"
      ? p
      : "unknown"
  } catch { return "unknown" }
}

export function getPlatform(): PallioPlatform {
  if (cached === null) cached = compute()
  return cached
}

// "Real mobile" = Tauri shell running on iOS or Android. NOT a phone
// browser viewing the PWA — that's still "web" for splash purposes
// because there's no OS-level launch screen to defer to.
export function isTauriMobile(): boolean {
  const p = getPlatform()
  return p === "ios" || p === "android"
}

export function isTauriDesktop(): boolean {
  const p = getPlatform()
  return p === "macos" || p === "windows" || p === "linux"
}

export function isWeb(): boolean {
  return getPlatform() === "web"
}
