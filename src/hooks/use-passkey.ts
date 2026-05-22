import * as React from "react"
import { isNative } from "@/hooks/use-native"
import {
  isPlatformAuthenticatorAvailable,
  registerPlatformCredential,
  assertPlatformCredential,
  clearStoredCredential,
} from "@/lib/webauthn"

// Web-only passkey API. Tauri desktop / iOS / Android route through
// use-biometric.tsx instead (which uses the same WebAuthn core on
// desktop, the native biometric plugin on mobile) — so this hook is
// strictly the *web browser* surface.
//
// Shape mirrors use-biometric so the Settings + Login pages can pick
// the right hook by platform without restructuring.

export type PasskeyAvailability = {
  available: boolean
  /** True if the browser also supports conditional-mediation autofill —
   *  lets us hint passkeys directly in the email field. */
  conditional: boolean
}

export async function isAvailable(): Promise<PasskeyAvailability> {
  // Strictly web. Tauri (mobile or desktop) uses use-biometric so the
  // OS prompt fires through the right surface.
  if (isNative) return { available: false, conditional: false }

  const ok = await isPlatformAuthenticatorAvailable()
  if (!ok) return { available: false, conditional: false }

  let conditional = false
  try {
    const cond = (window.PublicKeyCredential as unknown as {
      isConditionalMediationAvailable?: () => Promise<boolean>
    }).isConditionalMediationAvailable?.()
    conditional = !!(await cond)
  } catch { /* not supported */ }

  return { available: true, conditional }
}

export function usePasskey(): PasskeyAvailability & { ready: boolean } {
  const [state, setState] = React.useState<PasskeyAvailability & { ready: boolean }>(
    () => ({ available: false, conditional: false, ready: false }),
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

export async function register(displayName: string): Promise<{ ok: true; credentialId: string } | { ok: false; reason: string }> {
  if (isNative) return { ok: false, reason: "unsupported" }
  const res = await registerPlatformCredential(displayName)
  if (res.ok) return res
  return { ok: false, reason: res.reason }
}

export async function verify(): Promise<boolean> {
  if (isNative) return false
  return assertPlatformCredential()
}

export function unregister(): void {
  if (isNative) return
  clearStoredCredential()
}

// localStorage flag for the "Sign in with passkey" toggle. Same
// naming convention as biometric-lock so they line up in storage
// inspectors.
export const PASSKEY_LOGIN_KEY = "pallio:passkey-login"

export function isPasskeyLoginEnabled(): boolean {
  try { return localStorage.getItem(PASSKEY_LOGIN_KEY) === "1" } catch { return false }
}

export function setPasskeyLoginEnabled(enabled: boolean): void {
  try {
    if (enabled) localStorage.setItem(PASSKEY_LOGIN_KEY, "1")
    else localStorage.removeItem(PASSKEY_LOGIN_KEY)
  } catch { /* private mode / quota */ }
}

// "Biometric Login" flag — when ON, the /login page shows the
// biometric button. Lives next to the passkey flag so the Settings
// page can present them as a matched pair.
export const BIOMETRIC_LOGIN_KEY = "pallio:biometric-login"

export function isBiometricLoginEnabled(): boolean {
  try { return localStorage.getItem(BIOMETRIC_LOGIN_KEY) === "1" } catch { return false }
}

export function setBiometricLoginEnabled(enabled: boolean): void {
  try {
    if (enabled) localStorage.setItem(BIOMETRIC_LOGIN_KEY, "1")
    else localStorage.removeItem(BIOMETRIC_LOGIN_KEY)
  } catch { /* private mode / quota */ }
}
