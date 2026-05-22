import * as React from "react"
import {
  checkStatus,
  authenticate,
  BiometryType,
  type Status,
} from "@tauri-apps/plugin-biometric"
import { isNative } from "@/hooks/use-native"
import {
  isPlatformAuthenticatorAvailable,
  registerPlatformCredential,
  assertPlatformCredential,
  clearStoredCredential,
  hasStoredCredential,
} from "@/lib/webauthn"

// Unified biometric API. Branches by Tauri platform under the hood:
//
//   * Tauri mobile (iOS / Android) → @tauri-apps/plugin-biometric
//     (native Face ID / Touch ID / fingerprint sheet)
//   * Tauri desktop (macOS / Windows / Linux) → WebAuthn platform
//     authenticator (Touch ID on Mac, Windows Hello on Win, fprintd
//     on Linux where available)
//   * Web browser → not exposed here; web uses use-passkey.ts
//
// Callers (login button, settings toggle, biometric-lock gate) just
// see one API: isAvailable / register / verify / unregister. The
// branch is invisible — same UI, same UX, right tech per platform.

export type BiometryAvailability = {
  available: boolean
  /** "face" | "touch" | "fingerprint" | "none" — best-effort label
   *  the UI uses to label the toggle ("Use Face ID to unlock"). On
   *  desktop the label is platform-derived (macOS → touch, Windows →
   *  fingerprint) since the WebAuthn API doesn't tell us which
   *  modality the user enrolled. */
  type: "face" | "touch" | "fingerprint" | "none"
}

// Lazy cached Tauri platform string. `platform()` from
// @tauri-apps/plugin-os is synchronous in Tauri 2 but the dynamic
// import keeps this file loadable on web (the os plugin module isn't
// in the web bundle's runtime path).
let cachedPlatform: string | null | undefined
async function getTauriPlatform(): Promise<string | null> {
  if (cachedPlatform !== undefined) return cachedPlatform
  if (!isNative) { cachedPlatform = null; return null }
  try {
    const mod = await import("@tauri-apps/plugin-os")
    cachedPlatform = mod.platform()
    return cachedPlatform
  } catch {
    cachedPlatform = null
    return null
  }
}

function isMobilePlatform(plat: string | null): boolean {
  return plat === "ios" || plat === "android"
}
function isDesktopPlatform(plat: string | null): boolean {
  return plat === "macos" || plat === "windows" || plat === "linux"
}

function labelForMobile(status: Status): BiometryAvailability["type"] {
  switch (status.biometryType) {
    case BiometryType.TouchID:    return "touch"
    case BiometryType.FaceID:     return "face"
    case BiometryType.Iris:       return "face"
    default:                      return status.isAvailable ? "fingerprint" : "none"
  }
}

// Desktop label is platform-derived since WebAuthn doesn't expose the
// actual modality. Best guess: macOS = Touch ID; Windows = Hello
// (fingerprint copy fits the usual setup); Linux = generic.
function labelForDesktop(plat: string): BiometryAvailability["type"] {
  if (plat === "macos")   return "touch"
  if (plat === "windows") return "fingerprint"
  return "fingerprint"
}

export async function isAvailable(): Promise<BiometryAvailability> {
  if (!isNative) return { available: false, type: "none" }
  const plat = await getTauriPlatform()

  if (isMobilePlatform(plat)) {
    try {
      const status = await checkStatus()
      return { available: !!status.isAvailable, type: labelForMobile(status) }
    } catch {
      return { available: false, type: "none" }
    }
  }

  if (isDesktopPlatform(plat)) {
    const ok = await isPlatformAuthenticatorAvailable()
    return { available: ok, type: ok ? labelForDesktop(plat!) : "none" }
  }

  return { available: false, type: "none" }
}

// Enrol the device — runs the WebAuthn registration ceremony on
// desktop (real Touch ID / Hello prompt). On mobile the plugin's
// `authenticate()` is itself the proof of enrolment + capability, so
// register() just confirms the user can authenticate.
export async function register(displayName: string): Promise<boolean> {
  if (!isNative) return false
  const plat = await getTauriPlatform()

  if (isMobilePlatform(plat)) {
    return verify("Confirm to enable biometric sign-in")
  }
  if (isDesktopPlatform(plat)) {
    const res = await registerPlatformCredential(displayName)
    return res.ok
  }
  return false
}

export async function verify(reason: string): Promise<boolean> {
  if (!isNative) return false
  const plat = await getTauriPlatform()

  if (isMobilePlatform(plat)) {
    try {
      await authenticate(reason, {
        title: "Pallio",
        subtitle: reason,
        allowDeviceCredential: true,
      })
      return true
    } catch {
      return false
    }
  }

  if (isDesktopPlatform(plat)) {
    return assertPlatformCredential()
  }

  return false
}

// Wipe any stored desktop credential. Mobile has nothing to clear
// (the biometric plugin doesn't persist anything we control); the
// no-op there is intentional.
export async function unregister(): Promise<void> {
  if (!isNative) return
  const plat = await getTauriPlatform()
  if (isDesktopPlatform(plat)) clearStoredCredential()
}

// True if a credential is on file (or the platform implicitly is
// always "enrolled" — i.e. mobile, where the plugin handles enrolment
// transparently). Used to decide whether the Settings toggle should
// flip ON without re-prompting.
export async function isEnrolled(): Promise<boolean> {
  if (!isNative) return false
  const plat = await getTauriPlatform()
  if (isMobilePlatform(plat)) return (await isAvailable()).available
  if (isDesktopPlatform(plat)) return hasStoredCredential()
  return false
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
