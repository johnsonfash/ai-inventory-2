# Pallio backend — concrete build plan

The server that replaces the frontend's mocks. Written to match the house
style used in **`sleekr-app/s-backend`** and **`jaxtechnology/backend`** —
not a generic REST design.

This plan is the synthesis of a full frontend audit (every page +
data-mutating component across POS, Inventory, Sales, Purchasing,
Accounting, Reporting, Storefront, Marketing, Communications,
Integrations, Payments, Auth/Team/Settings, AI, Dashboard, and the misc
pages). Pair it with `docs/AI_CHAT_BACKEND.md` (the `/ai` chat design,
already written) and CLAUDE.md (frontend conventions + verified data
shapes).

---

## 1. Stack (mirror of s-backend / jaxtechnology)

- **Runtime:** Node + TypeScript, `ts-node-dev` in dev, `tsc` build, **pm2** cluster in prod.
- **Web + WS:** **hyper-express** (one server serves HTTP *and* WebSocket upgrades). Dev runs over TLS with local certs (`localhost-key.pem`), prod terminates TLS upstream.
- **Database:** **MongoDB** (native driver) behind a **Prisma-like fluent builder** (`core/database/fluent.builder.ts`) — `db.users.findUnique({ where, select })`, `db.invoices.create({...})`, etc. Auto-coerces 24-hex strings → `ObjectId` for declared id-fields. Schema lives in `types/db.schema.ts`; id-fields in `core/database/id-fields.ts`. `core/database/ensure-indexes.ts` builds indexes on boot.
- **Cache / presence / locks:** **ioredis** (`core/redis/`) — token-version cache, rate-limit counters, per-user concurrency locks, presence, and the AI caching layers.
- **Queues / workers:** **BullMQ** (`workers/`) on Redis — async + scheduled jobs.
- **Push:** **firebase-admin (FCM)** + **web-push (VAPID)** centralised in `core/push/push.service.ts` with invalid-token / expired-subscription cleanup.
- **Validation:** **zod** DTOs per feature.
- **Auth:** **jsonwebtoken** access + refresh, with `tv` (token-version) enforced via Redis; **argon2** hashing; **@simplewebauthn/server** (passkeys/biometric); **otplib** (TOTP 2FA); Google/Apple/Microsoft/GitHub OAuth.
- **Email:** **resend** (+ nodemailer/Mailgun fallback per org).
- **Storage:** **AWS S3 / Backblaze B2** with presigned URLs (`utils/api/storage` / `core/storage`).
- **PDF:** **pdfkit** (receipts, invoices, statements, payslips).
- **Misc:** `cors` (allowlist incl. Tauri `https://localhost`), `qrcode`, `axios` for provider calls.

---

## 2. Project layout (by-feature, jaxtechnology style)

```
src/
  server.ts                      # bootstrap: db.connect → ensureIndexes → redis → socket → workers → listen
  core/
    config/                      # env, constants
    database/                    # mongo.client, fluent.builder, ensure-indexes, id-fields, db.schema via types
    redis/                       # client, presence, rate-limit, locks, caches
    socket/                      # socket.server (WS upgrade), socket.registry (userId→sockets), *.handler
    push/                        # push.service (FCM + web-push)
    storage/                     # S3/B2 presign + upload
    integrations/                # provider SDK wrappers (paystack, flutterwave, meta, shopify, ...)
    security/                    # jwt, webauthn, totp, oauth
    migrations/                  # one-off data migrations
  api/<feature>/                 # ONE folder per feature:
    <feature>.routes.ts          #   router.<verb>(path, { middlewares:[...] }, handler)
    <feature>.controller.ts      #   thin handlers → call service, return Response.success/error
    <feature>.service.ts         #   business logic, uses db.* + integrations
    <feature>.dto.ts             #   zod schemas
  middlewares/                   # auth.guard, role.guard (perm-based), rate-limit, org.guard, idempotency
  workers/                       # BullMQ workers (sync-ingest, payments, payouts, payroll, email, catalog-sync, ...)
  utils/api/                     # response (Response.success/error/validation), codes, storage
  types/                         # db.schema.ts, socket.type.ts, hyper-express.d.ts, declarations.d.ts
```

