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
Mocked users + groups in localStorage. **Two different role systems coexist — easy to confuse:**

- **`lib/auth/rbac.ts`** — permission gates. 5 roles: `Admin | Manager | Sales | Marketing | Viewer`. 8 permissions: `view:team`, `view:team:detail`, `edit:roles`, `edit:users`, `view:commissions`, `view:inventory`, `pos:charge`, `pos:refund`. `hasPermission(role, perm)` is the check.
- **`lib/team/types.ts`** — staff management role catalogue (`RoleKey`). 8 keys: `owner | manager | cashier | sales-rep | marketer | affiliate | viewer | custom`. Each has a structured `permissions` object with per-area levels (`inventory: "none"|"read"|"write"`, `pos: "none"|"use"|"void"`, etc.).

The first is for runtime guards; the second is for the team-settings UI catalogue. When wiring backend auth, decide which model the API normalizes to — they aren't 1:1.

### Auth tokens: `lib/api/auth-token.ts`
Split-storage model (ready for real backend):
- **Access token** → in memory only. Lost on reload. Refresh flow re-populates on boot.
- **Refresh token** → `kv` at key `pallio:auth-refresh` (so it survives reloads + reinstalls).
- `clearAuth()` drops both + dispatches `pallio:auth-cleared` window event (App.tsx listens to navigate to `/login`).
- `hasAuth()` returns true if EITHER token is present — doesn't validate; that's the server's job.

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

---

# Verified deep-dive (data layer + native shell)

The sections above were written from a mix of direct reads + Explore agent summaries. This section is **everything I have directly verified by reading the file** — facts a backend builder must not get wrong.

## Sales pipeline shape (`lib/sales/types.ts`)

Order → Invoice → Payment → Receipt. All amount fields end in **`Usd`** (the mock pretends to be USD-normalized; backend should pick a single convention).

- **OrderStatus** (6): `draft | sent | accepted | invoiced | fulfilled | cancelled`
- **InvoiceStatus** (6): `open | partial | paid | overdue | void | refunded`
- **PaymentMethod** (5): `cash | card | transfer | wallet | store-credit`
- `LineItem` has per-line `taxRate` as a fraction (`0.075` = 7.5%)
- `Invoice` carries computed snapshots: `subtotalUsd`, `taxUsd`, `totalUsd`, `paidUsd`, `balanceUsd` (= total - paid, kept for sorting)
- `Invoice.payments[]` is chronological; a `receiptId` is auto-generated after the final paid payment
- Mock dataset deliberately demos every state combo: SO-2401 (closed), SO-2402 (partial+overdue), SO-2403 (sent unpaid), SO-2404 (accepted not-invoiced), SO-2405 (draft), SO-2406 (refunded after pay)

## Team/staff (`lib/team/types.ts` + `data.ts`)

- 5 locations: Warehouse A (Austin), Downtown Store (Austin), East DC (Atlanta), West Hub (Portland), SXSW Popup (Austin)
- `Member` carries `mtdSalesUsd`, `mtdCommissionUsd`, `affiliateCode`, `affiliateClicks` (sales-rep + affiliate roles)
- MemberStatus (3): `active | invited | suspended`
- Invite has `token` (stable opaque) + `expiresAt`
- Session has `current: boolean` — UI labels it "This device" and suppresses Revoke
- Role catalogue (the 8 RoleKey values) has tone + structured `permissions` per area, used by the `/settings/roles` cards

## Storefront (`lib/storefront/types.ts`)

- 8 sectors: `fashion | beauty | food | electronics | home | auto | wholesale | services`
- 5 styles: `minimal | bold | editorial | playful | luxe`
- Subdomain convention: **`{subdomain}.pallio.shop`** (separate from `pallio.app` which is the operator app)
- `customDomain` optional via CNAME/A — null when not configured
- `published: boolean` — gates customer-facing visibility
- `paymentProviderIds[]` + `deliveryProviderIds[]` — references into the integrations catalogue
- Storefront templates have `tier: free|pro|premium` + `popularity` metric + `cover` URL (Unsplash CDN)

