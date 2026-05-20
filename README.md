# Pallio

All-in-one inventory, POS, and sales operations.

Mobile-first React app — ships as a PWA (installable + offline-capable) and wraps to iOS / Android via Capacitor.

## What's here

- **131 pages** covering inventory · POS · sales · purchasing · reporting · accounting · marketing · settings · integrations · AI assistant
- **72 reusable components** across `mobile/`, `lists/`, `forms/`, `reports/`, `dashboard/`, `marketing/`, `settings/`, and `ui/`
- **Mobile-first shell**: dual-face `PageShell` (sidebar desktop / bottom-nav mobile), `BottomSheet`, `SwipeableRow`, `MobileMoreDrawer`, pull-to-refresh
- **Theme-aware everything**: OKLCH brand tokens flow through Tailwind v4; charts read from `--chart-N` CSS vars; light / dark / system theme
- **Brand mark**: price-tag P (icon set in `public/icons/`)

## Stack

- **Vite 6 + React 19 + TypeScript**
- **react-router-dom 7** (lazy routes in `src/routes.ts`)
- **Tailwind CSS v4** (no `tailwind.config.js`; tokens in `src/index.css`)
- **framer-motion 12** for shell + list + chat animations
- **@tanstack/react-query 5** for server state (mock layer in `src/lib/api-mocks/`)
- **recharts** for dashboards + reports
- **sonner** for toasts
- **jspdf + html2canvas** for printable invoices
- **vite-plugin-pwa + Workbox** — installable PWA with offline cache (SW in `src/sw.js`)
- **Capacitor 8** — iOS + Android native shells around the same Vite build

## Running locally

```bash
npm install
npm run dev          # https://localhost:3000  (uses local mkcert certs)
npm run build        # tsc --noEmit && vite build
npm run typecheck    # tsc only
npm run preview      # serve dist/
```

`npm run dev` runs `node ip.js` first, which writes your current LAN IPv4 into `.env.local` so other devices on the same Wi-Fi can hit the dev server over HTTPS.

### TLS certs

