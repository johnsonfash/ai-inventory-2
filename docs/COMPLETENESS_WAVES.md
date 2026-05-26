# Pallio — Completeness & Polish Wave Plan

Created 2026-05-26 from a full UX review + a grounded codebase audit (communications,
commissions, settings, integrations, marketing, app-shell mechanics). This is the
"finish everything" plan — distinct from the earlier simplification waves
(`project_waves_progress.md`). Principles throughout: **mobile-first, simplicity over
features, industry-agnostic, no hard module gating.** Backend is still mocked; each wave
notes what's frontend-doable now vs backend-blocked.

## Coverage map (every review point → wave)

| # | Review point | Wave |
|---|---|---|
| 1 | "Role-based access, biometric unlock" isn't a selling point | W1 |
| 2 | AI-tell em-dash ("— ") in landing copy | W1 |
| 3 | Face ID is not a selling point (device pills) | W1 |
| 4 | "<3s Opens on 4G" weak — use "works offline" / better | W1 |
| 5 | Splash re-shows when navigating dashboard → /pos | W2 |
| 6 | Desktop workspace switcher is redundant (already an org/location dropdown) | W2 |
| 7 | Shop/location list needs max-height + scroll, keep grow animation | W2 |
| 8 | Select popout in a bottom drawer should flip UP near the bottom | W2 |
| 9 | Business logo upload should show instant local preview | W2 |
| 10 | Dashboard quick-action set — is it the best? | W2 |
| 11 | Extend the customers-style quick-add modal/drawer to more list pages | W3 |
| 12 | Communications/templates "not working"; can't view/edit templates; submenus incomplete | W4 |
| 13 | Commissions page not comprehensive | W5 |
| 14 | Settings not complete (broken sub-pages) | W6 |
| 15 | Integrations not complete (depth/per-provider) | W6 |
| 16 | Appointments: staff block time off → admin notified → approve/reject | W7 |
| 17 | Marketing: new listing/ad builder must be intuitive, simple, mobile-first, images+video | W8 |
| 18 | Start an ad from an inventory item AND support non-inventory subjects (app, service, custom) | W8 |
| 19 | Add TikTok ads (not just Meta/YouTube/Google) | W8 |
| 20 | AI video ad generation (HeyGen-style), chat-to-build, format/style per platform, edit-via-chat, one-click deploy; not all ads are video (fliers/images too) | W9 |
| 21 | Advanced ad analytics + performance monitoring; must work for non-goods subjects | W10 |

## Audit corrections (so the plan is honest)

- **`/communications/templates` does render** — it's a real grid with category filters. The gap: the **"Clone/Edit" button has no handler** and there is **no template editor/create route**, so you can't actually view-in-full or edit a template. That's why it feels broken.
- **Team chat exists** (`src/pages/sales/team/chat/index.tsx`, ~300 lines) — not missing; needs a completeness pass, not a build.
- **Integrations is more complete than it looks** — 24 providers, a working generic connect/test/disconnect flow, and a dynamic `[id]` detail page. The real gap is **per-provider setup guidance + real OAuth/webhook wiring** (mostly backend), not missing pages.
- **Dashboard quick actions already has 6** (New sale, Add item, Receive stock, New customer, Scan label, Add expense) — not 4. We'll still review the set for relevance + role/industry awareness.
- **Settings has 7 genuinely missing pages** reachable from the hub: `team, billing, api, webhooks, automations, export, audit` — routes exist, files don't → broken/empty renders.

---

## W1 — Marketing-site copy & positioning (quick)
**Goal:** Kill the remaining robotic / non-selling-point copy.
**Scope:**
- Replace the **"Role-based access, biometric unlock"** feature card with a real selling point: team accountability + the right access per person (cashier/rep/marketer), multi-cashier, live audit. Biometric becomes a one-line security footnote, not a headline.
- **De-emphasize Face ID** in the device pills (`landing.tsx` DeviceShowcase) — drop "Face ID" from the iOS pill; it's table-stakes, not a reason to buy.
- Replace the **"<3s Opens on 4G"** stat with **"Works offline"** (or "Sells through a power cut") — already true and a stronger hook.
- **Em-dash sweep**: replace " — " AI-tells across `landing.tsx`, `about.tsx`, `pricing.tsx`, `faq.tsx` with periods/commas/parentheticals so copy reads human.
- Final read-through of all marketing-site copy for any remaining generic lines.
**Backend:** none. **Size:** ~1–2 hrs. All frontend.

