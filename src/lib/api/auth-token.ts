import { kv } from "@/lib/storage/kv"

// Token store for the future real-backend integration.
//
// Design (cribbed from sleekr's split-storage pattern):
//   * Access token lives in memory only — never written to storage.
//     Lifetime is one tab session; lost on reload, which is fine
//     because we refresh from the refresh token on app boot.
//   * Refresh token lives in kv (localStorage + @capacitor/preferences
//     mirror from Wave 22.1) so it survives reloads and reinstalls.
//     This is acceptable for a single-device app store on native;
//     once we add httpOnly-cookie refresh for the web build, the kv
//     branch becomes native-only.
//   * `pallio:auth-cleared` window event fires on clear() — App.tsx
//     listens for it to navigate to /login + drop in-flight queries.
//
// Keep this layer purely synchronous on reads — useState initializers
// in App.tsx + the API client read tokens synchronously on every
// request, and a Promise here would force every consumer to be async.

const REFRESH_KEY = "pallio:auth-refresh"

// In-memory access token. Module-scoped so every request goes
// through the same store. Cleared on logout + on 401 from the
// client (the refresh flow re-populates).
let accessToken: string | null = null

export function getAccessToken(): string | null {
  return accessToken
}

export function setAccessToken(token: string | null): void {
  accessToken = token
}

export function getRefreshToken(): string | null {
  return kv.get(REFRESH_KEY)
}

export async function setRefreshToken(token: string | null): Promise<void> {
  if (token == null) {
    await kv.remove(REFRESH_KEY)
    return
  }
  await kv.set(REFRESH_KEY, token)
}

// Drop both tokens + notify the app. Use this from any layer that
// detects unrecoverable auth failure (401 after refresh attempt,
// /me 403, explicit "Log out" button).
export async function clearAuth(): Promise<void> {
  accessToken = null
  await setRefreshToken(null)
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("pallio:auth-cleared"))
  }
}

// True iff we have anything resembling auth state. Used by route
// guards to decide between rendering the app vs redirecting to
// /login. Doesn't validate the token — that's the server's job.
export function hasAuth(): boolean {
  return accessToken != null || getRefreshToken() != null
}