## Integrations (`lib/integrations/types.ts` + `data.ts`)

- 8 categories: `payments | commerce | delivery | comms | marketing | accounting | team | analytics`
- 5 field kinds: `text | password | url | select | switch`
- **Nigerian payment focus is first-class** — Paystack, Flutterwave, Opay, PalmPay all in the catalogue with their official brand hex colors. Stripe etc. are alongside but secondary.
- Each `ProviderField` flags `sensitive: true` for secret fields — UI masks + adds a Reveal toggle.
- **`IntegrationConnection.fieldsMasked`** persists only the masked preview (e.g. `"•••• abc1"`) in kv. **Real secrets MUST stay server-side** when backend lands; the kv field is just for the UI to show what was connected without re-prompting.
- `events[]` is the per-connection event log shown on the detail page (`connected | test | disconnected | error`).
- `IntegrationInsight` shape: `{ label, value, delta?, trend?, hint? }` — same shape backend should return for per-provider metric tiles.

## Insights (`lib/insights/types.ts` + `engine.ts`)

- 4 severities: `good | info | warning | critical` (drives color + sort priority)
- 8 categories: `stock | sales | purchasing | marketing | cashflow | team | forecast | system`
- Stable id pattern: `ins-{category}-{hash(title)}` — UI keys on this
- Sparkline = 4-10 number array
- Optional `action: { label, href }` — routes inside the app
- `generateInsights()` is rule-based, NOT ML. Time-of-day flavor in copy (`tod()` returns morning/afternoon/evening) so the dashboard feels fresh on each visit. Output shape is what backend should match.
- `generateForecast()` returns 7-day forecast with confidence bands

## Communications (`lib/comms/types.ts`)

- 4 template categories: `transactional | marketing | ops | team`
- `EmailTemplate.tokens[]` array of `{ key, label, sample }` — composer surfaces these as fill-ins
- `EmailTemplate.builtin: true` prevents user deletion
- `EmailMessage.folder`: `inbox | sent | drafts`
- Body is HTML (sanitised at render time)

## Currency context (`contexts/currency.tsx`)

- 8 codes: NGN, USD, EUR, GBP, GHS, KES, ZAR, SLL
- Default: NGN. Storage key: `pallio:currency`
- **ZERO_DECIMAL set** (renders 0 decimals): NGN, KES, SLL, GHS. Others render 2.
- Symbol table: `NGN: "₦", GHS: "₵", KES: "KSh", ZAR: "R", SLL: "Le"` (others standard)
- Three exports for mock data files that can't use the hook: `getCurrentCurrency()`, `formatPriceFor(n, code)`, `formatPriceCompact(n, code)` (the compact form does `k`/`M` suffixes at 1000/1000000)
- `useCurrency()` returns fallback formatter even outside provider so static helpers don't crash

## PageMeta context (`contexts/page-meta.tsx`)

Split-context pattern (value + setter) to avoid an infinite re-render loop. Key facts a refactorer must respect:

- `useLayoutEffect` (NOT `useEffect`) so the title lands before paint — eliminates one-frame title flash on route change
- Setter context's value is React's stable `useState` setter — PageShell never re-renders from meta changes
- `DEFAULT_META = { title: "", withToolbar: false }` — PageShell passes `withToolbar = true` by default
- `PageMeta` fields: `title`, `titleTooltip?`, `withToolbar`, `toolbarActions?`, `mobileTrailing?`
- AppFrame reads via `usePageMeta()`; PageShell publishes via `useSetPageMeta(meta)`

## WebAuthn (`lib/webauthn.ts`)

**NOT a mock — runs real WebAuthn ceremony.** OS-level prompt actually fires on every supporting platform:
- macOS WKWebView → Touch ID
- Windows WebView2 → Windows Hello (PIN / fingerprint / face)
- Linux WebKitGTK → PAM / fprintd
- Browser → standard passkey (synced via iCloud Keychain / Google Password Manager / Edge)