## W2 — App-shell mechanics & polish (cross-cutting)
**Goal:** Fix the shell-level papercuts that touch every screen.
**Scope:**
- **Splash re-show fix.** Cause: navigating to a lazily-loaded heavy route (POS) shows the Suspense fallback (`ContentLoader` in `App.tsx`) over a fading `RouteTransition`, which reads like the cold-start splash. Fix: (a) give route-level Suspense an **in-app skeleton** that never resembles the boot splash; (b) keep the previous page painted during chunk load (or render skeleton in the content region only, sidebar/header stay); (c) **prefetch the POS chunk** on idle / on hover of the POS nav item. Ensure the `index.html` splash markup is never reused for route loads.
- **Workspace switcher dedupe.** On desktop both `OrgLocationSwitch` (header) and `WorkspaceSwitcher` (inside user menu) show org+location. Keep the header switcher on desktop; **hide `WorkspaceSwitcher` on desktop**, keep it for mobile (where there's no header switcher).
- **Location/shop list max-height + scroll.** `workspace-switcher.tsx` OptionList animates height but has no cap. Add `max-h-[…] overflow-y-auto` **while preserving the framer-motion grow animation** (animate height to a capped value; inner list scrolls). Same treatment anywhere a long org/location list can appear.
- **Select collision flip-up.** The custom `ui/select.tsx` uses absolute positioning, `max-h-60`, no portal, no flip — so inside a bottom sheet near the screen bottom it opens downward and gets clipped. Add **viewport-aware flip** (measure trigger rect; open upward when near bottom) and ensure it isn't clipped by the sheet's `overflow-y-auto` (portal to body or `position: fixed`). Reference: jaxtechnology's floating select. This unblocks W3.
- **Business logo instant preview.** `settings/business` logo is a bare file input. Add `onChange` → `URL.createObjectURL` → show the chosen logo immediately (with the brand-mark fallback). Upload %/persistence deferred to backend.
- **Dashboard quick-actions review.** Confirm/trim the 6-action set; make it **role- and industry-aware** (e.g. a kitchen sees "New prep", a service business sees "New appointment"); verify mobile 3-col layout. Consider adding "New listing/ad" once W8 lands.
**Backend:** logo upload %, real org list (events already abstracted). **Size:** ~1–1.5 days. Mostly frontend.

## W3 — Quick-add overlay expansion
**Goal:** Extend the well-received customers quick-add (modal on desktop / bottom-drawer on mobile) to every list page where a *simple* create suffices, keeping rich creates as full pages.
**Scope:**
- Audit every list/index page and classify: **quick-add overlay** vs **stays a full page** (rich/multi-step). Likely overlay candidates: discounts, tax rates, warehouses/locations (done some already), vendors, customer segments, expenses, simple appointment, printers, roles-lite. Stays full page: inventory item (rich), recipe/BOM, invoice/order, storefront product, campaign/listing.
- Reuse `BottomSheet` (responsive) + the existing `add-*-dialog` pattern. Each overlay: minimal fields + "More details →" to the full page.
- Depends on **W2 Select flip-up** so selects inside the drawers behave near the bottom.
- Deliver a short matrix in this doc of page → decision.
**Backend:** none (mock-prepend like customers). **Size:** ~1.5–2 days. Frontend.

**Decision matrix (overlay = quick-add modal/drawer; page = keep full /new):**
| Entity | Decision | Status |
|---|---|---|
| Customer | overlay (`add-customer-dialog`) | ✅ done |
| Discount | overlay (`add-discount-dialog`) | ✅ done |
| Expense | overlay (`add-expense-dialog`) | ✅ done |
| Tax rate | overlay (`add-tax-rate-dialog`) | ✅ done |
| Warehouse | overlay (`add-warehouse-dialog`) | ✅ done |
| **Vendor** | overlay (`add-vendor-dialog`, "More details" → /new) | ✅ done (W3) |
| **Printer** | overlay (`add-printer-dialog`, no full page needed) | ✅ done (W3) |
| Inventory item | **page** — rich (variants, recipe, stock, images) | keep |
| Recipe / BOM | **page** — rich builder | keep |
| Sales order / invoice / shipment / return | **page** — multi-line money docs | keep |
| Purchase order / bill / receipt / vendor-credit | **page** — multi-line money docs | keep |
| Team member / role | **page** — invite flow + permission matrix | keep |
| Payment account / withdrawal | **page** — sensitive / KYC | keep |
| Storefront product | **page** — rich (media, variants, SEO) | keep |

## W4 — Communications completeness
**Goal:** Make the whole Communications section real and editable.
**Scope:**
- **Template editor + create.** Add `/communications/templates/new` and `/communications/templates/:id` editor pages (subject + rich body + token manager + category + preview). Wire the dead **Clone/Edit** button: builtin → clone into an editable user copy; user template → edit. Add a **preview modal** and delete-with-confirm. Make "view my templates / edit them" actually work.
- **Message detail/preview** page (or drawer) so inbox rows open; add read/unread, bulk select + bulk actions, and an attachment field on compose.
- **Provider routing** in compose: choose channel (email / WhatsApp / SMS) per the connected integrations, not email-only (UI now, send deferred to backend).
- **Team chat pass**: it exists — verify it works end-to-end (channels, history, presence placeholders), align with the socket plan, fix any dead controls.
- Sweep the Communications nav/submenus for any other dead buttons.
**Backend:** real send (Resend/Mailgun/WhatsApp/Twilio), socket chat, attachment upload. **Size:** ~2–3 days. Frontend now, backend later.

## W5 — Commissions completeness
**Goal:** Turn the commissions ledger into a comprehensive system.
**Scope:**
- **Commission rule engine** (data layer + config UI): rates/tiers by role (affiliate vs sales-rep), by product/category, by performance threshold (e.g. +1% over ₦X), per-rep overrides, time-boxed rates. Today rates are hardcoded per entry.
- **Per-rep commission statements**: a rep detail view with earned/pending/approved/paid history, breakdown by order, period-over-period compare, dispute/adjustment note. Link from the leaderboard and to `/affiliate/dashboard`.
- **Payout workflow**: approve/reject with reason, batch pay (Paystack), receipts; **WHT** calculation + statement (lifecycle text already promises it); **export** (CSV/PDF); GL posting hook (commission → expense) tying into the accounting auto-post track.
- Clarify affiliate vs sales-rep attribution (which sale earned whose commission).
**Backend:** payouts, GL posting, WHT filing. **Size:** ~3 days. Frontend rules/statements now; payouts backend-blocked.

## W6 — Settings & integrations completeness
**Goal:** No broken settings tiles; integrations gain real depth.
**Scope:**
- **Build the 7 missing settings pages** (routes exist, files don't):
  - `billing` — subscription (Starter/Growth/Scale), **AI credits balance + top-up + usage**, add-ons, invoices. Ties to the pricing model + `api/billing` in BACKEND_PLAN.
  - `api` — API keys (create/revoke/scopes, masked).
  - `webhooks` — endpoint registration + event log + secrets.
  - `automations` — simple "when X then Y" rules hub (e.g. low-stock → email).
  - `export` — full data export (CSV/zip), GL export link.
  - `audit` — activity-log viewer (also serves the accounting audit-log gap).
  - `team` — decide: build, or redirect/merge into `/settings/users` (avoid duplicate). Recommendation: redirect to `users`.
- **Integrations depth**: bespoke setup guidance for the NG-first providers that currently fall to the generic page (Paystack, Flutterwave, Opay, PalmPay — webhook/settlement instructions), plus a clearer connect/test state. Real OAuth/webhooks are backend.
- Verify no other settings hub tile is a dead link.
**Backend:** billing/credits, API keys, webhooks, real export, audit feed, OAuth. **Size:** ~3–4 days. Frontend shells now; data backend-blocked.

## W7 — Appointments: staff availability & leave
**Goal:** Staff can block time off; admin is notified and approves/rejects.
**Scope:**
- Staff can mark **unavailable blocks / leave requests** on their calendar (date range, reason, all-day or partial).
- Request enters a **pending** state; **admin notification** (notification center + push later) with **approve/reject** (reason on reject).
- Approved leave reflects on the calendar (staff shown unavailable; booking prevented during leave); rejected returns to available.
- Roles: who can request vs approve (RBAC). Mobile-first request flow (quick-add overlay per W3).
**Backend:** persistence, notifications/push, calendar sync. **Size:** ~2 days. Frontend now.

## W8 — Marketing builder rework (mobile-first)
**Goal:** A best-in-class, simple ad/listing builder that beats competitors, on mobile first.
**Scope:**
- **Add TikTok ads** as a first-class channel; refactor channels to be **data-driven** (one config array → dashboard cards, listing form toggles, routes, integration provider). Slots: `index.tsx` CHANNELS, `listings/new` Channel union, `lib/integrations/data.ts`, routes. (Also tidy Google/YouTube naming.)
- **Subject types** so ads aren't goods-only: **Product (from inventory) · Service · App · Custom**. Inventory picker uses real catalog search (mocked now); non-inventory subjects take a free-form title/description/media + destination URL.
- **Rework `/marketing/listings/new`**: mobile-first, dead-simple, comprehensive. Multi-image upload + **video** (with thumbnail), per-channel **live preview** (how it looks on Feed/Reels/TikTok/Marketplace), budget/audience/schedule with sane defaults, draft + publish-to-selected-channels.
- Make the per-channel "new-campaign/new-listing" wrappers share the reworked builder.
**Backend:** Meta/TikTok/Google ad APIs, media upload, publish. **Size:** ~3–4 days. Frontend now.

## W9 — AI ad generation (credits-metered)
**Goal:** Generate ads — copy, fliers/images, and video — from a chat-style builder.
**Scope:**
- **Chat-to-build** surface inside the ad builder: describe the ad → generate **copy + image/flier + short video**. Not all ads are video — support image/flier/carousel/text too.
- **Video** via a HeyGen-style provider; **format/style presets per platform** (Reels/TikTok vertical, YouTube, Feed square), pulling product media/price when subject = inventory item.
- **Edit-via-chat** preview loop ("make it shorter", "warmer tone", "swap the hook"), then **one-click deploy** to the selected social channel(s).
- **Credits metering** (debits `org.aiCredits` per BACKEND_PLAN `api/billing`); graceful "top up" prompt at zero.
- Entry point: from the builder after choosing a subject (inventory item or custom).
**Backend:** generation providers (HeyGen/image/LLM) behind a worker, media to S3/B2, publish, credit ledger. **Size:** ~4–5 days. Heavily backend; frontend builds the chat UX + previews against mocks first.

## W10 — Ad analytics & performance monitoring
**Goal:** See and act on ad performance across channels, for any subject.
**Scope:**
- Per-campaign + **cross-channel** analytics: spend, impressions, clicks, conversions, **ROAS**, CPA, with attribution windows.
- **Performance monitoring**: alerts (ROAS below threshold, budget pacing), optimization suggestions, A/B variant comparison, auto-pause rules surfaced.
- Works for **non-goods subjects** too (app installs, service leads — track the relevant conversion event, not just product sales).
- Tie insights into the dashboard AI insight cards.
**Backend:** ad-platform metric sync (cron), conversion events, attribution. **Size:** ~2–3 days frontend; data backend-blocked.

---

## Suggested order & dependencies
1. **W1** (quick copy) → **W2** (shell mechanics; W2 Select fix unblocks W3) → **W3** (overlays).
2. Content completeness in parallel-ish: **W4** (comms), **W5** (commissions), **W6** (settings/integrations), **W7** (appointments).
3. Marketing program last (biggest): **W8** (builder) → **W9** (AI gen) → **W10** (analytics). W9 depends on the credits/billing backend (`api/billing`) and a generation provider.

MVP-of-this-plan to ship visible value fast: **W1 + W2 + W3**. Then pick the highest-pain content wave (likely **W4** or **W6**).

Related backend spec: `docs/BACKEND_PLAN.md` (`api/billing` credits, `api/marketing` AI gen). Memory: `project_marketing_site_and_pricing.md`, `project_waves_progress.md`.
