import * as React from "react"
import { Share } from "@capacitor/share"
import { isNative } from "@/hooks/use-native"
import { haptic } from "@/hooks/use-native"

export type SharePayload = {
  /** Title — used as the email subject / iOS sheet header. */
  title?: string
  /** Body text. On most targets this is what actually gets shared. */
  text?: string
  /** URL to share. Combined with text on most targets. */
  url?: string
  /** Where the iOS share sheet anchors (for iPads). Falls through
   *  to the centre of the screen if omitted. */
  dialogTitle?: string
}

export type ShareResult =
  | { kind: "shared"; activityType?: string }
  | { kind: "copied" }
  | { kind: "cancelled" }
  | { kind: "unavailable" }

// Hook returning a single `share` function. Tries the native sheet
// first (Capacitor on native, navigator.share on the few browsers
// that support it), then falls back to copying the URL/text to the
// clipboard. The return value lets callers surface the right toast
// ("Link copied" vs "Shared").
export function useShare() {
  return React.useCallback(async (payload: SharePayload): Promise<ShareResult> => {
    // Native sheet — covers iOS + Android with one path.
    if (isNative) {
      try {
        const res = await Share.share({
          title: payload.title,
          text: payload.text,
          url: payload.url,
          dialogTitle: payload.dialogTitle ?? payload.title,
        })
        haptic.light()
        return { kind: "shared", activityType: res.activityType }
      } catch {
        // User dismissed or the platform refused. We don't fall back
        // to clipboard on native — the platform sheet was the
        // expected affordance and copying would be surprising.
        return { kind: "cancelled" }
      }
    }

    // Web — Safari iOS + recent Chrome support navigator.share.
    if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
      try {
        await navigator.share({ title: payload.title, text: payload.text, url: payload.url })
        return { kind: "shared" }
      } catch (err) {
        // AbortError = user cancelled the picker.
        if (err instanceof Error && err.name === "AbortError") {
          return { kind: "cancelled" }
        }
        // NotAllowedError happens when called outside a user gesture
        // (some browsers are strict). Fall through to clipboard.
      }
    }

    // Clipboard fallback — copy the URL if we have one, otherwise
    // the text. Always returns "copied" so callers show the right
    // confirmation.
    const text = payload.url ?? payload.text ?? ""
    if (!text) return { kind: "unavailable" }
    try {
      await navigator.clipboard.writeText(text)
      return { kind: "copied" }
    } catch {
      return { kind: "unavailable" }
    }
  }, [])
}
