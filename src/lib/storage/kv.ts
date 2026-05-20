import { Preferences } from "@capacitor/preferences"
import { Capacitor } from "@capacitor/core"

// Durable key/value store. Designed for the handful of localStorage
// call sites that genuinely matter to preserve across app reinstalls
// + WebView eviction (POS drafts/invoices/returns, team chat). The
// shim is intentionally small — purely-ephemeral flags (theme,
// "install prompt dismissed", kb-height cache) keep using
// localStorage directly because they auto-recover on next session
// and the migration noise isn't worth it.
//
// Design
//   * Reads are SYNCHRONOUS — backed by localStorage. The async
//     `hydrate()` step at app start copies any keys present in
//     Preferences but missing from localStorage back in, so reads
//     after hydration see the full set.
//   * Writes are ASYNC — go to BOTH layers. On web, only the
//     localStorage write matters; Preferences is a no-op there.
//     Errors are swallowed (private mode + quota are not actionable
//     at the call site).
//   * Removes are async and clear both layers.
//
// This keeps the existing sync API surface in src/lib/pos/storage.ts
// and team chat untouched (`listDrafts()`, etc.) while adding native
// durability behind the scenes. Trade-off: a write that doesn't
// complete before a hard kill won't make it to Preferences. That's
// acceptable for the use cases (next sync from localStorage on the
// same device is the typical path; reinstall recovery is the edge).

const isNativeCap = Capacitor.isNativePlatform()

const ls = {
  get(key: string): string | null {
    if (typeof localStorage === "undefined") return null
    try { return localStorage.getItem(key) } catch { return null }
  },
  set(key: string, value: string): void {
    if (typeof localStorage === "undefined") return
    try { localStorage.setItem(key, value) } catch { /* quota / private */ }
  },
  remove(key: string): void {
    if (typeof localStorage === "undefined") return
    try { localStorage.removeItem(key) } catch { /* ignore */ }
  },
}

export const kv = {
  // Sync read. Always served from localStorage — fast, no Promise
  // ceremony at the call site. If you're reading right after a write
  // from the same session, you'll see the write.
  get(key: string): string | null {
    return ls.get(key)
  },

  // Async write. Mirrors to both layers; errors are swallowed.
  // Callers don't need to await this unless they want to read it
  // back from a different layer immediately.
  async set(key: string, value: string): Promise<void> {
    ls.set(key, value)
    if (isNativeCap) {
      try { await Preferences.set({ key, value }) } catch { /* ignore */ }
    }
  },

  async remove(key: string): Promise<void> {
    ls.remove(key)
    if (isNativeCap) {
      try { await Preferences.remove({ key }) } catch { /* ignore */ }
    }
  },

  // Mount once at app entry (before any consumer reads). Walks
  // every Preferences key, and for each one that's missing from
  // localStorage (or is empty), seeds localStorage with the
  // Preferences value. This is the "post-reinstall recovery" path
  // on Android and protects against WKWebView local-storage eviction
  // on iOS.
  //
  // On web this is a no-op (Preferences falls back to a noop adapter
  // when not in a native context).
  async hydrate(): Promise<void> {
    if (!isNativeCap) return
    try {
      const { keys } = await Preferences.keys()
      await Promise.all(keys.map(async (key) => {
        if (ls.get(key) != null) return // localStorage already has it
        try {
          const { value } = await Preferences.get({ key })
          if (value != null) ls.set(key, value)
        } catch { /* ignore individual key failures */ }
      }))
    } catch {
      /* Preferences.keys() failed — proceed without hydration */
    }
  },
}

// Helper for the common JSON pattern. Reads are sync, writes are
// async — same shape as `kv` but pre-stringified for callers that
// always want JSON.
export const kvJson = {
  get<T>(key: string): T | null {
    const raw = kv.get(key)
    if (raw == null) return null
    try { return JSON.parse(raw) as T } catch { return null }
  },
  async set<T>(key: string, value: T): Promise<void> {
    await kv.set(key, JSON.stringify(value))
  },
  remove(key: string): Promise<void> {
    return kv.remove(key)
  },
}
