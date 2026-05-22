# Pallio — frontend audit (read me first)

This file is auto-loaded every session. Read it top to bottom — it captures durable architecture, conventions, and state that you can't re-derive cheaply from the code.

For deep details on subsystems already documented in the repo, read:
- `frontend/MIGRATION.md` — Capacitor → Tauri migration map, plugin list, dev commands, planned offline-sync architecture
- `frontend/docs/AI_CHAT_BACKEND.md` — full LLM chat backend design (prompt assembly, tool registry, multi-provider fallback, caching layers, SSE contract)

## What Pallio is

All-in-one ops SaaS for SMBs (positioning: Nigerian SMBs first). Covers inventory + POS + sales + storefront + accounting + reporting + marketing + AI assistant. **Industry-agnostic by design** — one Pallio account can run a shop + kitchen + workshop + service business. Brand: "Pallio", domain `pallio.app`, bundle id `app.pallio`.

## Stack

- **React 19** + **TypeScript 5.7** + **Vite 6** + **Tailwind v4** (PostCSS, no `tailwind.config` — `@theme` in `index.css`)
- **react-router-dom 7** with lazy `import()` chunks per route (chunk-load failure auto-reloads once via `RELOAD_GUARD_KEY` in `routes.ts`)
- **TanStack Query 5** for server cache (`refetchOnWindowFocus: false`, `retry: 1`)
- **framer-motion** for page transitions + animations
- **lucide-react** for icons (single source of truth — don't introduce other icon libs)
- **recharts** for charts (lazy-loaded into `charts-vendor` bundle)
- **sonner** for toasts
- **jspdf + html2canvas** for PDF export (lazy-loaded into `export-vendor` bundle)
- **Tauri 2** for native shells (desktop + iOS + Android). Web build also ships as PWA.

## Repo layout

```
/Users/johnfash/Work/inventory-app/
└── frontend/             ← THE git repo (root .git lives here, NOT one level up)
    ├── src/              ← React source
    ├── src-tauri/        ← Rust crate + native config (iOS, Android, desktop)
    ├── public/           ← Static — manifest.json, mark.svg, icons/, splash/
    ├── assets/           ← Build scripts: build-icon, build-splash, build-pwa-splash, etc.
    ├── docs/             ← Long-form design docs (AI_CHAT_BACKEND.md)
    ├── dist/             ← Vite build output
    ├── index.html        ← Inline splash, iOS A2HS splash images, theme bootstrap
    ├── vite.config.ts    ← PWA config, manualChunks (5 vendor chunks)
    ├── package.json      ← name = "pallio", scripts for dev / tauri:* / typecheck
    ├── MIGRATION.md      ← Capacitor → Tauri map (read for plugin choices)
    └── CLAUDE.md         ← (this file)
```

Note: `/Users/johnfash/Work/inventory-app/` (parent) is NOT a git repo. Run all git commands from `frontend/`.

## src/ layout

```
src/
├── App.tsx               ← Provider tree + ShellRouter (marketing shell vs AppFrame)
├── main.tsx              ← Splash dismissal, kv.hydrate(), SW cleanup in dev
├── routes.ts             ← Single source of truth for all routes (lazy-imported)
├── index.css             ← Tailwind v4 @theme tokens (brand, primary, etc.)
├── sw.js                 ← Workbox service worker (injectManifest strategy)
├── components/           ← Shared UI (see "Components" below)
├── pages/                ← Route components (one folder per route segment)
├── lib/                  ← Data layer + utilities
├── contexts/             ← React contexts (currency, page-meta, command-palette)
└── hooks/                ← Custom hooks (mobile, native, biometric, etc.)
```

## App shell architecture

`App.tsx` is the provider tree. Two distinct shells switched by `ShellRouter`:

1. **MarketingFrame** — `/`, `/pricing`, `/about`, `/faq`, `/contact`, `/privacy`, `/terms`, `/login`, `/register`. Top nav + footer + sign-in modal.
2. **AppFrame** — every other route. Sidebar (desktop), top bar + bottom nav (mobile), pull-to-refresh, header with toolbar + search + notification bell + user menu.

App-shell context (installed PWA / Tauri) rewrites `/` to `/login` in `index.html` BEFORE React boots, so cold launches never flash the marketing landing.

`AppFrame` mounts ABOVE `Suspense` — sidebar/chrome stay mounted across route changes. Only the inner page content re-renders. Each page publishes its title/toolbar/mobile-trailing through `useSetPageMeta()` (split context pattern in `contexts/page-meta.tsx`).

## Key abstractions

### Storage: `lib/storage/kv.ts`
Sync reads (localStorage) + async writes (mirror to Tauri `LazyStore` on native). `kv.hydrate()` at boot copies persisted Tauri store keys back into localStorage — that's the post-reinstall recovery path on iOS/Android (WKWebView can evict localStorage).

API:
- `kv.get(key)` / `kv.set(key, value)` / `kv.remove(key)` — strings
- `kvJson.get<T>(key)` / `kvJson.set(key, value)` — JSON helpers
- `kv.hydrate()` — one-shot at app entry

ALL persistence flows through this. Don't touch `localStorage` directly.

### POS data source of truth: `lib/pos/storage.ts`
The canonical catalog + invoices + drafts + returns layer. `loadCatalog(mode)` returns mock items for one of four modes: `"retail" | "restaurant" | "services" | "auto"`. Storage key bumps version on schema changes (`CATALOG_KEY = "pos:catalog:mode:v5"`) to force re-seed.

**Inventory pages source from here, not from a parallel mock.** The main `pages/inventory/index.tsx` and `pages/inventory/categories/index.tsx` already do this — see `project_inventory_catalog_source.md` in memory for the full sub-page list still TODO.

### API client: `lib/api/client.ts`
Thin fetch wrapper. Read it for the conventions:
- All paths prefixed by `VITE_API_BASE_URL` (written by `ip.js` at dev start)
- Auth: `Authorization: Bearer <token>` from `lib/api/auth-token.ts` (in-memory + localStorage mirror)
- All non-2xx throw `ApiError` with `status`, `code`, `details`, `isTransient` getter
- 401 → single-shot `clearAuth()` (no refresh dance yet)
- 5xx + network errors → one toast
- Use via `api.get<T>(path, { params, headers, signal, baseUrl })` etc.
- `api.isConfigured()` → false when `VITE_API_BASE_URL` is unset; pages check this to fall back to mocks

Pair with React Query for cache + retry:
```ts
useQuery({ queryKey: ['items', page], queryFn: () => api.get<Paginated<Item>>('/items', { params: { page } }) })
```

### Offline SQLite: `lib/db/index.ts`
Tauri `plugin-sql` (SQLite). Throws on web. Tables already created:
- `pos_invoice` — durable offline POS state per terminal
- `pos_return`
- `sync_outbox` — queue of operations pending push to cloud (`kind`, `payload`, `queued_at`, `tries`, `last_error`)

Sync worker NOT yet implemented — see `MIGRATION.md` "Offline POS architecture (planned)".

### Platform identity: `lib/platform.ts`
`getPlatform()` → `"web" | "macos" | "windows" | "linux" | "ios" | "android" | "unknown"`. Helpers: `isWeb()`, `isTauriMobile()`, `isTauriDesktop()`. Cached at module load. Use these anywhere you branch on env.

### Navigation: `lib/nav.ts`
`NAV` array — single source of truth for sidebar groups (Dashboard, POS, Inventory, Sales, ...). `BOTTOM_NAV_PRIMARY` — 4-icon mobile bottom nav (Dashboard, POS, Stock, Sales). Editing sidebar entries? Edit here, not in components.

### Currency: `contexts/currency.tsx`
8 codes (NGN, USD, EUR, GBP, GHS, KES, ZAR, SLL). ZERO_DECIMAL set (NGN, KES, SLL, GHS) renders 0 decimals; others 2. Default NGN. Persisted to `kv`. Use `useCurrency().formatPrice(amount)` everywhere prices show.

### Auth (mocked): `lib/auth/store.ts` + `lib/auth/rbac.ts`
Mocked users + groups in localStorage. 8 roles (`Owner, Manager, Cashier, Sales, Marketer, Affiliate, Viewer, Custom`) with a hardcoded permission matrix in `rbac.ts`. `hasPermission(role, perm)` is the check. Real auth = TODO when backend lands; client has `auth-token.ts` ready.

### WebAuthn / biometric: `lib/webauthn.ts` + `hooks/use-biometric.tsx` + `components/biometric-gate.tsx`
Touch ID / Face ID / Windows Hello / Android biometric. Client-side WebAuthn ceremony today (no server verification yet). Credential ID + user handle stored in localStorage. `BiometricGate` is a top-level lock screen — when enabled in Settings → Security AND we're on a native build, blocks the app behind a biometric prompt on cold launch.

### Insights engine: `lib/insights/engine.ts`
Rule-based heuristic generator (`generateInsights()` returns sorted `Insight[]`, `generateForecast(days)` returns 7-day forecast with confidence bands). Stable IDs via hash function. Surfaced on Dashboard. Will eventually be backend-driven — see `AI_CHAT_BACKEND.md` for the split between deterministic insights (no LLM) and chat (LLM).

### Other lib/* (all currently MOCKED to kv/localStorage)
- `lib/sales/data.ts` — `ORDERS`, `INVOICES`, `RECEIPTS` arrays + `getInvoice/getOrder/getReceipt` lookups
- `lib/comms/data.ts` — 8 builtin email templates + `interpolate(template, tokens)`
- `lib/team/data.ts` — `MEMBERS`, `LOCATIONS`, `ROLES`, `INVITES`, `SESSIONS`
- `lib/storefront/data.ts` — 20 templates × 8 sectors × 5 styles, persisted state with default subdomain
- `lib/integrations/data.ts` — 40+ providers across 8 categories (payments, commerce, delivery, comms, marketing, accounting, team, analytics). Sensitive fields auto-masked to last 4 chars
- `lib/payments/virtual-accounts.ts` — 3 locations × 2 cashiers = 6 hardcoded virtual accounts
- `lib/push/index.ts` — JS wrapper around the custom FCM plugin (scaffolded, not finished — see `src-tauri/plugins/pallio-fcm/`)
- `lib/api-mocks/*` — used when `api.isConfigured()` is false

## Components

### Top-level shell
- `app-frame.tsx` — main app chrome (sidebar/header on desktop, top bar + bottom nav + pull-to-refresh on mobile). Mounts once above Suspense
- `app-sidebar.tsx` — collapsible sidebar (256px expanded, 64px collapsed with hover flyouts), Cmd+B toggle, sidebar search filters groups + subitems
- `marketing/marketing-frame.tsx` — public-site shell
- `page-shell.tsx` — every authed page wraps in this. Publishes title/toolbar/mobileTrailing to PageMeta context. Renders `<></>` itself; chrome lives in `AppFrame`
- `route-transition.tsx` — framer-motion page-transition wrapper
- `pwa-installer.tsx` — `beforeinstallprompt` capture + SW-update toast (poll every 30 min)
- `network-banner.tsx` — offline / back-online pill (rose / emerald)
- `biometric-gate.tsx` — pre-app biometric lock (described above)
- `tw-theme-provider.tsx` — light/dark theme. Theme resolution happens in `<head>` script BEFORE React boots (no FOUC)
- `command/command-palette.tsx` + `contexts/command-palette.tsx` — global Cmd+K palette (`"/"` also opens unless typing in input; Esc closes)

### List/filter primitives (used everywhere)
- `lists/summary-strip.tsx` — KPI tile strip
- `lists/empty-state.tsx` — centered icon + heading + description + action
- `lists/filter-chips.tsx` — horizontal removable chips
- `lists/filter-button.tsx` + `lists/filter-sheet.tsx` — bottom-sheet filter UI with sections + pill groups
- `lists/status-badge.tsx` — tone-coded badge (`StatusTone = "info" | "warning" | "success" | "danger" | "muted"`)

### Forms
- `forms/form-shell.tsx`, `form-section.tsx`, `form-footer.tsx`, `form-grid.tsx`, `form-aside.tsx`, `form-field.tsx`, `input-addon.tsx`, `switch-field.tsx`

### Mobile-specific
- `mobile/swipeable-row.tsx` — horizontal swipe-to-reveal actions
- `mobile/mobile-fab.tsx` — floating action button (used on inventory list, etc.)
- `mobile/bottom-sheet.tsx` — modal panel sliding from bottom
- `mobile/mobile-bottom-nav.tsx` — 5-icon mobile nav (Home, POS, Stock, Sales, More)
- `mobile/mobile-top-bar.tsx` — title + tooltip + trailing icons
- `mobile/mobile-more-drawer.tsx` — extra nav links

### UI primitives
`components/ui/` — shadcn-style. `button.tsx`, `card.tsx`, `input.tsx`, `select.tsx`, `dialog.tsx`, `sheet.tsx`, `sonner.tsx`, etc. Don't replace these casually — they're tuned for the Pallio look.

### Dashboard widgets
`components/dashboard/` — `low-stock-card`, `open-pos-card`, `quick-actions-card`, `kpi-carousel`, `kpi-stat-card`, `storefront-snapshot`, `recent-sales-card`, etc.

### Charts
`components/charts/` — lazy-loaded (in `charts-vendor` bundle). Wrap Recharts so route navigation can lazy-import.

## Pages — top-level sections

Each is a folder under `src/pages/`. `index.tsx` is the section root; sub-routes nest under it.

| Section | Description | Routes |
|---|---|---|
| `dashboard` | Home/overview after login | `/dashboard` |
| `pos` | Point of Sale (cashier UI) | `/pos`, `/pos/drafts`, `/pos/invoices`, `/pos/invoices/:id`, `/pos/returns`, `/pos/returns/:id`, `/pos/returns/new`, `/pos/transactions` |
| `inventory` | Items catalog + brands + categories + units + warranties + price-lists + composite + adjustments + transfers + receive + labels + new | 11 sub-pages |
| `sales` | Customer-facing sales pipeline | `/sales/customers`, `/orders`, `/invoices`, `/shipments`, `/returns`, `/discounts`, `/team`, `/team/:member`, `/team/chat`, `/inventory` (live view) |
| `purchasing` | Vendors / POs / receipts / bills / vendor credits | `/purchasing/vendors`, `/pos`, `/receipts`, `/bills`, `/vendor-credits` |
| `accounting` | Books — P&L, balance sheet, cash flow, payroll, commissions, taxes, chart of accounts, journal entries, reconciliation | 9 sub-pages |
| `reporting` | ~18 report types — stock, P&L, tax, trending product, sell-payment, etc. | 18 sub-pages |
| `marketing` | FB/IG/YouTube ads, marketplace, listings, commissions | 11 sub-pages |
| `storefront` | Hosted online store — templates, products, orders, customers, domain, settings, pages, analytics, billing | 12 sub-pages |
| `communications` | Inbox + compose + templates + team chat | 4 sub-pages |
| `settings` | Business / warehouses / users / roles / currency / taxes / payments / integrations / printers / barcodes / notifications / preferences / profile / security / invoice | 30+ sub-pages |
| `marketing-site` | Public marketing pages — landing, pricing, about, faq, contact, privacy, terms, login, register |
| `ai` | AI Assistant chat | `/ai` |
| `analytics` | Cross-section analytics | `/analytics` |
| `expenses` | Expense tracking | `/expenses`, `/expenses/new` |
| `appointments` | Bookings/scheduling | `/appointments` |
| `notifications` | Notification center | `/notifications` |
| `onboarding` | First-run setup | `/onboarding` |
| `affiliate/dashboard` | Affiliate commission dashboard | `/affiliate/dashboard` |
| `help/glossary` | In-app help glossary | `/help/glossary` |
| `not-found` | 404 | `*` |

## Native shell (Tauri 2)

### Plugin matrix (`src-tauri/Cargo.toml`)
**Always:** store, haptics, os, deep-link, notification, sql (sqlite), shell, dialog, fs, clipboard-manager, process, opener, sharesheet, barcode-scanner, biometric, keep-screen-on
**Not on iOS:** `thermal-printer`, `serialplugin` (no USB host on iOS, and thermal-printer's `build.rs` panics on iOS targets)
**Desktop only:** `updater`, `single-instance`, `window-state`, `autostart`

### Capabilities (`src-tauri/capabilities/`)
- `default.json` — granted everywhere: core, store, os, deep-link, notification, sql, shell, dialog, fs, clipboard-manager, process, opener, sharesheet
- `mobile.json` — iOS + Android: haptics, barcode-scanner, biometric, keep-screen-on
- `desktop.json` — macOS + linux + windows: updater, window-state, autostart
- `pos-hardware.json` — linux/macOS/windows/android (NOT iOS): thermal-printer, serialplugin

### Window config (`src-tauri/tauri.conf.json`)
- Desktop window: 1280×800 default, 360×600 min, `backgroundColor: "#0a0a0a"` (matches splash so no flash on launch)
- iOS/Android: window `visible: false` initially (set in `tauri.ios.conf.json` / `tauri.android.conf.json`); JS calls `getCurrentWindow().show()` after React mounts so the OS LaunchScreen hands off to a fully-rendered app in one frame
- Deep links: mobile uses universal links at `pallio.app`; desktop uses custom schemes `pallio://` and `app.pallio://`
- Updater: endpoint `https://pallio.app/updates/{{target}}/{{arch}}/{{current_version}}` (`pubkey` empty — set when releasing)

### Custom plugin: `pallio-fcm`
`src-tauri/plugins/pallio-fcm/` — Firebase Cloud Messaging push notifications. **Scaffolded but not finished** — needs Swift + Kotlin native sides + a Firebase project. Steps in `MIGRATION.md`. Until done, `push.register()` resolves `null` with a console warning.

### Native hooks (`src/hooks/`)
- `use-native.tsx` — top-level mount; exposes `haptic.{light,medium,heavy,success,warning,error}()` (no-op on web)
- `use-back-button.tsx` — Android hardware back: root routes prompt double-tap-to-exit, others pop history. iOS doesn't fire this
- `use-deep-links.tsx` — handles cold-launch URL (`getCurrent()`) + live (`onOpenUrl()`). Routes via `parseDeepLink()` with a `KNOWN_ROOTS` whitelist
- `use-biometric.tsx` — Tauri plugin-biometric wrapper
- `use-network-status.tsx` — pure `navigator.onLine` events
- `use-share.tsx` — sharesheet plugin
- `use-chat-keyboard.tsx` — `window.visualViewport` for on-screen keyboard handling (no JS bridge)
- `use-pull-to-refresh.tsx` — 32px pull trigger, opacity scales with pull

## Splash & icons

### Inline splash (`index.html` lines ~119-269)
Painted by the WebView BEFORE React parses → no flash on cold launch. Aurora gradient + dot grid + Pallio mark + wordmark + shimmer loader. `main.tsx` removes it after first React render. Min display 1200ms; transition 320ms.

### Platform-specific splash strategy
- **Mobile native (iOS/Android):** OS LaunchScreen owns the launch phase. `main.tsx` strips the HTML splash immediately (it would duplicate the OS one), then calls `getCurrentWindow().show()` after first paint
- **Desktop Tauri:** window is visible from launch with dark `backgroundColor`. HTML splash plays for `SPLASH_MIN_MS = 1200ms` then fades
- **Web / PWA:** same HTML splash path
- **iOS A2HS:** dedicated startup-image PNGs for every device class (lines 31-46 of `index.html`) — without them, iOS shows white

### Icon generation
- `assets/build-icon.mjs` — main icon from `icon-only.png` → `src-tauri/icons/`
- `assets/build-macos-icon.mjs` — macOS-specific .icns
- `assets/build-android-splash-icon.mjs` — Android adaptive icon + splash
- `assets/build-ios-splash-logo.mjs` — iOS LaunchScreen logo
- `assets/build-pwa-splash.mjs` — iOS A2HS startup-image PNGs

One-time: `npm run tauri:icon` (generates Tauri side). Commit outputs.

## Service worker (`src/sw.js`)

`vite-plugin-pwa` with `injectManifest` (custom SW source). `registerType: "autoUpdate"` + `skipWaiting()` + `clients.claim()` → new SW takes over open tabs immediately.

Runtime caching strategies:
- Static assets (script/style/font) → CacheFirst, 30-day cap
- Images → CacheFirst, 14-day cap, max 200 entries
- Navigations → StaleWhileRevalidate (SPA shell loads instantly)
- `/api/*` → NetworkFirst, 6s timeout, 1-day cap, max 100 entries
- Everything else → SWR
- Offline navigation fallback → cached `/index.html`

Caches are namespaced per build (`__PALLIO_BUILD_ID__` from Vite `define`). Activate handler drops caches not on this build's whitelist.

Chunk-load failure fallback in `routes.ts`: stale chunk hash from old deploy → one-shot `window.location.reload()` via `sessionStorage` guard. Recovers from "MIME type" errors after deploys.

## PWA manifest (`public/manifest.json`)

`name: "Pallio"`, `display: "standalone"`, `background_color: "#0a0a0a"`, `theme_color: "#7c3aed"`, `orientation: "portrait-primary"`. Icons: 192/512 (any) + 512 (maskable). Single source of truth — vite-plugin-pwa's auto-generated `manifest.webmanifest` is disabled so they can't drift.

## Vite chunks (`vite.config.ts`)

5 explicit vendor chunks via function-based `manualChunks`:
- `react-vendor` — react, react-dom, scheduler, jsx-runtime, react-router. Pinned so the dep graph is explicit (was breaking `forwardRef` access otherwise)
- `query-vendor` — TanStack Query
- `motion-vendor` — framer-motion + motion-dom + motion-utils
- `charts-vendor` — recharts + d3-* + victory-vendor + lodash + react-smooth + fast-equals + internmap + decimal.js-light + fast-png + iobuffer
- `export-vendor` — jspdf + html2canvas + dompurify + fflate + css-line-break + text-segmentation + utrie + base64-arraybuffer + canvg + core-js
- `tauri-vendor` — `@tauri-apps/*` + `tauri-plugin-*`
- `vendor` — everything else

## Conventions / "do this" / "don't do this"

### Industry-agnostic (the most important principle)
**Inventory + filters + derivations must work for clothing, food, ingredients, perfume, auto parts, services, manufacturing raw materials, books, electronics, anything.** Don't hardcode retail categories like "Apparel / Electronics / Beauty". Derive from the catalog. Cue-based regex for units/warranties (see `deriveUnit` / `deriveWarranty` in `pages/inventory/index.tsx`). Neutral defaults (`pcs`, `—`, `Uncategorised`) when nothing matches. `UNLIMITED_STOCK = 9999` sentinel for non-tracked items (services, menu dishes — display as `∞`, skip reorder logic).

See memory: `feedback_industry_agnostic_derivations.md`.

### Inventory sources from POS catalog
Inventory pages read from `lib/pos/storage.ts` via `loadCatalog()` across all four modes (retail + restaurant + services + auto), deduped by SKU. Done: `pages/inventory/index.tsx`, `pages/inventory/categories/index.tsx`. Still to do: `brands`, `units`, `warranties`, `price-lists`, `labels`, `composite`, `new`, `adjustments` (needs stock-movement layer), `transfers`, `receive`.

See memory: `project_inventory_catalog_source.md`.

### Commit hygiene
**No `Co-Authored-By: Claude` or AI trailer on commits/PRs.** See memory: `feedback_commit_attribution.md`.

### Long sessions
Run `/compact` before ending a long working session — `--resume` cannot reconstruct context from a 100MB+ JSONL without a compact summary. See memory: `feedback_compact_before_long_breaks.md`.

### Tauri/web parity
Every Tauri plugin call must short-circuit on web. Pattern: `if (!isTauri()) return null` or `if (!isNative) return`. Same component tree must render in both. See `lib/storage/kv.ts`, `hooks/use-native.tsx`.

### Storage
Never touch `localStorage` directly. Go through `kv` / `kvJson` in `lib/storage/kv.ts`.

### Brand naming
Always "Pallio" in user-facing copy, package.json, manifest, README, og tags. The original v0 scaffold name `my-v0-project` was already replaced — don't reintroduce it.

### Comments
Code in this repo has dense, intentional comments — most explain WHY (constraints, surprises, prior incidents). Follow the same style: comment only when removing it would confuse a future reader.

## Backend status

**No backend exists yet.** Frontend is fully self-contained with:
- `lib/api/client.ts` ready to point at a real `VITE_API_BASE_URL`
- `lib/api/auth-token.ts` ready for JWTs
- `api.isConfigured()` returns false → pages fall back to local mocks
- Sync outbox + SQLite tables in `lib/db/index.ts` waiting for sync worker
- `pages/ai/index.tsx` POSTs to `/api/ai/chat` (mocked today by `lib/api-mocks/ai-chat.ts`)

When backend lands, the migration is: add `VITE_API_BASE_URL`, generate OpenAPI types into `lib/api/types.ts`, replace mock loaders one-by-one. The full LLM chat backend design is already documented in `docs/AI_CHAT_BACKEND.md` (prompt assembly, tool registry, multi-provider fallback, Redis caching layers, SSE contract, observability).

## Memory references

Loaded automatically from `~/.claude/projects/-Users-johnfash-Work-inventory-app/memory/`:
- `project_pallio_overview.md` — brand + scope
- `project_inventory_catalog_source.md` — inventory sub-page TODO list
- `feedback_industry_agnostic_derivations.md` — the agnostic principle in detail
- `feedback_commit_attribution.md` — no AI trailer
- `feedback_compact_before_long_breaks.md` — `/compact` before long breaks
