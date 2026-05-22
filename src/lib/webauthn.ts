// Shared WebAuthn platform-authenticator helpers. Both the web
// passkey flow (use-passkey.ts) and the Tauri-desktop biometric flow
// (use-biometric.tsx) call into this — the underlying ceremony is
// identical, only the branding / button label differs per context.
//
// macOS WKWebView    → triggers Touch ID
// Windows WebView2   → triggers Windows Hello (PIN / fingerprint / face)
// Linux WebKitGTK    → triggers PAM / fprintd if available
// Browser            → standard passkey UX (synced via iCloud Keychain /
//                       Google Password Manager / Edge Password Manager)
//
// MOCK-ish: we run a real WebAuthn ceremony — `navigator.credentials.
// create()` for registration, `.get()` for sign-in — so on every
// supporting platform the OS prompt actually fires. The challenge is
// generated client-side instead of from a backend (no backend yet);
// when the real auth API lands, swap the challenge source for a
// server-issued one and forward the assertion for verification.

const CRED_ID_KEY = "pallio.webauthn.credentialId"
const USER_HANDLE_KEY = "pallio.webauthn.userHandle"

// Detect whether THIS device exposes a platform authenticator (Touch
// ID / Windows Hello / Android fingerprint). Doesn't actually prompt;
// just reports capability. Safe to call on web + Tauri.
export async function isPlatformAuthenticatorAvailable(): Promise<boolean> {
  if (typeof window === "undefined" || !("PublicKeyCredential" in window)) return false
  try {
    const ok = await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable?.()
    return !!ok
  } catch {
    return false
  }
}

// Random N bytes returned as a fresh ArrayBuffer. WebAuthn's
// `challenge` + `user.id` fields are typed `BufferSource`, but TS's
// strict view of `Uint8Array<ArrayBufferLike>` doesn't narrow to
// `ArrayBuffer` (it allows SharedArrayBuffer). Returning the buffer
// directly skirts the variance issue without runtime cost.
function randomBytes(n: number): ArrayBuffer {
  const view = new Uint8Array(n)
  crypto.getRandomValues(view)
  return view.buffer
}

function b64urlEncode(buf: ArrayBuffer | Uint8Array): string {
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf)
  let s = ""
  for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i])
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "")
}

function b64urlDecode(s: string): ArrayBuffer {
  const std = s.replace(/-/g, "+").replace(/_/g, "/").padEnd(s.length + ((4 - (s.length % 4)) % 4), "=")
  const raw = atob(std)
  const view = new Uint8Array(raw.length)
  for (let i = 0; i < raw.length; i++) view[i] = raw.charCodeAt(i)
  return view.buffer
}

// Use the page's own hostname as the Relying Party ID — works for
// localhost dev, tauri.localhost prod, and pallio.app web. Production
// would pin to "pallio.app" so credentials are portable across
// subdomains; mock build follows the origin so we don't need explicit
// config per environment.
function rpId(): string {
  if (typeof window === "undefined") return "localhost"
  // hostname only — port + protocol are excluded from rpID by spec
  return window.location.hostname || "localhost"
}

export type WebAuthnRegisterResult =
  | { ok: true; credentialId: string }
  | { ok: false; reason: "unsupported" | "cancelled" | "error"; detail?: string }

// Run the full WebAuthn registration ceremony. On success persists
// the credential ID + user handle so subsequent verify() calls know
// which credential to ask for.
export async function registerPlatformCredential(displayName: string): Promise<WebAuthnRegisterResult> {
  if (!(await isPlatformAuthenticatorAvailable())) return { ok: false, reason: "unsupported" }

  const userHandle = randomBytes(16)
  try {
    const cred = await navigator.credentials.create({
      publicKey: {
        challenge: randomBytes(32),
        rp: { name: "Pallio", id: rpId() },
        user: {
          id: userHandle,
          name: displayName,
          displayName,
        },
        // ES256 (most platform authenticators) + RS256 (Windows
        // Hello fallback). Order matters — first preferred.
        pubKeyCredParams: [
          { type: "public-key", alg: -7 },
          { type: "public-key", alg: -257 },
        ],
        authenticatorSelection: {
          authenticatorAttachment: "platform",
          userVerification: "required",
          residentKey: "preferred",
          requireResidentKey: false,
        },
        timeout: 60_000,
        attestation: "none",
      },
    })
    if (!cred) return { ok: false, reason: "error", detail: "no-credential" }

    const credentialId = b64urlEncode((cred as PublicKeyCredential).rawId)
    try {
      localStorage.setItem(CRED_ID_KEY, credentialId)
      localStorage.setItem(USER_HANDLE_KEY, b64urlEncode(userHandle))
    } catch { /* private mode */ }
    return { ok: true, credentialId }
  } catch (e: unknown) {
    const name = (e as { name?: string })?.name || ""
    if (name === "NotAllowedError" || name === "AbortError") return { ok: false, reason: "cancelled" }
    return { ok: false, reason: "error", detail: name }
  }
}

// Run the WebAuthn assertion (sign-in) ceremony. Returns true on
// successful verification, false on cancel / no-credential / failure.
// Caller is responsible for forwarding to whatever post-auth step
// they need.
export async function assertPlatformCredential(): Promise<boolean> {
  if (!(await isPlatformAuthenticatorAvailable())) return false
  const credentialId = (() => { try { return localStorage.getItem(CRED_ID_KEY) } catch { return null } })()
  if (!credentialId) return false

  try {
    const cred = await navigator.credentials.get({
      publicKey: {
        challenge: randomBytes(32),
        rpId: rpId(),
        allowCredentials: [
          { type: "public-key", id: b64urlDecode(credentialId) },
        ],
        userVerification: "required",
        timeout: 60_000,
      },
    })
    return !!cred
  } catch {
    return false
  }
}

// Wipe the stored credential — called from Settings when the user
// turns biometric / passkey sign-in OFF. Real backend would also
// revoke the credential server-side.
export function clearStoredCredential(): void {
  try {
    localStorage.removeItem(CRED_ID_KEY)
    localStorage.removeItem(USER_HANDLE_KEY)
  } catch { /* private mode */ }
}

export function hasStoredCredential(): boolean {
  try { return !!localStorage.getItem(CRED_ID_KEY) } catch { return false }
}