`api/routes/index.ts` → `masterRouter.use('/<feature>', featureRouter)`; mounted at `/v1`.

### Conventions (copy from s-backend)
- **Responses:** `Response.success(req,res,data,msg)`, `Response.error(req,res,{code,message,status})`, `Response.validation(req,res,zodError)` — `{ success, code, message, data, meta:{timestamp,path,requestId} }`.
- **Routing:** `router.post('/path', { middlewares: [rateLimit(3,60), authGuard, roleGuard('pos:refund')] }, handler)`.
- **Auth guard:** Bearer JWT → attaches `req.user = { id, orgId, locationId, role, tv }`; token-version checked against Redis (`auth:tv:<userId>`), DB fallback. Bump `tokenVersion` to force-logout.
- **Multi-tenancy:** **every service query is scoped by `req.user.orgId`** (and `locationId` where relevant). Add an `org.guard` that rejects cross-org ids; bake `orgId` filters into the fluent builder calls — never trust a client-supplied org.
- **Idempotency:** an `idempotency` middleware + a `webhook_events` / `sync_dedupe` collection keyed by `(kind, sourceRef)` so offline-sync replays and webhook re-deliveries never double-post.

---

## 3. Mongo collections (`types/db.schema.ts`)

Tenancy + identity: `orgs`, `locations`, `users`, `sessions`, `invites`, `roles` (custom), `push_tokens`, `webauthn_credentials`, `oauth_links`.

Catalog + inventory: `catalog_items` (variants + modifierGroups embedded), `price_tiers`, `stock_movements`, `recipes`, `production_runs`, `lots`, `recalls`.

POS: `pos_invoices`, `pos_drafts`, `pos_returns`, `gift_cards`, `loyalty_accounts`, `shifts`, `venues`, `open_orders` (prep tickets derived from fired lines).

Sales + purchasing: `customers`, `sales_orders`, `sales_invoices`, `payments`, `receipts`, `shipments`, `discounts`, `sales_returns`, `vendors`, `purchase_orders`, `goods_receipts`, `bills`, `vendor_credits`.

Accounting: `accounts` (CoA), `journal_entries` (append-only), `period_locks`, `bank_reconciliations`, `payroll_employees`, `payroll_runs`, `commissions`, `tax_filings`.

Storefront: `storefront_configs`, `storefront_orders`, `storefront_customers`, `storefront_pages`, `storefront_discounts`, `domains`.

Marketing + growth: `campaigns`, `marketplace_listings`, `affiliates`, `affiliate_clicks`.

Platform: `integrations` (secrets server-side, masked preview only), `messages` (email), `email_templates`, `chat_messages` (team), `notifications`, `expenses`, `appointments`, `activity_log` (audit), `webhook_events`, `sync_dedupe`, `ai_sessions`, `ai_messages`.

Money is stored in **minor units** with the org's currency (NGN/KES/GHS/SLL are zero-decimal — match `contexts/currency.tsx`).

---

## 4. Feature modules (every audited surface → endpoints)

> Base URL `/v1`. All endpoints `authGuard` + org-scoped unless marked **public** (customer storefront) or **webhook**. Real-time noted where the socket replaces/augments polling.

### `api/auth`
`POST /auth/create-account` · `/auth/login` · `/auth/refresh` · `/auth/logout` · `/auth/verify` (OTP) · `/auth/resend-code` · `/auth/forgot-password` · `/auth/reset-password` · Google OAuth (`/auth/google`, link/unlink) · **WebAuthn**: register/verify + login challenge/verify (passkey + biometric, server-side ceremony — client scaffolding exists in `lib/webauthn.ts`) · **2FA (otplib)**: `/auth/2fa/setup|verify|disable|recovery-codes`. JWT carries `sub, orgId, role, tv`; access ~15m, refresh ~7d (kv-persisted client-side).

