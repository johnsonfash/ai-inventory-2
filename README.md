# Pallio

All-in-one inventory, POS, and sales operations.

Mobile-first React app — built to feel native in the browser, ship as a PWA, and wrap to iOS/Android via Capacitor later.

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
│   └── route-transition.tsx
│
├── hooks/
│   ├── use-mobile.ts
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
└── vite-env.d.ts
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

## Deployment

- Configured for **Vercel** (see `vercel.json`) — SPA rewrites, asset cache headers, framework auto-detect.
- `npm run build` produces a static `dist/` that can also drop into Netlify, Cloudflare Pages, S3, etc.
- The frontend is currently dummy-data only. `VITE_API_BASE_URL` in `.env.local` is where the real backend URL will go when one lands.

## License

Internal — all rights reserved.
