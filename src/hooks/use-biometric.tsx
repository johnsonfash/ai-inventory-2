import * as React from "react"
import {
  checkStatus,
  authenticate,
  BiometryType,
  type Status,
} from "@tauri-apps/plugin-biometric"
import { isNative } from "@/hooks/use-native"

// Wraps @tauri-apps/plugin-biometric for the common cases Pallio
// actually needs:
//
//   * isAvailable() — does the device have Face ID / Touch ID /
//     fingerprint set up and enrolled?
//   * verify(reason) — show the native prompt; resolves true on
//     success, false on cancel / fallback / error.
//
// Web is a clean no-op: `isAvailable()` returns
// { available: false, type: "none" } so callers can render a
// disabled toggle / explanatory copy without a runtime guard.

export type BiometryAvailability = {
  available: boolean
  /** "face" | "touch" | "fingerprint" | "none" — best-effort label
   *  the UI uses to label the toggle ("Use Face ID to unlock"). */
  type: "face" | "touch" | "fingerprint" | "none"
}

function labelFor(status: Status): BiometryAvailability["type"] {
  switch (status.biometryType) {
    case BiometryType.TouchID:    return "touch"
    case BiometryType.FaceID:     return "face"
    case BiometryType.Iris:       return "face"  // close enough for label purposes
    // BiometryType.None / unknown → "none"
    default:                      return status.isAvailable ? "fingerprint" : "none"
  }
}

export async function isAvailable(): Promise<BiometryAvailability> {
  if (!isNative) return { available: false, type: "none" }
  try {
    const status = await checkStatus()
    return {
      available: !!status.isAvailable,
      type: labelFor(status),
    }
  } catch {
    return { available: false, type: "none" }
  }
}

export async function verify(reason: string): Promise<boolean> {
  if (!isNative) return false
  try {
    await authenticate(reason, {
      // iOS shows `reason` as the prompt subtitle (under "Pallio").
      // Android uses `title` + `subtitle` separately.
      title: "Pallio",
      subtitle: reason,
      // `allowDeviceCredential: true` lets the user fall back to PIN /
      // pattern / password if biometry isn't enrolled or fails.
      allowDeviceCredential: true,
    })
    return true
  } catch {
    // User cancelled, failed, or biometry wasn't available. We don't
    // distinguish — callers can re-prompt if they want to retry, or
    // fall back to a passcode flow when one exists.
    return false
  }
}

// React-friendly availability hook. Resolves on mount; returns
// { available, type, ready } where `ready` flips true once the
// initial isAvailable() call has resolved (so toggles don't render
// as "available" then flip to disabled).
export function useBiometric(): BiometryAvailability & { ready: boolean } {
  const [state, setState] = React.useState<BiometryAvailability & { ready: boolean }>(
    () => ({ available: false, type: "none", ready: false }),
  )

  React.useEffect(() => {
    let cancelled = false
    isAvailable().then((r) => {
      if (!cancelled) setState({ ...r, ready: true })
    })
    return () => { cancelled = true }
  }, [])

  return state
}

// localStorage key for the "require biometric on app open" toggle.
// Read by the App-level gate; written by the Settings → Security
// page. Stored as "1" / unset so it's safe to misread under any
// failure mode.
export const BIOMETRIC_LOCK_KEY = "pallio:biometric-lock"

export function isBiometricLockEnabled(): boolean {
  try { return localStorage.getItem(BIOMETRIC_LOCK_KEY) === "1" } catch { return false }
}

export function setBiometricLockEnabled(enabled: boolean): void {
  try {
    if (enabled) localStorage.setItem(BIOMETRIC_LOCK_KEY, "1")
    else localStorage.removeItem(BIOMETRIC_LOCK_KEY)
  } catch { /* private mode / quota */ }
}
