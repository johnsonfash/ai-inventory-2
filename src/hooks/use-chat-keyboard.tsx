import * as React from "react"
import { isNative } from "@/hooks/use-native"

// ---- Cached keyboard height ----
// Used to preset the composer offset before the visualViewport listener
// has had a chance to fire. Reduces fallback-then-correct jumps on
// first focus.

const STORAGE_KEY = "pallio:chat-kb-height"
const DEFAULT_HEIGHT = 291 // iPhone portrait + predictive bar
const TOLERANCE = 6 // px — ignore tiny jitters between keyboards

export function getCachedKbHeight(): number {
  if (typeof localStorage === "undefined") return DEFAULT_HEIGHT
  try {
    const v = parseInt(localStorage.getItem(STORAGE_KEY) || "", 10)
    if (Number.isFinite(v) && v > 100 && v < 800) return v
  } catch {
    /* private mode / quota */
  }
  return DEFAULT_HEIGHT
}

function persistKbHeight(h: number) {
  try { localStorage.setItem(STORAGE_KEY, String(h)) } catch { /* ignore */ }
}

// ---- visualViewport-based keyboard detection ----
// Tauri 2 doesn't ship a Capacitor-style Keyboard plugin. The native
// webviews already fire `visualViewport` resize events when the IME
// shows/hides, so we use that — works on iOS WKWebView (16.4+),
// Android Chromium WebView, and every modern browser. Returns the
// keyboard height in CSS pixels.
//
// The `viewport-fit=cover` + `interactive-widget=resizes-content`
// meta config in index.html keeps the visual viewport from auto-
// scrolling when the keyboard opens, so we can use the height
// delta as the IME size.
function getKeyboardHeight(): number {
  if (typeof window === "undefined") return 0
  const vv = window.visualViewport
  if (!vv) return 0
  const delta = window.innerHeight - vv.height
  if (delta > 100 && delta < 800) return Math.round(delta)
  return 0
}

// Cache-only listener. Mount once near the top of the tree (App.tsx)
// so the kb-height cache populates from the first input focus.
//
// No-op on desktop / web with no visualViewport (extremely rare).
export function useKeyboardHeightCapture(): void {
  React.useEffect(() => {
    if (typeof window === "undefined") return
    const vv = window.visualViewport
    if (!vv) return

    const onResize = () => {
      const h = getKeyboardHeight()
      if (h === 0) return
      const cached = getCachedKbHeight()
      if (Math.abs(h - cached) < TOLERANCE) return
      persistKbHeight(h)
    }

    vv.addEventListener("resize", onResize)
    return () => vv.removeEventListener("resize", onResize)
  }, [])
}

type Bindings = {
  /** True only inside the Tauri shell (mobile or desktop). Browsers
   *  on desktop also use the visualViewport path but skip the layout
   *  override since the browser handles it. */
  isNative: boolean
  /** Last measured keyboard height (CSS px). 0 when no keyboard. */
  kbHeight: number
  /** True while a child of the composer zone holds focus. */
  composerFocused: boolean
  /** Spread on the composer wrapper. Picks up focus/blur from any
   *  child input via onFocus/onBlur (synthetic React bubbling). */
  composerZoneProps: {
    className: string
    onFocus: React.FocusEventHandler<HTMLDivElement>
    onBlur: React.FocusEventHandler<HTMLDivElement>
  }
  /** Ref to attach to the scroll container holding the messages.
   *  A ResizeObserver re-snaps to the bottom when the container
   *  shrinks (composer focus pushing it up) — but only if the user
   *  was already at the bottom. Scrolling up to read history is
   *  preserved. */
  scrollContainerRef: React.RefObject<HTMLDivElement | null>
}

// Reusable chat-keyboard plumbing. Mount once per chat-style page.
//
// On Tauri mobile + every browser, this uses `window.visualViewport`
// to detect the IME height — no native plugin required.
export function useChatKeyboard(): Bindings {
  const [kbHeight, setKbHeight] = React.useState<number>(() => getCachedKbHeight())
  const [composerFocused, setComposerFocused] = React.useState(false)

  const scrollContainerRef = React.useRef<HTMLDivElement | null>(null)
  const isAtBottomRef = React.useRef(true)

  // Track "is the user near the bottom"
  React.useEffect(() => {
    const el = scrollContainerRef.current
    if (!el) return
    const onScroll = () => {
      const distance = el.scrollHeight - el.scrollTop - el.clientHeight
      isAtBottomRef.current = distance < 50
    }
    el.addEventListener("scroll", onScroll, { passive: true })
    return () => el.removeEventListener("scroll", onScroll)
  }, [])

  // ResizeObserver: when the messages container shrinks (composer
  // focus → outer padding grows), re-snap to bottom if user was there.
  React.useEffect(() => {
    const container = scrollContainerRef.current
    if (!container) return
    let prevHeight = container.clientHeight
    const ro = new ResizeObserver(() => {
      const newHeight = container.clientHeight
      if (newHeight < prevHeight && isAtBottomRef.current) {
        container.scrollTop = container.scrollHeight
      }
      prevHeight = newHeight
    })
    ro.observe(container)
    return () => ro.disconnect()
  }, [])

  // Track keyboard height via visualViewport (works in webview + web).
  React.useEffect(() => {
    if (typeof window === "undefined") return
    const vv = window.visualViewport
    if (!vv) return

    const onResize = () => {
      const h = getKeyboardHeight()
      setKbHeight((prev) => (Math.abs(h - prev) < TOLERANCE ? prev : h || prev))
      if (h > 0) persistKbHeight(h)
    }
    vv.addEventListener("resize", onResize)
    return () => vv.removeEventListener("resize", onResize)
  }, [])

  // Focus / blur handlers — use synthetic React events. The bubbling
  // covers nested inputs / contentEditables.
  const handleFocus = React.useCallback(() => setComposerFocused(true), [])
  const handleBlur = React.useCallback<React.FocusEventHandler<HTMLDivElement>>(() => {
    setTimeout(() => {
      const ae = document.activeElement
      if (!ae || !ae.closest(".pallio-composer-zone")) {
        setComposerFocused(false)
      }
    }, 0)
  }, [])

  // On desktop browsers / desktop Tauri, the browser handles keyboard
  // inset itself; we keep kbHeight at 0 so the composer doesn't shift.
  // The mobile native shell + mobile browsers still benefit from the
  // visualViewport-driven height tracking above.
  return {
    isNative,
    kbHeight,
    composerFocused,
    composerZoneProps: {
      className: "pallio-composer-zone",
      onFocus: handleFocus,
      onBlur: handleBlur,
    },
    scrollContainerRef,
  }
}