### `api/organizations` + `api/settings`
Org + per-user settings (maps the 14 settings sub-pages): `GET/PATCH /org/settings/business` (+ `POST /org/logo` upload), `/org/settings/currency`, `/org/settings/taxes` (CRUD), `/org/locations` (CRUD — warehouses), `/org/roles` (builtin + custom RBAC), `/org/settings/barcodes`, `/org/settings/notifications` (+ test), `/org/printers` (CRUD + test-print), `/users/me` + `/users/me/preferences` + `/users/me/avatar` + `/users/me/notifications`. Onboarding: `GET/PATCH /org/onboarding/progress`. **Business profile** (`industry` + `sells`) lives on `/org/settings/business` — it drives onboarding step ordering + smart defaults and is editable both in Settings → Business and the first-run modal (frontend key `pallio:business-profile:v1`). The **first-run / tour-seen** flag is **per-user** (`/users/me/preferences`), so each teammate sees the welcome tour once and can replay it independently.

### `api/team`
`GET /team/members`, `POST /team/members/invite` (token + expiry), `PATCH /team/members/:id/role|status`, `GET/DELETE /team/invites`, `POST /team/invites/:token/resend`, `GET /team/members/:id/sessions` + `DELETE …/:sessionId` (revoke), `GET /team/affiliates`. Invite links `pallio.app/invite/:token`.

### `api/catalog` + `api/inventory`
Catalog CRUD with variants/modifiers (`GET /catalog`, `POST/PATCH/DELETE /catalog/:sku`, `POST /catalog/:sku/image` upload). Derivations (brands/units/warranties/price-lists/labels/composite) are **read aggregations** off `catalog_items` + `price_tiers`. **Stock movements** (`stock_movements`): `POST /stock/adjustments`, `POST /stock/transfers` (two-leg, net-zero, shared ref), `POST /stock/receive` (vs PO). **Recipes/production/lots/recall**: CRUD + `POST /production-runs/:id/consume`, `GET /lots/:id/trace`, `POST /recalls` + `/notify` + `/write-off`.

### `api/pos`
- Invoices: `POST /pos/invoices`, `GET /pos/invoices[/:id]`, `POST /pos/invoices/:id/void`, bulk export. Finalising a paid sale → **auto-post to ledger** (see accounting) + decrement stock (recipe-aware FEFO when recipe-backed).
- Drafts: `GET/POST/DELETE /pos/drafts`.
- Returns: `POST /pos/returns` (reason required) → credit stock + reverse ledger.
- Gift cards: `POST /gift-cards`, `GET /gift-cards/:code`, `POST /gift-cards/:code/redeem|void`.
- Loyalty: `GET /loyalty/:id`, `POST …/earn|redeem-points|use-store-credit`, `GET/PATCH /loyalty/config`.
- Shifts: `POST /pos/shifts`, `POST /pos/shifts/:id/close` (variance), `GET /pos/shifts` + X/Z report endpoints.
- Venue/KDS: `GET/POST /venues` + spots, `GET/POST /open-orders` + lines, `POST /open-orders/:id/fire`, `POST /open-orders/:id/close`, `GET /prep-queue`, `PATCH /open-orders/:id/lines/:lineId/prep-status`. **Real-time:** prep queue + live inventory pushed over the socket (replaces the 4s poll) via `sendToLocation`.
- **Offline sync:** `POST /pos/sync` ingests the client `sync_outbox` batch (kinds: invoice, return, draft, adjustment, transfer-out/in, receive, shift-open/close). **Idempotent** by `(kind, id|number|ref)` via `sync_dedupe`. Returns `{ succeeded[], failed[] }`. This is the server half of `lib/db/drainOutbox` + `lib/pos/sync.ts`.

### `api/sales`
`customers` CRUD + history; `sales_orders` (CRUD + `POST /:id/invoice`); `sales_invoices` (**money-sensitive**: `POST /:id/payments`, `/void`, `/refund`); `receipts` (read + PDF/email); `shipments` (create label, `GET /:id/tracking`, **carrier webhooks**); `sales_returns` (RMA state machine + credit memo); `discounts` (CRUD + `/validate` + `/apply`).

