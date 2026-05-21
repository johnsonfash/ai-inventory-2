import * as React from "react"
import { isTauri } from "@tauri-apps/api/core"
import { listen } from "@tauri-apps/api/event"
import {
  impactFeedback,
  notificationFeedback,
} from "@tauri-apps/plugin-haptics"
import { useTWTheme } from "@/components/tw-theme-provider"

// True only inside the native Tauri shell (iOS / Android / desktop).
// Web stays false. Every Tauri plugin call below short-circuits when
// false so the same component tree works in both contexts.
export const isNative = isTauri()

// Mobile-specific helpers are only meaningful on iOS / Android, but
// Tauri's haptics plugin no-ops on desktop so we can call it
// unconditionally without an OS check at the call site.
//
// API note: Tauri's plugin-haptics returns Promises; the functions
// here are fire-and-forget (no await) so the UI never blocks on the
// bridge. Errors are swallowed.
export const haptic = {
  light:   () => { if (isNative) impactFeedback("light").catch(() => {}) },
  medium:  () => { if (isNative) impactFeedback("medium").catch(() => {}) },
  heavy:   () => { if (isNative) impactFeedback("heavy").catch(() => {}) },
  success: () => { if (isNative) notificationFeedback("success").catch(() => {}) },
  warning: () => { if (isNative) notificationFeedback("warning").catch(() => {}) },
  error:   () => { if (isNative) notificationFeedback("error").catch(() => {}) },
}

// ----- Top-level native bootstrap -----
// Mount once at App.tsx level. Handles:
//   * Theme-driven status bar (mobile only; Tauri picks it up via
//     window.setBackgroundColor on desktop and the system bar on
//     iOS / Android follows the body bg).
//   * App resume hook (reserved for future offline-sync flush).
//   * Keyboard handling: relies on CSS `env(keyboard-inset-height)`
//     (iOS 16.4+ / Android Chromium webview) — no JS bridge needed.
//   * Splash screen: Tauri auto-hides once the webview first paints.
export function useNative(): void {
  const { resolvedTheme } = useTWTheme()

  // App lifecycle event (foreground / background). Hook scaffold —
  // wire actual handlers (offline-queue flush, re-fetch, etc.) here
  // when they exist.
  React.useEffect(() => {
    if (!isNative) return
    let unlisten: (() => void) | undefined
    listen("tauri://focus", () => {
      // intentional no-op for now
    }).then((u) => { unlisten = u }).catch(() => {})
    return () => unlisten?.()
  }, [])

  // Theme change hook — reserved for window background sync on
  // desktop (`getCurrentWindow().setBackgroundColor()`) and any
  // mobile status-bar overrides we add later via a custom command.
  React.useEffect(() => {
    if (!isNative) return
    // Theme value available as resolvedTheme — wire when needed.
    void resolvedTheme
  }, [resolvedTheme])
}
