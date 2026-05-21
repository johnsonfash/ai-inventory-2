import { isTauri } from "@tauri-apps/api/core"
import Database from "@tauri-apps/plugin-sql"

// Local SQLite database — powered by `@tauri-apps/plugin-sql` on
// Tauri shells (desktop, iOS, Android), no-op on web.
//
// Used by the offline POS layer: cashier rings up sales while
// disconnected; rows queue locally; sync engine pushes them to the
// cloud + (optionally) broadcasts to peer terminals on the LAN when
// the network comes back. See MIGRATION.md for the planned sync
// architecture.
//
// API kept thin on purpose. Higher-level helpers (insertSale, ...)
// live in src/lib/pos/storage.ts; this module exists to centralise
// the connection + migrations.

const DB_URL = "sqlite:pallio.db"

let dbPromise: Promise<Database> | null = null

async function getDB(): Promise<Database> {
  if (!isTauri()) {
    throw new Error("[db] SQLite is only available inside the Tauri shell")
  }
  if (!dbPromise) {
    dbPromise = Database.load(DB_URL).then(async (db) => {
      await ensureSchema(db)
      return db
    })
  }
  return dbPromise
}

// Idempotent schema. Add new tables / columns here; the IF NOT
// EXISTS guards make it safe to run every boot.
async function ensureSchema(db: Database): Promise<void> {
  await db.execute(`
    CREATE TABLE IF NOT EXISTS pos_invoice (
      id            TEXT PRIMARY KEY,
      number        TEXT NOT NULL UNIQUE,
      created_at    INTEGER NOT NULL,
      customer_json TEXT,
      items_json    TEXT NOT NULL,
      subtotal      REAL NOT NULL,
      total         REAL NOT NULL,
      payments_json TEXT NOT NULL,
      meta_json     TEXT,
      synced_at     INTEGER
    );
    CREATE INDEX IF NOT EXISTS idx_pos_invoice_created  ON pos_invoice (created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_pos_invoice_synced   ON pos_invoice (synced_at);

    CREATE TABLE IF NOT EXISTS pos_return (
      id              TEXT PRIMARY KEY,
      number          TEXT NOT NULL UNIQUE,
      created_at      INTEGER NOT NULL,
      invoice_id      TEXT NOT NULL,
      invoice_number  TEXT NOT NULL,
      customer_json   TEXT,
      items_json      TEXT NOT NULL,
      total_refund    REAL NOT NULL,
      method          TEXT NOT NULL,
      reference       TEXT,
      synced_at       INTEGER
    );

    CREATE TABLE IF NOT EXISTS sync_outbox (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      kind        TEXT NOT NULL,         -- 'invoice' | 'return' | 'product_update' | ...
      payload     TEXT NOT NULL,         -- JSON
      queued_at   INTEGER NOT NULL,
      tries       INTEGER NOT NULL DEFAULT 0,
      last_error  TEXT
    );
    CREATE INDEX IF NOT EXISTS idx_sync_outbox_queued ON sync_outbox (queued_at);
  `)
}

export const db = {
  /** Get a connection; lazily opens + runs migrations on first call. */
  get: getDB,

  /** Append a record to the outbox. The sync worker drains this on
   *  reconnect. Safe to call from any code path — never throws if
   *  Tauri isn't around (no-op on web). */
  async enqueue(kind: string, payload: unknown): Promise<void> {
    if (!isTauri()) return
    try {
      const d = await getDB()
      await d.execute(
        "INSERT INTO sync_outbox (kind, payload, queued_at) VALUES ($1, $2, $3)",
        [kind, JSON.stringify(payload), Date.now()],
      )
    } catch (err) {
      console.warn("[db.enqueue] failed", err)
    }
  },

  /** Inspect pending sync count — surface in NetworkBanner so the
   *  cashier knows ~how much will sync when they're back online. */
  async pendingSync(): Promise<number> {
    if (!isTauri()) return 0
    try {
      const d = await getDB()
      const rows = await d.select<{ n: number }[]>("SELECT COUNT(*) AS n FROM sync_outbox")
      return rows[0]?.n ?? 0
    } catch {
      return 0
    }
  },
}