### `api/purchasing`
`vendors` (CRUD + performance), `purchase_orders` (CRUD + `/:id/receive` + `/cancel`), `goods_receipts` (create + `/approve` → stock + cost JE + `/reverse`), `bills` (**AP**, `/:id/payment` + `/void`), `vendor_credits` (create + `/apply`).

### `api/accounting` (the ledger — already real on the frontend; port `lib/accounting/*`)
`accounts` CRUD; `journal_entries`: `POST /accounting/journal` (**rejects unbalanced**), `GET`, `POST /:id/reverse` (mirror, append-only — never edit). `POST /accounting/period-lock`. **Auto-post service** (port `auto-post.ts`): POS sale/return, bill, goods-receipt (COGS), payroll, expense → balanced entries, idempotent by `sourceRef`. Statements derived from trial balance: `GET /accounting/profit-loss|balance-sheet|cash-flow`. Reconciliation: `GET /accounting/reconciliation/:accountId`, `PATCH …/:entryId` (cleared), `POST …/through`; statement CSV/OFX import + bank-feed (Mono/Okra/Stripe Financial Connections) later. Payroll: `POST /accounting/payroll/run` + `/:id/pay` (transfer + JE) + `/reverse`. Commissions: CRUD + approve/pay (batch) + reverse. Taxes: `GET /accounting/taxes` + `vat-summary` (from ledger), `POST /accounting/taxes/filing` (+ evidence upload).

### `api/reporting`
~26 read-only aggregation endpoints, each `?period=…&compare=…` + CSV/PDF export + optional email schedule (BullMQ): sales (P&L, purchase-vs-sale, trending/per-product, sales-reps, sell-payment), inventory (stock, expiry, adjustment, item, product-purchase), operations (customer-group, supplier-customer, tax, expense, purchase-payment, register, activity-log) + the POS-5 set (cash-drawer, tip-pool, returns-by-reason, refunds-by-method) + variance/allergens/recipe-cost. `GET /reporting/metrics` powers the hub cards.

### `api/storefront` (operator admin) + `api/shop` (**public, customer-facing**)
Admin: `GET/PATCH /storefront` (config, brand, providers, publish), products (publish/feature + image upload), `storefront_orders` (fulfilment + refund), customers, discounts, pages (+ hero upload), settings (shipping zones, languages), analytics, templates, `domain` (DNS status + **SSL auto-provision** for CNAME → `*.pallio.shop`), billing (Stripe subscription + invoices). **Public `api/shop` (no auth):** product browse, cart, checkout, order tracking — served per-tenant by subdomain/custom-domain resolution. This is effectively a second app surface.

### `api/marketing`
Channels overview; Facebook/Instagram ads (campaigns CRUD + status, catalog/listing sync via Meta Marketing API); YouTube AdSense (Google Ads/YouTube API, OAuth); Facebook Marketplace listings (+ auto-delist on stockout); multi-channel publish; affiliate commissions (invite, rates, payouts). All provider tokens server-side. **Upcoming: AI ad-copy + AI ad-video generation** from the catalogue (a generation provider behind a BullMQ worker; output to S3/B2; **debits `org.aiCredits`** per `api/billing`) — the user plans to wire this into Marketing + marketing insights.

### `api/communications`
Email inbox/sent/drafts (`messages`), composer (`POST /communications/messages` via Resend/Mailgun, attachments upload), templates (CRUD, builtin locked, `{{token}}` interpolation server-side), **team chat over the socket** (`chat_messages`, channels, presence; REST fallback for history).

### `api/integrations`
`GET /integrations` (catalogue), `GET /integrations/connections`, `POST /integrations/:providerId/connect|disconnect|test`, `GET /integrations/:providerId/insights`. **Secrets stored server-side, encrypted; only `fieldsMasked` returned.** OAuth flows (`/oauth/authorize|callback/:provider`) for Meta, Google, QuickBooks/Xero; Shopify admin-token + 60s sync loop.

### `api/payments`
Virtual accounts (`GET /payments/virtual-accounts[...]` — Paystack/Flutterwave dedicated NUBAN), payouts/withdrawals (transfer-to-bank, account-name resolution), settlement tracking. The money rails for POS + storefront + withdrawals.

