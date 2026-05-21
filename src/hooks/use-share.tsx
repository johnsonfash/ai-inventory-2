import * as React from "react"
import { shareText } from "@buildyourwebapp/tauri-plugin-sharesheet"
import { isNative, haptic } from "@/hooks/use-native"

export type SharePayload = {
  /** Title — used as the email subject / iOS sheet header. */
  title?: string
  /** Body text. On most targets this is what actually gets shared. */
  text?: string
  /** URL to share. Combined with text on most targets. */
  url?: string
  /** Optional dialog title (iPad share-sheet anchor / Android picker). */
  dialogTitle?: string
}

export type ShareResult =
  | { kind: "shared" }
  | { kind: "copied" }
  | { kind: "cancelled" }
  | { kind: "unavailable" }

// Hook returning a single `share` function. Tries the native sheet
// first (tauri-plugin-sharesheet on Tauri shells; navigator.share on
// the browsers that support it), then falls back to copying the
// URL/text to the clipboard. The return value lets callers surface
// the right toast ("Link copied" vs "Shared").
export function useShare() {
  return React.useCallback(async (payload: SharePayload): Promise<ShareResult> => {
    // Tauri native sheet — opens Android Sharesheet / iOS Share Pane.
    // The plugin's API takes the shareable string as the primary arg,
    // so we build a single combined text from title + text + url.
    if (isNative) {
      try {
        const text = [payload.text, payload.url].filter(Boolean).join("\n").trim()
          || payload.title
          || ""
        if (!text) return { kind: "unavailable" }
        await shareText(text, { title: payload.title, mimeType: "text/plain" })
        haptic.light()
        return { kind: "shared" }
      } catch {
        // User dismissed or platform refused — don't fall back to
        // clipboard on native; the share sheet was the expected
        // affordance and copying would be surprising.
        return { kind: "cancelled" }
      }
    }

    // Web — Safari iOS + recent Chrome support navigator.share.
    if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
      try {
        await navigator.share({ title: payload.title, text: payload.text, url: payload.url })
        return { kind: "shared" }
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") {
          return { kind: "cancelled" }
        }
        // NotAllowedError or other — fall through to clipboard.
      }
    }

    // Clipboard fallback — copy the URL if we have one, otherwise the
    // text. Returns "copied" so the caller shows the right toast.
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
