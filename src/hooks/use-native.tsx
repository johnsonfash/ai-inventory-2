import * as React from "react"
import { Capacitor } from "@capacitor/core"
import { StatusBar, Style } from "@capacitor/status-bar"
import { SplashScreen } from "@capacitor/splash-screen"
import { Keyboard } from "@capacitor/keyboard"
import { App as CapApp } from "@capacitor/app"
import { Haptics, ImpactStyle, NotificationType } from "@capacitor/haptics"
import { useTWTheme } from "@/components/tw-theme-provider"

// True only inside the native shell (iOS / Android via Capacitor).
// Web stays false, and every Capacitor call below short-circuits, so
// the same component tree works in both contexts.
export const isNative = Capacitor.isNativePlatform()

// ----- Public haptic helpers -----
// Safe to call anywhere. No-op on web. Don't await them — they're
// fire-and-forget so the UI never blocks on the bridge.
export const haptic = {
  light: () => {
    if (!isNative) return
    Haptics.impact({ style: ImpactStyle.Light }).catch(() => {})
  },
  medium: () => {
    if (!isNative) return
    Haptics.impact({ style: ImpactStyle.Medium }).catch(() => {})
  },
  heavy: () => {
    if (!isNative) return
    Haptics.impact({ style: ImpactStyle.Heavy }).catch(() => {})
  },
  success: () => {
    if (!isNative) return
    Haptics.notification({ type: NotificationType.Success }).catch(() => {})
  },
  warning: () => {
    if (!isNative) return
    Haptics.notification({ type: NotificationType.Warning }).catch(() => {})
  },
  error: () => {
    if (!isNative) return
    Haptics.notification({ type: NotificationType.Error }).catch(() => {})
  },
}

// ----- Top-level native bootstrap -----
// Mount once at App.tsx level. Handles:
//   * Status bar tint follows the active theme.
//   * Splash hides after first paint (config.launchAutoHide = false).
//   * Keyboard show/hide sets a CSS var --keyboard-height so layouts
//     can adapt (e.g. bottom-sticky composers lift over the keyboard).
//   * App resume/pause: re-check theme + flush queued offline writes
//     later (hook is here, no writes yet).
export function useNative(): void {
  const { resolvedTheme } = useTWTheme()

  // Splash hide once on first paint.
  React.useEffect(() => {
    if (!isNative) return
    // Defer one frame so React has actually rendered the first screen.
    const t = requestAnimationFrame(() => {
      SplashScreen.hide().catch(() => {})
    })
    return () => cancelAnimationFrame(t)
  }, [])

  // Status bar style + colour follow the theme.
  React.useEffect(() => {
    if (!isNative) return
    const dark = resolvedTheme === "dark"
    StatusBar.setStyle({ style: dark ? Style.Dark : Style.Light }).catch(() => {})
    StatusBar.setBackgroundColor({ color: dark ? "#0a0a0a" : "#7c3aed" }).catch(() => {})
  }, [resolvedTheme])

  // Keyboard → CSS var so we can offset sticky bottom bars.
  React.useEffect(() => {
    if (!isNative) return
    const onShow = (e: { keyboardHeight: number }) => {
      document.documentElement.style.setProperty("--keyboard-height", `${e.keyboardHeight}px`)
    }
    const onHide = () => {
      document.documentElement.style.setProperty("--keyboard-height", "0px")
    }
    const subs: { remove: () => void }[] = []
    Keyboard.addListener("keyboardWillShow", onShow).then((s) => subs.push(s))
    Keyboard.addListener("keyboardDidShow", onShow).then((s) => subs.push(s))
    Keyboard.addListener("keyboardWillHide", onHide).then((s) => subs.push(s))
    Keyboard.addListener("keyboardDidHide", onHide).then((s) => subs.push(s))
    return () => {
      subs.forEach((s) => s.remove())
    }
  }, [])

  // App-state events (foreground / background) — hook only, no
  // listeners attached yet. When a real backend lands, this is where
  // we'll re-fetch on resume.
  React.useEffect(() => {
    if (!isNative) return
    let removed = false
    let cleanup: (() => void) | null = null
    CapApp.addListener("appStateChange", () => {
      // intentional no-op for now
    }).then((sub) => {
      if (removed) sub.remove()
      else cleanup = () => sub.remove()
    })
    return () => {
      removed = true
      cleanup?.()
    }
  }, [])
}