### `api/ai`
`POST /ai/chat` (SSE stream) per `docs/AI_CHAT_BACKEND.md` — grounded LLM, per-org tool scoping, Redis caches, provider fallback. **Add the new tools surfaced this session:** `get_shift_report`, `get_prep_queue`, `get_ledger_balance`/`get_pnl`, `get_reconciliation_status`. Dashboard insights + 7-day forecast stay **deterministic (no LLM)**: `GET /org/insights`, `/org/forecast`, `/org/kpis`.

### `api/billing` (account subscription + AI credits)
The Pallio **account** subscription (distinct from the per-tenant storefront billing at line ~132). Plans: **Starter / Growth / Scale** (₦2k / ₦5k / ₦10k per month; yearly = 2 months free) gated by `org.plan`. Every account starts on a **30-day full-access trial** (no card) — there is **no permanent free tier** (the marketing site was reconciled to this; if product later wants freemium, it's an `org.plan = "free"` row). `GET /billing/plan`, `POST /billing/subscribe|change-plan|cancel` (Paystack/Flutterwave/Stripe recurring + the `stripe`/`paystack` billing webhooks already listed). Plan **limits** (locations, team seats) enforced server-side; over-limit downgrade → read-only, never delete.
**AI credits are metered, not unlimited.** `org.aiCredits` ledger: each plan grants a monthly allowance (100 / 1,000 / 5,000), top-ups via `POST /billing/credits` (packs: 500/₦1,000 · 2,000/₦3,500 · 10,000/₦15,000). Credits are **debited** by: AI assistant turns (`api/ai`), AI ad-copy + **AI ad-video generation** (upcoming — see `api/marketing`), bulk product descriptions, and SMS/email blasts (`api/communications`). Debit atomically in Redis with a DB-backed `credit_transactions` log; refuse the action (graceful 402-style code) when balance is 0 and surface a top-up prompt. Subscription add-ons (extra location/seat/storefront, custom domain, WhatsApp API, onboarding) are line items on `org.addons`.

### `api/expenses`, `api/appointments`, `api/notifications`, `api/affiliate`, `api/analytics`, `api/help`
Expenses (CRUD + approval workflow + receipt upload + expense→ledger auto-post). Appointments (CRUD + reschedule/complete/no-show; optional calendar sync). Notifications (`GET/PATCH /users/me/notifications` + **socket push** + FCM). Affiliate dashboard (clicks, commissions, payout request). Analytics timeseries. Help glossary (read-only).

---

## 5. Cross-cutting (the house-style infrastructure)

- **WebSocket (`core/socket`)** — JWT-authed upgrade → `socketRegistry` (userId→sockets) + a `location`/`org` room index. Event push helpers: `sendToUser`, `sendToLocation`, `sendToOrg`, `sendToAdmins`. Channels: team chat, notifications, **prep queue (KDS)**, live inventory, order/payment status. `SOCKET_EVENTS` enum in `types/socket.type.ts`. Presence in Redis. When the target is offline, fall through to **FCM/web-push** (`push.service`) — same dual-delivery pattern as s-backend calls/chat.
- **Push (`core/push`)** — `push_tokens` per device (register/unregister via `/users/me/push-tokens`, client = `lib/push` + the `pallio-fcm` Tauri plugin). FCM for native, web-push (VAPID) for PWA, with invalid-token cleanup. Master `pushAlerts` kill-switch per user.
- **Webhooks (`api/webhooks` → `/hooks/:provider`)** — signature-verified, written to `webhook_events` (idempotent), then queued to a BullMQ processor. Providers: `paystack`, `flutterwave`, `opay`, `palmpay`, `stripe`, `paypal` (payments + billing), `virtual-accounts` (bank credits → mark order paid), `shopify`, `facebook-marketplace`, couriers (`gig-logistics`, `sendbox`, `kwik`, dhl/fedex/ups → shipment tracking), `email-provider` (bounce/complaint). Host convention `api.pallio.app/hooks/:provider`.
- **Offline sync** — `POST /pos/sync` (batch ingest) is idempotent via `sync_dedupe`; a `sync-ingest` worker upserts and resolves conflicts (last-write-wins on config, append-only on financial docs). Never double-post invoices/returns/movements.
- **File storage (`core/storage`)** — presigned S3/B2 uploads for logos, product/page images, avatars, email attachments, expense receipts, KYC, tax-filing evidence. Return signed URLs; never proxy bytes.
- **OAuth + secrets** — provider app credentials + per-org tokens encrypted at rest; refresh handled server-side. Frontend only ever sees masked previews.
- **Background jobs (BullMQ workers)** — `sync-ingest`, `payment-webhook`, `payout/withdrawal`, `payroll-run`, `email-send`, `catalog-sync` (Shopify/Meta 60s), `report-schedule`, `forecast-nightly`, `recall-notify`, `shipment-tracking-poll`.
- **Audit + correctness** — `activity_log` for every mutation; financial docs (journal entries, payments, payroll, tax) are append-only with reversing entries; period-lock enforced in `postEntry`.

---

## 6. Build sequence (phased; matches `api.isConfigured()` module-by-module cutover)

The frontend swaps mock→real one module at a time (it falls back to mocks when `VITE_API_BASE_URL` is unset), so build in slices and flip each as it lands.

1. **Foundation** — server bootstrap, fluent builder + schema + indexes, Redis, `Response`/`Codes`, auth (login/refresh/`tv`, RBAC guards, org scoping), `users/me`, org/settings, locations, socket skeleton. *(~3–5 wks)*
2. **Catalog + Inventory + offline-sync ingest** — catalog CRUD + variants/modifiers, stock-movements, `POST /pos/sync` idempotent ingest. *(~3–4 wks)*
3. **POS** — invoices/drafts/returns/shifts/gift-cards/loyalty + venue/KDS over socket. *(~3–4 wks)*
4. **Payments + payouts** — Paystack/Flutterwave virtual accounts + webhooks + transfers; wire POS + withdrawals. *(~4–6 wks)*
5. **Accounting** — port `lib/accounting/*` server-side (ledger, auto-post, statements, reconciliation, period-lock) + payroll/commissions/tax. *(~4–6 wks)*
6. **Sales + Purchasing + Reporting** — order→invoice→payment→receipt, vendors/PO/bills, the ~26 reports. *(~5–7 wks)*
7. **Storefront** (admin + public shop + domains/SSL) and **Marketing** + **Integrations/OAuth** + **Communications** (email + team chat) + **AI** (`AI_CHAT_BACKEND.md`) + **push/notifications** + **expenses/appointments/affiliate/analytics**. *(the long tail — fund as phases)*

**MVP = phases 1–4** (auth → inventory → POS → one payment provider + offline sync): a usable, sellable product. Full parity is everything through phase 7.

---

## 7. Notes for the implementer
- Reuse the frontend's typed shapes (`lib/*/types.ts`, `lib/accounting/ledger.ts`, `lib/pos/*`) as the source of truth for collections + DTOs — the schema is largely specced already.
- The double-entry ledger logic is *working frontend code* — porting `postEntry`/`reverseEntry`/`trialBalance`/`profitAndLoss`/`balanceSheet`/`vatSummary` to a service is a translation, not a design problem.
- Keep `org_id = req.user.orgId` baked into every fluent-builder call. The single biggest correctness risk in a multi-tenant SaaS is a missing org filter.
- For money that flows through Paystack/Flutterwave, their webhooks ARE the bank feed for reconciliation — only reach for Mono/Okra to reconcile a separate external operating account.
- **Quick-create DTOs must accept a minimal field set.** List pages (customers, expenses, discounts, tax rates, locations) now open quick-add overlays that submit only the essentials (customer = name+email; expense = amount+date+category; discount = code+type+value; tax rate = name+rate+scope; location = name+code) alongside the full-page forms. So each `POST` create validator defaults everything else rather than requiring the whole form; the full page just sends more of the same shape.
- **`catalog_items.image` is optional.** The frontend renders a deterministic monogram tile (initials + hashed colour) when an item has no photo — there is no server-side stock-photo seeding. Image upload remains `POST /catalog/:sku/image`; absence is normal, not an error state.
