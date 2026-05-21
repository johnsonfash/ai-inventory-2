import { isTauri } from "@tauri-apps/api/core"
import { invoke } from "@tauri-apps/api/core"
import { listen, type UnlistenFn } from "@tauri-apps/api/event"

// Thin JS wrapper around the custom `tauri-plugin-pallio-fcm` plugin.
// Returns a no-op shim on web + desktop where push isn't applicable.
//
// IMPORTANT: the underlying Rust commands return Err until the iOS /
// Android side is implemented. See:
//   src-tauri/plugins/pallio-fcm/ios/TODO.md
//   src-tauri/plugins/pallio-fcm/android/TODO.md
//
// Production sequence after the native side ships:
//   1. const token = await push.register()      // grab FCM token
//   2. Send `token` to your backend (/users/me/push-tokens)
//   3. push.onMessage((m) => { /* show in-app banner */ })

export type PushToken = { token: string; platform: "ios" | "android" }
export type PushMessage = {
  title?: string
  body?: string
  data?: Record<string, unknown>
}

export const push = {
  /** Request notification permission + fetch the FCM token. Returns
   *  null on platforms where push is unsupported (web, desktop). */
  async register(): Promise<PushToken | null> {
    if (!isTauri()) return null
    try {
      const result = await invoke<PushToken>("plugin:pallio-fcm|register_for_push")
      return result
    } catch (err) {
      // Expected until the native plugin lands.
      console.warn("[push] register_for_push failed:", err)
      return null
    }
  },

  /** Tear down the FCM token + unsubscribe from topics. */
  async unregister(): Promise<void> {
    if (!isTauri()) return
    try {
      await invoke("plugin:pallio-fcm|unregister")
    } catch {
      /* ignore */
    }
  },

  /** Subscribe to incoming push messages. Returns an unsubscribe fn. */
  async onMessage(cb: (msg: PushMessage) => void): Promise<UnlistenFn | (() => void)> {
    if (!isTauri()) return () => {}
    try {
      const unlisten = await listen<PushMessage>("push-message", (e) => cb(e.payload))
      return unlisten
    } catch {
      return () => {}
    }
  },
}
