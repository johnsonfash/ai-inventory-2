import { LazyStore } from "@tauri-apps/plugin-store"
import { isTauri } from "@tauri-apps/api/core"

// Durable key/value store — same shape as before, now backed by
// Tauri's store plugin instead of Capacitor Preferences.
//
// Design (unchanged from the Capacitor era — public API is identical
// so call sites in src/lib/pos/storage.ts and team chat keep working):
//   * Reads are SYNCHRONOUS — backed by localStorage. The async
//     `hydrate()` step at app start copies any keys present in the
//     Tauri store but missing from localStorage back in, so reads
//     after hydration see the full set.
//   * Writes are ASYNC — go to BOTH layers. On web, only the
//     localStorage write matters; the Tauri store is a no-op there.
//     Errors are swallowed.
//   * Removes are async and clear both layers.

const isNative = isTauri()

// Lazy-instantiated Tauri store handle. Created on first use so the
// web build never touches Tauri APIs.
const tauriStore = isNative
  ? new LazyStore("pallio-kv.json", { defaults: {}, autoSave: true })
  : null

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
  get(key: string): string | null {
    return ls.get(key)
  },

  async set(key: string, value: string): Promise<void> {
    ls.set(key, value)
    if (tauriStore) {
      try { await tauriStore.set(key, value) } catch { /* ignore */ }
    }
  },

  async remove(key: string): Promise<void> {
    ls.remove(key)
    if (tauriStore) {
      try { await tauriStore.delete(key) } catch { /* ignore */ }
    }
  },

  // Mount once at app entry (before any consumer reads). Walks every
  // store key, and for each one missing from localStorage, seeds
  // localStorage with the persisted value. This is the "post-reinstall
  // recovery" path on Android / iOS and protects against WKWebView
  // local-storage eviction.
  //
  // On web this is a no-op.
  async hydrate(): Promise<void> {
    if (!tauriStore) return
    try {
      const keys = await tauriStore.keys()
      await Promise.all(keys.map(async (key) => {
        if (ls.get(key) != null) return // localStorage already has it
        try {
          const value = await tauriStore.get<string>(key)
          if (value != null) ls.set(key, value)
        } catch { /* ignore individual key failures */ }
      }))
    } catch {
      /* store.keys() failed — proceed without hydration */
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
