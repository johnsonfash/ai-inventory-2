# Capacitor → Tauri Migration

This commit replaces Capacitor with **Tauri 2** for desktop + mobile.
Everything Capacitor was doing now goes through Tauri plugins. See
the table below for the mapping.

## What changed

### Added — `src-tauri/` (Rust crate)

| File | Purpose |
|---|---|
| `Cargo.toml`            | Rust deps — Tauri + 19 plugins |
| `build.rs`              | Cargo build hook |
| `tauri.conf.json`       | App identity, window config, deep-link config, updater endpoint |
| `src/main.rs`           | Binary entry — calls `pallio_lib::run()` |
| `src/lib.rs`            | Plugin registration (mobile / desktop cfg-gated) |
| `capabilities/*.json`   | Permission grants (default, mobile, desktop) |
| `plugins/pallio-fcm/`   | Custom FCM plugin scaffold (see TODO files) |
| `.gitignore`            | Skip `/target`, `/gen` |

### Capacitor → Tauri plugin mapping

| Capacitor package         | Tauri replacement                              |
|---------------------------|------------------------------------------------|
| `@capacitor/preferences`  | `@tauri-apps/plugin-store`                     |
| `@capacitor/haptics`      | `@tauri-apps/plugin-haptics`                   |
| `@capacitor/app`          | `@tauri-apps/api/event` listeners              |
| `@capacitor/keyboard`     | `window.visualViewport` (no plugin needed)     |
| `@capacitor/network`      | `navigator.onLine` events                      |
| `@capacitor/share`        | `@buildyourwebapp/tauri-plugin-sharesheet`     |
| `@capacitor/splash-screen`| Tauri auto-hides splash on first paint         |
| `@capacitor/status-bar`   | CSS `env(safe-area-inset-*)`                   |
| `@capgo/...native-biometric` | `@tauri-apps/plugin-biometric`              |

### POS-critical additions (new capabilities, no Capacitor equivalent)

| Plugin                              | What it unlocks |
|-------------------------------------|-----------------|
| `@tauri-apps/plugin-sql`            | **Offline SQLite** — durable POS state per terminal. See `src/lib/db/index.ts` |
| `@tauri-apps/plugin-barcode-scanner`| Mobile camera barcode scan (inventory + POS lookup) |
| `tauri-plugin-thermal-printer`      | ESC/POS receipt printing — Star, Epson TM, Citizen, etc |
| `tauri-plugin-serialplugin`         | Cash drawers, USB barcode guns, weighing scales |
| `tauri-plugin-keep-screen-on-api`   | Cashier-mode: screen never sleeps |
| `@tauri-apps/plugin-updater`        | In-app auto-update (signed) — desktop |
| `@tauri-apps/plugin-single-instance`| One window per launch — desktop |
| `@tauri-apps/plugin-window-state`   | Remember window size + position — desktop |
| `@tauri-apps/plugin-autostart`      | POS terminal launches at OS boot — desktop |

### Files rewritten (use Tauri APIs now)

- `src/lib/storage/kv.ts` — backed by `LazyStore` from plugin-store
- `src/hooks/use-native.tsx` — Tauri haptics + lifecycle events
- `src/hooks/use-back-button.tsx` — `tauri://back-button-pressed` event
- `src/hooks/use-network-status.tsx` — pure `navigator.onLine`
- `src/hooks/use-share.tsx` — sharesheet plugin
- `src/hooks/use-deep-links.tsx` — `@tauri-apps/plugin-deep-link`
- `src/hooks/use-chat-keyboard.tsx` — `window.visualViewport`
- `src/hooks/use-biometric.tsx` — `@tauri-apps/plugin-biometric`

### Files created

- `src/lib/db/index.ts` — SQLite helper + outbox-queue table for offline sync
- `src/lib/push/index.ts` — JS wrapper around the custom FCM plugin
- `src-tauri/plugins/pallio-fcm/` — custom plugin scaffold (Rust + Swift TODO + Kotlin TODO)

### Files deleted

- `ios/` (Capacitor-generated)
- `android/` (Capacitor-generated)
- `capacitor.config.ts`
- `assets/fix-cap-assets.mjs`
- All 13 `@capacitor/*` + `@capgo/*` packages from `package.json`

---

## How to develop now

### Desktop

