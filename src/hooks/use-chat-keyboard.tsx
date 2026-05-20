import * as React from "react"
import { Keyboard, KeyboardResize } from "@capacitor/keyboard"
import { App as CapApp } from "@capacitor/app"
import { isNative } from "@/hooks/use-native"

// ---- Cached keyboard height ----
// The first focus of a session can fire before iOS reports the
// keyboard height. To avoid a fallback-then-correct jump we keep the
// last seen height in localStorage; chat pages preset the composer
// offset to this value before the listener has had a chance to fire.

const STORAGE_KEY = "pallio:chat-kb-height"
const DEFAULT_HEIGHT = 291 // iPhone portrait + predictive bar
const TOLERANCE = 6 // px — ignore tiny jitters between keyboards

export function getCachedKbHeight(): number {
  if (typeof localStorage === "undefined") return DEFAULT_HEIGHT
  try {
    const v = parseInt(localStorage.getItem(STORAGE_KEY) || "", 10)
    if (Number.isFinite(v) && v > 100 && v < 800) return v
  } catch {
    /* private mode / quota — fall through */
  }
  return DEFAULT_HEIGHT
}

function persistKbHeight(h: number) {
  try { localStorage.setItem(STORAGE_KEY, String(h)) } catch { /* ignore */ }
}

type Bindings = {
  /** True only on native (iOS/Android). */
  isNative: boolean
  /** Last measured keyboard height — falls back to cached/default. */
  kbHeight: number
  /** True while a child of the composer zone holds focus. */
  composerFocused: boolean
  /** Spread on the composer wrapper. Picks up focus/blur from any
   *  child input via focusin/focusout (which bubble through
   *  contentEditable, unlike onFocus/onBlur). Also tags the element
   *  with a sentinel class the blur handler uses to ignore intra-zone
   *  focus moves. */
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
// What this does on native (no-op on web):
//   1. Switches Capacitor's keyboard resize mode to `None` for the
//      lifetime of the page. The app default is `Native`, which would
//      stack on top of our padding-bottom and double-shift the
//      composer. Restored to `Native` on unmount.
//   2. Tracks `kbHeight` from `keyboardWillShow` events (clamped + de-
//      duped) so the page can compose its own bottom-padding.
//   3. Tracks `composerFocused` via focusin/focusout — bubbles through
//      contentEditables and textarea wrappers, unlike onFocus/onBlur.
//      A focus move between siblings inside the composer zone (e.g.
//      input → emoji toggle) doesn't drop focused state.
//   4. Auto-scrolls the messages container to the bottom when the
//      container shrinks while `composerFocused` is true and the user
//      was already at the bottom (within 50 px).
//   5. Drops `composerFocused` when the app backgrounds (via
//      `appStateChange`) so the layout returns to rest on resume.
//
// Typical usage in a chat page:
//
//   const kb = useChatKeyboard()
//   return (
//     <div style={{ paddingBottom: kb.composerFocused ? kb.kbHeight : 0 }}>
//       <div ref={kb.scrollContainerRef}>{...messages}</div>
//       <div {...kb.composerZoneProps}><input ... /></div>
//     </div>
//   )
export function useChatKeyboard(): Bindings {
  const [kbHeight, setKbHeight] = React.useState<number>(() => getCachedKbHeight())
  const [composerFocused, setComposerFocused] = React.useState(false)

  // Mirror state into a ref so the keyboard listener can read the
  // current height without re-binding on every change (which would
  // briefly tear down + re-attach mid-show).
  const kbHeightLiveRef = React.useRef(kbHeight)
  React.useEffect(() => { kbHeightLiveRef.current = kbHeight }, [kbHeight])

  const scrollContainerRef = React.useRef<HTMLDivElement | null>(null)
  // Track "is the user near the bottom" so the ResizeObserver below
  // only auto-scrolls when they were already there.
  const isAtBottomRef = React.useRef(true)

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

  // Native keyboard listeners + height cache.
  React.useEffect(() => {
    if (!isNative) return
    const subs: { remove: () => void }[] = []
    Keyboard.addListener("keyboardWillShow", (info) => {
      const h = info.keyboardHeight
      if (h <= 100 || h >= 800) return
      if (Math.abs(h - kbHeightLiveRef.current) < TOLERANCE) return
      setKbHeight(h)
      persistKbHeight(h)
    }).then((s) => subs.push(s)).catch(() => { /* ignore */ })
    Keyboard.addListener("keyboardWillHide", () => setComposerFocused(false))
      .then((s) => subs.push(s)).catch(() => { /* ignore */ })
    Keyboard.addListener("keyboardDidHide", () => setComposerFocused(false))
      .then((s) => subs.push(s)).catch(() => { /* ignore */ })
    CapApp.addListener("appStateChange", (state) => {
      if (!state.isActive) setComposerFocused(false)
    }).then((s) => subs.push(s)).catch(() => { /* ignore */ })
    return () => { subs.forEach((s) => s.remove()) }
  }, [])

  // Take over keyboard-driven layout from iOS while on this page. The
  // app default is `KeyboardResize.Native`, which would stack on top
  // of our padding-bottom and double-shift the composer. Switching
  // to None lets the padding-bottom be the sole source of truth.
  React.useEffect(() => {
    if (!isNative) return
    Keyboard.setResizeMode({ mode: KeyboardResize.None }).catch(() => { /* ignore */ })
    return () => {
      Keyboard.setResizeMode({ mode: KeyboardResize.Native }).catch(() => { /* ignore */ })
    }
  }, [])

  // focusin/focusout (vs onFocus/onBlur) so the wrapper notices
  // focus moves through a contentEditable / textarea descendant.
  const handleFocus = React.useCallback(() => setComposerFocused(true), [])
  const handleBlur = React.useCallback<React.FocusEventHandler<HTMLDivElement>>(() => {
    // Defer so a focus move between siblings inside the zone (input
    // → action button → emoji toggle) doesn't briefly drop the
    // keyboard offset.
    setTimeout(() => {
      const ae = document.activeElement
      if (!ae || !ae.closest(".pallio-composer-zone")) {
        setComposerFocused(false)
      }
    }, 0)
  }, [])

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
