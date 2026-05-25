import { api } from "@/lib/api/client"
import { db } from "@/lib/db/index"

// POS-5 offline sync worker. POS writes (sales, returns, drafts, shift
// open/close) are persisted locally first and queued in `sync_outbox`
// (lib/db). This worker drains the queue when the device is online AND a
// backend is configured — POSTing each op to its endpoint and deleting it
// on success. Until the backend lands, api.isConfigured() is false so the
// queue is preserved untouched (never dropped).

const ENDPOINT: Record<string, { path: string }> = {
  invoice: { path: "/pos/invoices" },
  "invoice-create": { path: "/pos/invoices" },
  return: { path: "/pos/returns" },
  "return-create": { path: "/pos/returns" },
  draft: { path: "/pos/drafts" },
  "draft-save": { path: "/pos/drafts" },
  "shift-open": { path: "/pos/shifts" },
  "shift-close": { path: "/pos/shifts/close" },
  product_update: { path: "/items" },
}

let running = false

async function pushOne(kind: string, payload: unknown): Promise<void> {
  const route = ENDPOINT[kind]
  if (!route) {
    // Unknown kind — drop it by resolving (so it doesn't wedge the queue).
    return
  }
  await api.post(route.path, payload)
}

/** Drain the outbox once, if conditions allow. Returns counts. */
export async function runSync(): Promise<{ sent: number; failed: number }> {
  if (running) return { sent: 0, failed: 0 }
  // Only attempt when we believe we're online and a real API exists.
  if (typeof navigator !== "undefined" && navigator.onLine === false) return { sent: 0, failed: 0 }
  if (!api.isConfigured()) return { sent: 0, failed: 0 }
  running = true
  try {
    return await db.drainOutbox(pushOne)
  } finally {
    running = false
  }
}

let started = false

/** Wire the worker: drain on reconnect + on a gentle interval. Idempotent. */
export function startSyncWorker() {
  if (started || typeof window === "undefined") return
  started = true
  const tick = () => void runSync()
  window.addEventListener("online", tick)
  // Catch the case where we boot already-online with a queue.
  tick()
  // Periodic sweep for transient failures / partial drains.
  window.setInterval(tick, 60_000)
}