```bash
npm run tauri:dev            # opens a native window with HMR
npm run tauri:build          # produces .dmg / .msi / .deb in src-tauri/target/release/bundle/
```

First `tauri:dev` takes ~5 min while Cargo compiles the Tauri shell + every plugin. After that, incremental builds are seconds.

### Android

```bash
# One-time per machine
npm run tauri:android:init   # scaffolds gen/android Gradle project

# Day-to-day
npm run tauri:android:dev    # runs on connected device / emulator
npm run tauri:android:build  # production APK + AAB
```

Requires `$ANDROID_HOME` exported + an installed NDK (Android Studio SDK Manager → SDK Tools → NDK side-by-side).

### iOS (Mac only)

```bash
# One-time per machine
npm run tauri:ios:init       # scaffolds gen/apple Xcode project

# Day-to-day
npm run tauri:ios:dev        # runs on simulator / connected device
npm run tauri:ios:build      # production IPA
```

Requires Xcode + an Apple Developer account + provisioning profile (same as the Capacitor flow you were on).

---

## FCM push notifications — what's done, what's pending

The custom `tauri-plugin-pallio-fcm` plugin is **scaffolded but not finished**. It needs the native Swift + Kotlin sides written + a Firebase project set up.

**Done:**
- Rust plugin crate at `src-tauri/plugins/pallio-fcm/`
- JS wrapper at `src/lib/push/index.ts` (`push.register()`, `push.unregister()`, `push.onMessage()`)
- Plugin registration ready to uncomment in `src-tauri/src/lib.rs` once the native files compile

**TODO** (follow these in order):
1. Create a Firebase project + add an iOS + Android app under bundle id `app.pallio`.
2. Download `GoogleService-Info.plist` (iOS) + `google-services.json` (Android).
3. Run `npm run tauri:ios:init` and `npm run tauri:android:init`.
4. Drop the Firebase config files into the generated platform folders.
5. Implement the Swift side per `src-tauri/plugins/pallio-fcm/ios/TODO.md`.
6. Implement the Kotlin side per `src-tauri/plugins/pallio-fcm/android/TODO.md`.
7. Add `.plugin(tauri_plugin_pallio_fcm::init())` to `src-tauri/src/lib.rs` and the matching `pallio-fcm:default` permission to `capabilities/mobile.json`.

Until those land, `push.register()` resolves to `null` with a console warning — the rest of the app keeps working.

---

## Offline POS architecture (planned)

The SQL plugin + the `sync_outbox` table in `src/lib/db/index.ts` give us the foundation. The remaining pieces:

1. **Write path** — when a cashier creates an invoice / return / inventory move, write it to SQLite **first**, then optimistically POST to the API. If the POST fails, enqueue the payload in `sync_outbox`.
2. **Sync worker** — a background loop that drains `sync_outbox` whenever the browser fires `online`. Use exponential backoff on failure. Mark rows synced by writing a `synced_at` timestamp instead of deleting.
3. **LAN peer sync (optional, multi-terminal)** — add `tauri-plugin-mqtt` and have each terminal connect to a lightweight broker on the LAN. Terminals broadcast `INSERT pos_invoice` events; peers apply them locally so the back-office screen sees front-of-house sales in real time even offline.
4. **Conflict resolution** — POS sales are append-only so conflicts are rare. For inventory adjustments, use a CRDT (`SUM(delta) per SKU`) instead of overwriting stock counts.

I've stubbed the storage layer + the outbox table; the sync engine itself is a 1-2 day project to wire up properly.

---

## Generate app icons (one-time)

```bash
npm run tauri:icon
```

This takes `assets/icon-only.png` (1024×1024) and generates all platform icon sizes into `src-tauri/icons/`. Run once + commit the outputs.

---

## Smoke-test sequence after this PR lands

```bash
# 1. install
npm install

# 2. type-check
npm run typecheck

# 3. desktop dev (quickest sanity check)
npm run tauri:dev

# 4. icons
npm run tauri:icon

# 5. mobile scaffold
npm run tauri:android:init
npm run tauri:ios:init           # Mac only

# 6. mobile dev
npm run tauri:android:dev        # emulator or device
npm run tauri:ios:dev            # simulator or device
```

If step 3 errors out with a missing Rust target, run:
```bash
rustup target add aarch64-apple-darwin   # if you're on M-series Mac and don't have it yet
```