Challenge is generated **client-side** today (no backend). When backend lands: swap the challenge source for a server-issued one and forward the assertion for server verification. Storage keys: `pallio.webauthn.credentialId`, `pallio.webauthn.userHandle`.

## Rust plugin registration (`src-tauri/src/lib.rs`)

Verified. Plugin tree:
- **Always (every target)**: store, os, notification, sql, shell, dialog, fs, clipboard-manager, process, opener, deep-link
- **`#[cfg(mobile)]`**: haptics, barcode-scanner, biometric, keep-screen-on, sharesheet
- **`#[cfg(not(target_os = "ios"))]`** (desktop + Android): thermal-printer, serialplugin
- **`#[cfg(not(any(android, ios)))]`** (desktop only): updater, single-instance (focus existing window on relaunch), window-state, autostart (`MacosLauncher::LaunchAgent`)

`src/main.rs` has `#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]` so release builds on Windows don't pop a console.

## pallio-fcm custom plugin

Tree at `src-tauri/plugins/pallio-fcm/`:
```
Cargo.toml
src/lib.rs        ← Rust side (scaffolded)
ios/TODO.md       ← Swift side TODO
android/TODO.md   ← Kotlin side TODO
```
Not yet wired in `src-tauri/src/lib.rs` (the registration call is the last item in MIGRATION.md's TODO list).

## Theme tokens (`src/index.css`)

Tailwind v4 (`@import 'tailwindcss'` + `tw-animate-css`). `@custom-variant dark (&:is(.dark *))`. **All colors are oklch**. Key values:

- **Brand** — `oklch(0.55 0.22 295)` (violet-600)
- Brand soft — `oklch(0.96 0.04 295)` (tints)
- Background — `oklch(0.99 0.003 264)` light / `oklch(0.16 0.012 264)` dark (near-black with violet undertone)
- Semantic: destructive `oklch(0.62 0.22 27)`, success `oklch(0.68 0.18 152)`, warning `oklch(0.76 0.17 75)`, info `oklch(0.68 0.16 240)`
- **6-color chart palette**: violet / emerald / amber / red / sky / pink (same hues across light/dark, lightness flipped in dark block)
- `--radius: 0.625rem` base
- Sidebar gets its own token set so it can theme independently
- Custom utilities: `.scrollbar-hide`, `.pwa-bottom`, `.pwa-top`, `.pb-mobile-nav`, `.prose-pallio`

## Pre-dev hook (`ip.js`)

Runs before `vite` in dev (`"dev": "node ip.js && vite ..."`).

- Resolves machine's LAN IPv4 via `ifconfig` (matches en0-style `inet X.X.X.X netmask ... broadcast ...`)
- Writes `.env.local` with:
  - `VITE_API_BASE_URL="https://{ip}:8000/v1"` (backend expected at port 8000, API path `/v1`)
  - `VITE_WEB_SOCKET_URL="wss://{ip}:8000/ws"` (WebSocket at `/ws`)
- If keys exist with different variable names from an old version, appends correct ones (migration path for old `VITE_BASE_URL` / `VITE_WEB_SOCKET` names)
- Anchored regex matches scheme+host+port together so it can't accidentally rewrite an unrelated Firebase project id

## Vercel deploy (`vercel.json`)

- Framework `vite`, build `npm run build`, out `dist`
- SPA fallback: `{ source: "/(.*)", destination: "/" }`
- Cache headers:
  - `/assets/*` → `public, max-age=31536000, immutable` (Vite hashes asset URLs)
  - `/icons/*` → `public, max-age=604800` (1 week — icons change occasionally)
  - `/.well-known/apple-app-site-association` → explicit `Content-Type: application/json`, `max-age=3600` (iOS Associated Domains)
  - `/.well-known/assetlinks.json` → explicit `Content-Type: application/json`, `max-age=3600` (Android App Links)

**Backend note**: the `.well-known/*` routes are reserved for native deep-link verification. Don't proxy them through the API server.

## Pages: hub vs leaf structure

Some sidebar sections have NO root `index.tsx` — they're directory hubs whose children are the actual routed pages. Backend builder should note this for API surface design — these are roll-up contexts, not single-page operations:

- `/accounting/*` — 9 sub-pages, no root
- `/purchasing/*` — 6 sub-pages, no root
- `/sales/*` — 9 sub-pages, no root (except `/sales/inventory` which is a live view)
- `/affiliate/*` — only `/affiliate/dashboard`, no root
- `/help/*` — only `/help/glossary`, no root
- `/integrations` — only `/integrations/website`, no root

Sections WITH a root index.tsx that's an actual rendered page: `dashboard, pos, inventory, reporting, marketing, storefront, communications, settings, ai, analytics, expenses, appointments, notifications, onboarding`.

## Pages convention (from audit)

- Every authed page wraps in `PageShell` (publishes title/toolbar/mobileTrailing to context).
- Every page calls `useRegisterPageRefresh(...)` (250-400ms mock latency for pull-to-refresh).
- Pages never call `kv.set()` directly — go through `kvJson.set()` or dispatch a custom event (`pallio:onboarding-changed`, `pallio:biometric-lock-changed`, `pallio:auth-cleared`).
- Marketing-site pages don't use PageShell (different shell).
- Affiliate dashboard hardcodes `ME_ID = "m-6"` as "you" — needs to come from auth when backend lands.
- Help glossary supports URL hash anchors (`#term-<id>`) — backend should preserve these in any link-sharing flows.
- Onboarding progress key: `pallio:onboarding-progress` (kvJson).

## Components: corrections from audit

The Explore-agent component sweep had at least one prop-shape error (`BiometricGate` it claimed takes `{ onUnlock, locked }` — actual signature is `{ children: React.ReactNode }`). When wiring real backend, **verify prop shapes against the source** before integrating — don't trust this CLAUDE.md alone. Patterns observed:

- `app/UserMenu` + `app/NotificationBell` — top-bar utility components (dropdown + popover)
- `auth/RoleGuard` — wraps children in a permission check; renders fallback if denied
- `pos/*` — much bigger than expected: `BarcodeScannerInput, CartContent, CartPanel, CartSheet, CatalogGrid, CheckoutSheet, FloatingCart, InvoicePrint, PosSettingsSheet`
- `reports/*` — own primitives: `ChartCard, DataTable, ExportMenu, KpiBand, PeriodChips, RankedList, ReportShell`
- `charts/*` — three concrete charts: `StockLevelsChart, SalesVsPurchaseChart, CategoryBreakdownChart`
- `team/CommissionCalculator` reused by both affiliate dashboard and sales-team commission UI

## Verified extras (small-dense files round 2)

A second sweep of the small dense files (hooks, asset scripts, FCM plugin internals, mock data bodies) — all directly read.

### Storage key roundup (all `pallio:*` unless noted)

- `pallio:auth-refresh` — refresh token (auth-token.ts)
- `pallio:currency` — selected CurrencyCode (currency context)
- `pallio:onboarding-progress` — `Record<stepKey, boolean>` (onboarding)
- `pallio:biometric-lock` — `"1"`/unset (biometric-gate)
- `pallio:biometric-login` — `"1"`/unset (login button visibility)
- `pallio:passkey-login` — `"1"`/unset (login button visibility)
- `pallio:chat-kb-height` — cached keyboard px (use-chat-keyboard, default 291)
- `pallio:install-dismissed` — `"1"`/unset (PWAInstaller "Install" banner)
- `pallio:chunk-reload-once` — sessionStorage (routes.ts deploy-recovery guard)
- `pallio.webauthn.credentialId` / `pallio.webauthn.userHandle` (note: dot-separated, not colon — legacy from webauthn.ts)
- **Legacy `iv:*` keys** — `iv:org` + `iv:loc` from the v0 scaffold era, still used by `useOrgLocation()`. Backend port could normalize on `pallio:org` / `pallio:loc` but don't break in-flight users.

### Custom window events

- `pallio:auth-cleared` — fires on `clearAuth()`; App.tsx redirects to `/login`
- `pallio:onboarding-changed` — fires when a step is toggled or auto-marked
- `pallio:biometric-lock-changed` — fires when Settings toggles the lock
- `pallio:org-changed` / `pallio:loc-changed` — cross-instance sync of `useOrgLocation`
- `pallio:back-exit-hint` — fires from `useBackButton` on first back press at root route; App.tsx shows the "press back again to exit" toast

### useOrgLocation mock data (current state)

3 orgs hardcoded: Funke Apparel (default), Eko Provisions, LagosMart. 3 locations: Lekki Phase 1 (default), Ikeja City Mall, Wuse 2. Cross-tab sync via `pallio:org-changed` / `pallio:loc-changed` custom events. **Backend will replace these with the signed-in user's org list + active org's locations** — keep the org-changed/loc-changed event names as the public API.

### Pull-to-refresh thresholds (`use-pull-to-refresh.tsx`)

`TRIGGER = 64px`, `MAX_PULL = 96px`. Asymptotic damping: `MAX_PULL * (1 - exp(-dy / (MAX_PULL * 1.4)))` — rubber-bands toward MAX_PULL. Refresh fires when pull crosses TRIGGER on release; pull holds at TRIGGER during the async refresh.

Pattern: `PageRefreshProvider` holds a single `RefreshFn | null` ref. Each page calls `useRegisterPageRefresh(fn)` on mount; AppFrame's pull gesture calls `usePageRefreshHandler()` to invoke whatever's registered.

### useChatKeyboard / useKeyboardHeightCapture

`window.visualViewport` based — no Tauri keyboard plugin. Detects keyboard via `innerHeight - vv.height` delta (gated to 100-800px to filter noise). Persists to `pallio:chat-kb-height` (default 291, iPhone portrait + predictive bar). `useKeyboardHeightCapture()` is a passive cache-only listener mounted in App.tsx so first-focus on /ai or /sales/team/chat doesn't show a fallback-then-correct jump.

Composer focus tracked via React synthetic events + class `pallio-composer-zone`. ResizeObserver re-snaps the scroll container to bottom only if user was already near bottom.

### useBiometric platform branching

Single API (`isAvailable`/`register`/`verify`/`unregister`/`isEnrolled`) routes:
- **Tauri iOS/Android** → `@tauri-apps/plugin-biometric` (`checkStatus`, `authenticate`). Reads BiometryType (TouchID/FaceID/Iris) for the label.
- **Tauri desktop** → WebAuthn (`registerPlatformCredential`, `assertPlatformCredential`). Label is platform-derived: macOS → "touch", Windows → "fingerprint", Linux → "fingerprint".
- **Web** → returns `available: false`. Web uses `use-passkey.ts` (separate hook).

### usePasskey (web only)

Calls into the same `lib/webauthn.ts` ceremony. Adds `conditional: boolean` — true when `PublicKeyCredential.isConditionalMediationAvailable` is supported (lets us hint passkeys in the email input via `mediation: "conditional"`).

### Sales mock dataset shape

6 customers (CUSTOMERS object): nova, bright, acme, aisha, glow, delta. 6 orders SO-2401..SO-2406 demoing every state combo (fulfilled-closed, partial-overdue, sent-unpaid, accepted-not-invoiced, draft, refunded-after-pay). 4 invoices INV-2401/2402/2403/2406, 2 receipts RT-2401/RT-2406.

`buildInvoice()` helper auto-computes paid/balance/status. **Payment amount `-1` is a sentinel for "full total"** (so seeds don't restate the number twice).

Owner/issuer ids reference `lib/team/data.ts` member ids — `m-1` (Mia Chen) and `m-2` (Alex Larson) are the active sales-reps in mock. `m-1` Mia Chen is "current user" per `SESSIONS` mock (the only `current: true` session).

### Team mock dataset

8 members (m-1..m-8): manager, sales-rep, cashier, marketer, viewer, 2 affiliates, suspended cashier. 3 pending invites. 4 sessions. Members reference location ids from `LOCATIONS` (`wh-a`, `downtown`, `east-dc`, `west-hub`, `sxsw`). Affiliates have `affiliateCode` + `affiliateClicks` populated (Sara Quill `QUILL10`/1842, Lee Park `LEEPARK`/942).

### Communications templates

9 builtin templates: `tpl-invoice, tpl-receipt, tpl-refund, tpl-welcome, tpl-abandoned, tpl-restock, tpl-promo, tpl-commission, tpl-low-stock`. Token syntax: `{{snake_case}}`. `interpolate(template, values)` regex `/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g` — falls back to rendering `{{key}}` literal for unknown tokens (useful in preview).

6 mock messages across folders (inbox/sent/drafts).

### Storefront templates

6 hand-named templates: `lekki-luxe, ankara-bold, glow-minimal, naija-deli, vendor-grid, homestead` (plus more not surveyed — full set lives in storefront/data.ts). Each has sector + style + tier (free/pro/premium) + popularity score + Unsplash cover URL + color pair (primary + accent).

**11 ESSENTIAL_PAGES baked into every template**: `/`, `/shop`, `/p/:slug`, `/cart`, `/checkout`, `/order/:id`, `/account`, `/about`, `/contact`, `/privacy`, `/terms`. Templates ADD sector-specific extras (lookbook for fashion, menu+reserve for food, compare+warranty for electronics, etc.).

Privacy template page is "NDPR-compliant" — Nigerian Data Protection Regulation reference. Backend's privacy generator should follow NDPR shape.

### Integrations — provider count + Nigerian focus

40+ providers across 8 categories. Confirmed entries with brand hex colors:
- Payments: Paystack #0FA958, Flutterwave #F5A623, Opay #1DBF73, PalmPay #7A4DFF, Stripe #635BFF
- Commerce: Shopify #7AB55C, WooCommerce #7F54B3
- Comms: WhatsApp Business #25D366, Twilio #F22F46, Mailgun #F06B66
- Team: Slack #4A154B
- Analytics: GA4 #F9AB00
- Delivery: GIG Logistics #E2231A, Sendbox #0066FF, Kwik #FF6A00, DHL Express #FFCC00, Fez Delivery #1E40AF
- Marketing: Mailchimp #FFE01B, Klaviyo #222222, Meta Pixel #1877F2
- Accounting: QuickBooks #2CA01C, Xero #13B5EA

### Backend API host convention

The Paystack provider's webhook placeholder is `https://api.pallio.app/hooks/paystack`. **Backend API host expected at `api.pallio.app`.** Webhook routes follow `/hooks/{provider-id}` pattern.

### Integration-specific behaviors worth knowing

- **Shopify**: two-way sync on 60-second loop, last-write-wins conflict resolution
- **GIG Logistics**: `codEnabled` switch — GIGL collects cash from buyer + remits weekly
- **Sendbox**: `defaultMode` select (cheapest/fastest/balanced) — multi-carrier aggregator across West Africa
- **Mailgun**: region select (us/eu) — depends on customer's Mailgun account region
- **Klaviyo**: recommended upgrade from Mailchimp at ~5000+ list size
- **Mailchimp**: `syncOnSale` switch — GDPR-safe opt-in only
- **Meta Pixel**: required to compute Marketing ROAS view (CAPI events feed the dashboard)

### Insights engine — sort + content

Sort priority: `critical → warning → info → good` (then by recency). 11 hardcoded insights span all 8 categories. `generateForecast()` produces 7 days with day-of-week seasonal multiplier (`weekends 0.9, Wed/Thu 1.08, else 1.0`), trend `base * (1 + day * 0.012)`, confidence band `trend * (0.07 + day * 0.012)` (widens further out). Stable id pattern: `ins-{category}-{abs(hash(title))}`.

### pallio-fcm — actually pretty close to ready

Looking at the TODO files (which I had not read before), the iOS + Android sides are not from-scratch — they have **complete Swift + Kotlin skeletons** in the TODO.md files plus a working JS wrapper + Rust scaffold. The remaining gap is:

1. Create Firebase project under bundle id `app.pallio`
2. Drop `GoogleService-Info.plist` (iOS) + `google-services.json` (Android) into `src-tauri/gen/{apple,android}/` after `tauri:{ios,android}:init`
3. Paste the Swift `PalliFcmPlugin.swift` (skeleton in `ios/TODO.md`) into the Xcode project
4. Paste the Kotlin `PalliFcmPlugin.kt` + `PalliFcmService` (skeleton in `android/TODO.md`) into Android Studio
5. Add `firebase-bom:33.7.0` + `firebase-messaging-ktx` to `gen/android/app/build.gradle.kts`
6. Register `PalliFcmService` in AndroidManifest with `MESSAGING_EVENT` intent filter
7. Add `aps-environment` + `UIBackgroundModes.remote-notification` to iOS Info.plist
8. Add `.plugin(tauri_plugin_pallio_fcm::init())` to `src-tauri/src/lib.rs`
9. Add `pallio-fcm:default` permission to `capabilities/mobile.json`

JS side already invokes `plugin:pallio-fcm|register_for_push` + listens for `push-message` event. Rust today returns Err on all platforms (graceful for the consumer — `push.register()` resolves null with console warn).

### Splash + icon build scripts (assets/)

- **build-icon.mjs** — produces `assets/icon-{only,foreground,background}.png` (1024×1024, brand violet `#7c3aed`), 13 PNGs in `public/icons/*` (favicon-16/32, icon-{16..512}, apple-touch-icon, mark-256/384/512), and `maskable-512.png` with 60% inset for Android safe-zone. Mark scale 0.7 of canvas. NOTE: comments reference `npx capacitor-assets generate` — stale from pre-Tauri era.
- **build-splash.mjs** — composes brand mark on `#0a0a0a` 2732×2732 canvas, logo at 32% (LOGO_RATIO). Writes `assets/splash.png` + `splash-dark.png` (identical).
- **build-macos-icon.mjs** — generates `icon.icns` via `iconutil` (macOS only). Tile inset 76% (calibrated, not Apple's HIG 82.4%). Overwrites Tauri's auto-cropped PNG sources (`icon.png`, 32, 64, 128, 128@2x) to fix dev-mode dock icon — critical for parity with Finder/Chrome/Notes.
- **build-android-splash-icon.mjs** — 432px source for Android 12+ Splash Screen API, scaled to 5 mipmap densities (`mipmap-{mdpi/hdpi/xhdpi/xxhdpi/xxxhdpi}/ic_splash.png`).
- **build-ios-splash-logo.mjs** — 200pt natural × 1x/2x/3x densities, written to `src-tauri/gen/apple/Assets.xcassets/SplashLogo.imageset/splash-logo@{1,2,3}x.png`.
- **build-pwa-splash.mjs** — generates 16 portrait iOS A2HS sizes in `public/splash/{w}x{h}.png`. Logo at 28% of shorter dimension. **Emits the `<link rel="apple-touch-startup-image" media=...>` tags as stdout** for manual paste into `index.html` — not written automatically (intentional, "fewer surprises").

All scripts use `sharp` with `kernel: "lanczos3"`. Brand background `#7c3aed`, splash background `#0a0a0a`.

### useIsMobile breakpoint

768px (configurable as the first arg). Returns `false` during SSR / first render before media query resolves.

### Direct file count update

I have now personally read **~80 files of ~333** (24%). Remaining ~250 are mostly:
- Marketing-site pages (~9) — design docs, low backend value
- Per-section page implementations (~160) — pattern-replicated, will read on demand
- shadcn `ui/*` primitives (~13) — autogenerated by the CLI, low value
- Settings sub-pages and integration detail pages — many, mostly form-shaped, will read on demand

## Audit coverage statement

Files I have personally read in this session (verified): ~80 of ~333 (~24%). Files reported by Explore agents (one had a prop-shape error, one falsely claimed `src-tauri` didn't exist): the rest. **Treat agent-reported prop shapes as starting points to verify, not as truth.** Every fact in the "Verified deep-dive" and "Verified extras" sections has a direct file-read backing it.