`vite.config.ts` looks for `localhost.pem` + `localhost-key.pem` at the repo root. Regenerate with [mkcert](https://github.com/FiloSottile/mkcert):

```bash
mkcert localhost 127.0.0.1 ::1 <your-lan-ip>
mv localhost+3.pem localhost.pem
mv localhost+3-key.pem localhost-key.pem
```

## Layout

```
src/
├── App.tsx               # Providers + Suspense + RouteTransition + Routes
├── routes.ts             # Lazy route config (no JSX — uses RouteObject `Component`)
├── main.tsx              # createRoot entry
├── index.css             # Tailwind v4 + OKLCH theme tokens + utility classes
│
├── pages/                # 131 routes mirroring URL tree (1:1, page.tsx → index.tsx)
│   ├── index.tsx                       # Dashboard
│   ├── pos/                            # POS catalog + sub-pages
│   ├── inventory/                      # Items, categories, brands, units, …
│   ├── sales/                          # Customers, orders, invoices, …
│   ├── purchasing/                     # POs, bills, vendors, …
│   ├── reporting/                      # 19 reports
│   ├── accounting/balance-sheet/
│   ├── marketing/                      # Hub + ad channels + listings
│   ├── settings/                       # 25+ settings pages
│   ├── ai/                             # AI assistant chat
│   └── notifications, expenses, appointments, …
│
├── components/
│   ├── ui/               # Theme-aware primitives (button, input, badge, …)
│   ├── mobile/           # BottomSheet, MobileTopBar/Nav/Drawer, SwipeableRow
│   ├── lists/            # SummaryStrip, StatusBadge, FilterSheet, EmptyState, …
│   ├── forms/            # FormShell, FormSection, FormField, SwitchField, …
│   ├── reports/          # ReportShell, KpiBand, ChartCard, DataTable, …
│   ├── dashboard/        # KpiCarousel, LowStockCard, RecentSalesCard, …
│   ├── marketing/        # ChannelShell, CampaignShell
│   ├── settings/         # IntegrationShell
│   ├── pos/              # CatalogGrid, CartSheet, CheckoutSheet, …
│   ├── charts/           # Theme-aware recharts wrappers
│   ├── auth/             # RoleGuard
│   ├── page-shell.tsx
│   ├── pwa-installer.tsx   # Install / update toast bar
│   └── route-transition.tsx
│
├── hooks/
│   ├── use-mobile.ts
│   ├── use-native.tsx     # Capacitor: status-bar tint, splash hide, keyboard listeners, haptic helpers
│   └── use-pull-to-refresh.tsx
│
├── lib/
│   ├── nav.ts            # Single source of truth for the nav graph
│   ├── utils.ts
│   ├── api-mocks/        # Client-side replacements for the deleted Next API routes
│   ├── pos/              # POS storage + aggregations
│   ├── auth/             # RBAC + auth store
│   └── payments/         # Virtual account directory
│
├── sw.js                 # Workbox service worker (precache + runtime caching)
└── vite-env.d.ts

ios/                      # Capacitor iOS workspace (Xcode-managed)
android/                  # Capacitor Android project (Gradle/Android Studio)
capacitor.config.ts       # Capacitor app config (appId, splash, status bar, keyboard)
```

## Wave history

The repo went from a v0-generated Next.js scaffold to a production-quality Vite app over 14 waves of refactor:

| Wave | Theme | Commit |
|---|---|---|
| 1 | Mobile shell + primitives + theme tokens | `3c8824f` |
| 2 | Dashboard rebuild + 7 widgets | `2346dc5` |
| 3 | List pages + Wave 3 primitives + route transitions | `a1b54c7` |
| 4 | Reports overhaul + brand mark | `1afbdd6` |
| 5 | Forms primitives + 6 flagship forms | `ac5c1f4` |
| 6 | POS catalog mobile UX | `23a9bb3` |
| 7 | 12 lists + SummaryStrip | `259c3b5` |
| 8 | Settings (10 pages) | `46f446d` |
| 9 | AI + Marketing + 3 settings leaves | `b1ef1be` |
| 10 | 13 integration connectors | `7b7a773` |
| 11 | 13 sub-lists (inventory + POS + payments) | `a4de79a` |
| 12 | Sales team + Balance sheet + leftovers | `6a581c6` |
| 13 | 14 form pages onto FormShell | `53370fe` |
| 14 | Final 9 forms + CampaignShell | `f514429` |
| — | Cleanup pass (dead-file sweep, dep prune, v1.0.0 tag) | `708281e` |
| 15 | PWA — installable + offline-capable | `5e2bd27` |
| 16 | Capacitor — iOS + Android native shells | _this commit_ |

## Deployment

### Web (Vercel / any static host)

- Configured for **Vercel** (see `vercel.json`) — SPA rewrites, asset cache headers, framework auto-detect.
- `npm run build` produces a static `dist/` that can also drop into Netlify, Cloudflare Pages, S3, etc.
- The frontend is currently dummy-data only. `VITE_API_BASE_URL` in `.env.local` is where the real backend URL will go when one lands.

### PWA (install + offline)

- Service worker at `src/sw.js` (Workbox via vite-plugin-pwa). Precaches the build manifest; cache-first for static assets + images; SWR for navigations; network-first for `/api/*`.
- Manifest is `public/manifest.json`; icons in `public/icons/`.
- The `<PWAInstaller>` component (mounted in `App.tsx`) shows an "Update available" toast when a new SW is waiting and surfaces the browser's `beforeinstallprompt` as an "Install Pallio" CTA.

### Native (iOS + Android via Capacitor)

```bash
npm run cap:sync     # build + sync web assets into ios/ + android/
npm run ios          # open Xcode workspace
npm run ios:run      # run on simulator (needs Xcode + simulator set up)
npm run android      # open Android Studio
npm run android:run  # run on emulator (needs Android Studio + emulator)
```

The native projects live in `ios/` and `android/`. `capacitor.config.ts` controls native behaviour (splash screen, status bar, keyboard resize). The native plumbing (StatusBar tint follows theme, splash hides on first paint, Keyboard sets `--keyboard-height` CSS var, haptics on key interactions) is wired through `src/hooks/use-native.tsx` and mounted in `App.tsx`. The same component tree runs on web — every native call short-circuits when `Capacitor.isNativePlatform()` is false.

Requirements for native builds:
- **iOS**: macOS + Xcode 15+
- **Android**: Android Studio with SDK 34

## License

Internal — all rights reserved.
