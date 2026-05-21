import { kv } from "@/lib/storage/kv"
import type { IntegrationConnection, IntegrationProvider, IntegrationStatus } from "./types"

// Catalogue of supported integrations. Heavy on the Nigerian payment
// stack (Paystack, Flutterwave, Opay, PalmPay) since that's our first
// market, then the international rails (Stripe, Shopify) + the comms +
// team channels every business eventually needs.
//
// Brand hex values are the official primaries from each provider's
// brand guidelines — used as inline tile backgrounds in lieu of PNG
// logos (which would force us to ship + license real artwork).

export const PROVIDERS: IntegrationProvider[] = [
  // ----------------- Payments -----------------
  {
    id: "paystack",
    name: "Paystack",
    tagline: "Nigeria's most-used payment rail. Cards, bank transfer, USSD, mobile money.",
    description:
      "Connect your Paystack account and Pallio will route checkouts + invoices through it. Settlements arrive next-day to your Nigerian bank account. We never see card data; Paystack handles PCI scope.",
    category: "payments",
    letter: "P",
    brand: "#0FA958",
    docsUrl: "https://dashboard.paystack.com/#/settings/developer",
    tag: { label: "Recommended for Nigeria", tone: "success" },
    fields: [
      { key: "publicKey", label: "Public key",  kind: "text",     placeholder: "pk_live_…",  required: true, hint: "Starts with pk_live_ for production." },
      { key: "secretKey", label: "Secret key",  kind: "password", placeholder: "sk_live_…",  required: true, sensitive: true },
      { key: "webhook",   label: "Webhook URL", kind: "text",     placeholder: "https://api.pallio.app/hooks/paystack", hint: "Paste this into Paystack → Settings → Webhooks." },
    ],
  },
  {
    id: "flutterwave",
    name: "Flutterwave",
    tagline: "Multi-currency payments across Nigeria, Kenya, Ghana, and beyond.",
    description:
      "If you sell across Africa, Flutterwave gives you NGN + KES + GHS + ZAR + USD checkout in one connection. Plug in your secret key and Pallio routes the right currency per country automatically.",
    category: "payments",
    letter: "F",
    brand: "#F5A623",
    docsUrl: "https://app.flutterwave.com/dashboard/settings/apis",
    tag: { label: "Multi-currency", tone: "brand" },
    fields: [
      { key: "publicKey",  label: "Public key",     kind: "text",     placeholder: "FLWPUBK-…", required: true },
      { key: "secretKey",  label: "Secret key",     kind: "password", placeholder: "FLWSECK-…", required: true, sensitive: true },
      { key: "encryptKey", label: "Encryption key", kind: "password", placeholder: "FLWSECK_TEST…", sensitive: true, hint: "Optional — required for direct card charges." },
    ],
  },
  {
    id: "opay",
    name: "Opay",
    tagline: "Wallet + virtual account payouts. Great for in-person merchants.",
    description:
      "Customers pay you straight from their Opay wallet; Pallio reconciles the inbound transfer to the right invoice automatically. Ideal if your business takes a lot of small-value transactions.",
    category: "payments",
    letter: "O",
    brand: "#1DBF73",
    docsUrl: "https://documentation.opaycheckout.com/",
    fields: [
      { key: "merchantId", label: "Merchant ID",  kind: "text",     placeholder: "OPAYMER-…",  required: true },
      { key: "publicKey",  label: "Public key",   kind: "text",     placeholder: "OPAYPUB-…",  required: true },
      { key: "privateKey", label: "Private key",  kind: "password", placeholder: "OPAYPRIV-…", required: true, sensitive: true },
    ],
  },
  {
    id: "palmpay",
    name: "PalmPay",
    tagline: "Wallet + agent payouts. Strong in non-card-using customers.",
    description:
      "Same wallet-first model as Opay with a slightly different agent network. We recommend connecting BOTH so wallet-paying customers get a checkout that matches their preferred app.",
    category: "payments",
    letter: "Pp",
    brand: "#7A4DFF",
    fields: [
      { key: "merchantId", label: "Merchant ID",  kind: "text",     placeholder: "PALM-MID-…", required: true },
      { key: "appId",      label: "App ID",       kind: "text",     placeholder: "APP-…",      required: true },
      { key: "secretKey",  label: "API secret",   kind: "password", placeholder: "PALM-SECRET-…", required: true, sensitive: true },
    ],
  },
  {
    id: "stripe",
    name: "Stripe",
    tagline: "Card payments for international customers + recurring billing.",
    description:
      "Use Stripe when you sell to customers outside Nigeria — it gives you USD/EUR/GBP card acceptance + recurring subscriptions. Pallio handles the webhook reconciliation against your invoices automatically.",
    category: "payments",
    letter: "S",
    brand: "#635BFF",
    docsUrl: "https://dashboard.stripe.com/apikeys",
    fields: [
      { key: "publishable", label: "Publishable key", kind: "text",     placeholder: "pk_live_…",  required: true },
      { key: "secret",      label: "Secret key",      kind: "password", placeholder: "sk_live_…",  required: true, sensitive: true },
      { key: "webhookSecret", label: "Webhook signing secret", kind: "password", placeholder: "whsec_…", sensitive: true, hint: "From Stripe Dashboard → Webhooks." },
    ],
  },

  // ----------------- Commerce -----------------
  {
    id: "shopify",
    name: "Shopify",
    tagline: "Sync your storefront catalog + orders both ways.",
    description:
      "Pull your Shopify products into Pallio (one inventory pool to run + report on) and push order fulfilment back. Two-way sync runs on a 60-second loop with conflict resolution via last-write-wins.",
    category: "commerce",
    letter: "Sh",
    brand: "#7AB55C",
    docsUrl: "https://shopify.dev/docs/api/admin-rest#authentication",
    fields: [
      { key: "shop",       label: "Shop subdomain", kind: "text",     placeholder: "yourstore.myshopify.com", required: true },
      { key: "accessToken",label: "Admin API access token", kind: "password", placeholder: "shpat_…", required: true, sensitive: true },
    ],
  },
  {
    id: "woocommerce",
    name: "WooCommerce",
    tagline: "WordPress storefront sync — products, orders, inventory.",
    description:
      "Run WooCommerce on WordPress? Generate a REST API key and Pallio keeps your product + stock + order state in lockstep. Works alongside any of the payment integrations.",
    category: "commerce",
    letter: "W",
    brand: "#7F54B3",
    fields: [
      { key: "siteUrl",      label: "Site URL",          kind: "url",      placeholder: "https://yourstore.com", required: true },
      { key: "consumerKey",  label: "Consumer key",      kind: "text",     placeholder: "ck_…", required: true },
      { key: "consumerSecret", label: "Consumer secret", kind: "password", placeholder: "cs_…", required: true, sensitive: true },
    ],
  },

  // ----------------- Comms -----------------
  {
    id: "whatsapp-cloud",
    name: "WhatsApp Business",
    tagline: "Send invoices, receipts + restock alerts via WhatsApp Cloud API.",
    description:
      "Meta's WhatsApp Cloud API turns Pallio into a WhatsApp-first business — every receipt, every invoice, every restock alert can land in the customer's chat instead of email. Especially powerful for the Nigerian market where WhatsApp is the default channel.",
    category: "comms",
    letter: "Wa",
    brand: "#25D366",
    docsUrl: "https://developers.facebook.com/docs/whatsapp/cloud-api",
    tag: { label: "Nigerian channel of choice", tone: "success" },
    fields: [
      { key: "phoneNumberId", label: "Phone number ID",  kind: "text",     placeholder: "1234567890",     required: true },
      { key: "accessToken",   label: "Permanent access token", kind: "password", placeholder: "EAA…", required: true, sensitive: true },
      { key: "verifyToken",   label: "Webhook verify token",   kind: "password", placeholder: "self-chosen", sensitive: true, hint: "Same value you set in Meta's webhook UI." },
    ],
  },
  {
    id: "twilio",
    name: "Twilio SMS",
    tagline: "Send transactional SMS for delivery updates + 2FA.",
    description:
      "Plug in your Twilio account SID + auth token and Pallio sends SMS reminders + delivery updates + 2FA codes. Good fallback when email goes to spam or WhatsApp isn't installed.",
    category: "comms",
    letter: "T",
    brand: "#F22F46",
    fields: [
      { key: "accountSid", label: "Account SID",  kind: "text",     placeholder: "AC…", required: true },
      { key: "authToken",  label: "Auth token",   kind: "password", placeholder: "your auth token", required: true, sensitive: true },
      { key: "fromNumber", label: "From number",  kind: "text",     placeholder: "+14155551234", required: true, hint: "Must be a Twilio-owned number." },
    ],
  },
  {
    id: "mailgun",
    name: "Mailgun",
    tagline: "Transactional email delivery — receipts, invoices, password resets.",
    description:
      "When you send an invoice or a receipt via Pallio's Communications module, Mailgun is the actual delivery rail. High inbox-placement rate + built-in bounce + unsubscribe tracking.",
    category: "comms",
    letter: "M",
    brand: "#F06B66",
    fields: [
      { key: "domain", label: "Domain",  kind: "text",     placeholder: "mg.pallio.app", required: true, hint: "The verified domain in your Mailgun dashboard." },
      { key: "apiKey", label: "API key",  kind: "password", placeholder: "key-…",         required: true, sensitive: true },
      { key: "region", label: "Region",   kind: "select",  options: [{ value: "us", label: "US" }, { value: "eu", label: "EU" }] },
    ],
  },

  // ----------------- Team -----------------
  {
    id: "slack",
    name: "Slack",
    tagline: "Send low-stock + big-sale alerts to a team channel.",
    description:
      "Pallio drops a message in your team Slack any time something interesting happens — an item crosses the reorder threshold, a sale over a threshold lands, a refund is issued. Customisable per-channel via Settings → Notifications.",
    category: "team",
    letter: "Sl",
    brand: "#4A154B",
    fields: [
      { key: "webhookUrl", label: "Incoming webhook URL", kind: "url", placeholder: "https://hooks.slack.com/services/…", required: true, sensitive: true, hint: "From Slack → your workspace → Apps → Incoming Webhooks." },
      { key: "channel",    label: "Default channel",      kind: "text", placeholder: "#pallio-alerts" },
    ],
  },

  // ----------------- Analytics -----------------
  {
    id: "ga4",
    name: "Google Analytics 4",
    tagline: "Track storefront + checkout events.",
    description:
      "Ship GA4 events for every catalog view, add-to-cart, and completed purchase. Helpful if you're running ads in Google Ads or Performance Max — gives them real conversion data to optimise against.",
    category: "analytics",
    letter: "G",
    brand: "#F9AB00",
    fields: [
      { key: "measurementId", label: "Measurement ID",  kind: "text",     placeholder: "G-XXXXXXXXXX", required: true },
      { key: "apiSecret",     label: "Measurement Protocol API secret", kind: "password", placeholder: "secret", required: true, sensitive: true },
    ],
  },

  // ----------------- Delivery -----------------
  {
    id: "gig-logistics",
    name: "GIG Logistics",
    tagline: "Nigeria's largest local courier — same-day Lagos, next-day nationwide.",
    description:
      "Connect GIGL and Pallio buys labels straight from your sales orders. Real-time rate quotes at checkout, customer-facing tracking links, COD reconciliation. Best for Nigerian operators selling within-country.",
    category: "delivery",
    letter: "G",
    brand: "#E2231A",
    docsUrl: "https://giglogistics.com/api",
    tag: { label: "Recommended for Nigeria", tone: "success" },
    fields: [
      { key: "stationId",   label: "Station ID",   kind: "text",     placeholder: "STN-1234",     required: true, hint: "Your GIGL station/pickup hub code." },
      { key: "apiKey",      label: "API key",      kind: "password", placeholder: "gigl_…",       required: true, sensitive: true },
      { key: "merchantId",  label: "Merchant ID",  kind: "text",     placeholder: "MCH-9090",     required: true },
      { key: "codEnabled",  label: "Enable cash-on-delivery", kind: "switch", hint: "GIGL collects cash from the buyer and remits weekly." },
    ],
  },
  {
    id: "sendbox",
    name: "Sendbox",
    tagline: "Multi-carrier shipping aggregator across West Africa.",
    description:
      "One API → 30+ couriers. Sendbox compares live rates from GIGL, DHL Express, FedEx, Kwik, Topship, and your local options, picks the cheapest (or fastest) per parcel, and prints the label.",
    category: "delivery",
    letter: "S",
    brand: "#0066FF",
    docsUrl: "https://docs.sendbox.co",
    tag: { label: "Multi-carrier", tone: "brand" },
    fields: [
      { key: "apiKey",        label: "API key",         kind: "password", placeholder: "sb_live_…", required: true, sensitive: true },
      { key: "defaultMode",   label: "Default rate mode", kind: "select", required: true, options: [
        { value: "cheapest", label: "Cheapest available" },
        { value: "fastest",  label: "Fastest" },
        { value: "balanced", label: "Balanced (price + speed)" },
      ] },
      { key: "pickupAddress", label: "Pickup address",  kind: "text",     placeholder: "12 Admiralty Way, Lekki, Lagos" },
    ],
  },
  {
    id: "kwik",
    name: "Kwik Delivery",
    tagline: "On-demand last-mile in Lagos, Abuja & Port Harcourt.",
    description:
      "Sub-2-hour intra-city delivery for hot orders. Kwik dispatches a bike rider as soon as the order's ready. Great for restaurants + fashion drops where the customer is waiting at home.",
    category: "delivery",
    letter: "K",
    brand: "#FF6A00",
    docsUrl: "https://business.kwik.delivery",
    fields: [
      { key: "apiKey",       label: "API key",        kind: "password", placeholder: "kwik_…", required: true, sensitive: true },
      { key: "businessId",   label: "Business ID",    kind: "text",     placeholder: "biz_…",  required: true },
      { key: "autoDispatch", label: "Auto-dispatch on paid orders", kind: "switch" },
    ],
  },
  {
    id: "dhl-express",
    name: "DHL Express",
    tagline: "International next-day for cross-border orders.",
    description:
      "Worldwide door-to-door with full tracking + customs paperwork generated automatically. Best for B2B exports + diaspora customers ordering from outside Nigeria.",
    category: "delivery",
    letter: "D",
    brand: "#FFCC00",
    docsUrl: "https://developer.dhl.com",
    fields: [
      { key: "accountNumber", label: "Account number", kind: "text",     placeholder: "123456789", required: true },
      { key: "apiUser",       label: "API user",       kind: "text",     placeholder: "your_user", required: true },
      { key: "apiPassword",   label: "API password",   kind: "password", placeholder: "•••••",     required: true, sensitive: true },
    ],
  },
  {
    id: "fez-delivery",
    name: "Fez Delivery",
    tagline: "Nigerian inter-state at SME-friendly rates.",
    description:
      "Fez gives you Lagos-to-Abuja in 24h, nationwide in 48h, with cash-on-delivery and pay-on-pickup options. Strong for FMCG + apparel SMBs.",
    category: "delivery",
    letter: "F",
    brand: "#1E40AF",
    docsUrl: "https://fezdelivery.co/api",
    fields: [
      { key: "apiKey",     label: "API key",     kind: "password", placeholder: "fez_…",      required: true, sensitive: true },
      { key: "secretKey",  label: "Secret key",  kind: "password", placeholder: "fez_sk_…",   required: true, sensitive: true },
    ],
  },

  // ----------------- Marketing -----------------
  {
    id: "mailchimp",
    name: "Mailchimp",
    tagline: "Email marketing + automated campaigns.",
    description:
      "Sync your customer list and Pallio fires welcome flows, abandoned-cart reminders, and post-purchase reviews automatically. Each campaign's revenue attribution flows back into the Marketing ROAS view.",
    category: "marketing",
    letter: "M",
    brand: "#FFE01B",
    docsUrl: "https://mailchimp.com/developer",
    tag: { label: "Popular", tone: "info" },
    fields: [
      { key: "apiKey",     label: "API key",     kind: "password", placeholder: "abc123-us21", required: true, sensitive: true, hint: "Find under Account → Extras → API keys." },
      { key: "listId",     label: "Default audience ID", kind: "text", placeholder: "9a8b7c6d5e", required: true },
      { key: "syncOnSale", label: "Auto-add new customers to the list", kind: "switch", hint: "GDPR-safe: only opted-in customers get synced." },
    ],
  },
  {
    id: "klaviyo",
    name: "Klaviyo",
    tagline: "Behaviour-triggered email + SMS for ecommerce.",
    description:
      "More powerful than Mailchimp for storefronts: triggers based on browse + cart events, predictive analytics on customer lifetime value. Worth the upgrade once your list crosses 5,000.",
    category: "marketing",
    letter: "K",
    brand: "#222222",
    docsUrl: "https://www.klaviyo.com/account#api-keys",
    fields: [
      { key: "publicApiKey",  label: "Public API key",  kind: "text",     placeholder: "ABC123", required: true },
      { key: "privateApiKey", label: "Private API key", kind: "password", placeholder: "pk_…",   required: true, sensitive: true },
    ],
  },
  {
    id: "meta-pixel",
    name: "Meta Pixel",
    tagline: "Track FB / IG conversions back to ad campaigns.",
    description:
      "Drops the Meta tracking pixel + Conversions API events on your storefront so Facebook + Instagram ads optimise against real purchases (not just clicks). Required to compute ROAS on the Marketing dashboard.",
    category: "marketing",
    letter: "M",
    brand: "#1877F2",
    docsUrl: "https://www.facebook.com/business/help/952192354843755",
    fields: [
      { key: "pixelId",      label: "Pixel ID",       kind: "text",     placeholder: "123456789012345", required: true },
      { key: "accessToken",  label: "CAPI access token", kind: "password", placeholder: "EAA…",        required: true, sensitive: true },
    ],
  },

  // ----------------- Accounting -----------------
  {
    id: "quickbooks",
    name: "QuickBooks Online",
    tagline: "Push every transaction into your accountant's books.",
    description:
      "Sales, expenses, payments, and refunds flow from Pallio into QuickBooks under the right account codes. Your accountant gets clean books without re-keying. Two-way sync keeps stock + COGS aligned.",
    category: "accounting",
    letter: "Q",
    brand: "#2CA01C",
    docsUrl: "https://developer.intuit.com",
    tag: { label: "Recommended", tone: "success" },
    fields: [
      { key: "companyId",   label: "Company ID",  kind: "text",     placeholder: "1234567890",  required: true },
      { key: "refreshToken",label: "Refresh token", kind: "password", placeholder: "AB1…",      required: true, sensitive: true, hint: "Generated after OAuth handshake." },
    ],
  },
  {
    id: "xero",
    name: "Xero",
    tagline: "Cloud accounting with strong African + commonwealth coverage.",
    description:
      "Same idea as QuickBooks — Pallio posts journals so your accountant works in Xero rather than your inbox. Sub-account mapping is configurable, so you don't lose detail.",
    category: "accounting",
    letter: "X",
    brand: "#13B5EA",
    docsUrl: "https://developer.xero.com",
    fields: [
      { key: "tenantId",    label: "Tenant ID",     kind: "text",     placeholder: "abc-123-def", required: true },
      { key: "clientId",    label: "Client ID",     kind: "text",     placeholder: "OAuth client ID", required: true },
      { key: "clientSecret", label: "Client secret", kind: "password", placeholder: "•••",        required: true, sensitive: true },
    ],
  },
  {
    id: "sage",
    name: "Sage Business Cloud",
    tagline: "Enterprise-grade accounting for larger Nigerian businesses.",
    description:
      "When you've outgrown spreadsheets but need stronger audit + multi-entity than QuickBooks. Sage is what Nigerian banks + tax authorities recognise on enterprise audits.",
    category: "accounting",
    letter: "S",
    brand: "#00DC00",
    docsUrl: "https://developer.sage.com",
    fields: [
      { key: "tenantId",   label: "Tenant ID",  kind: "text",     placeholder: "tnt-…", required: true },
      { key: "apiKey",     label: "API key",    kind: "password", placeholder: "sage_…", required: true, sensitive: true },
    ],
  },

  // ----------------- Analytics -----------------
  {
    id: "mixpanel",
    name: "Mixpanel",
    tagline: "Product analytics — what shoppers actually do on your site.",
    description:
      "Funnel + cohort analytics beyond GA4. See exactly where shoppers drop off in checkout, which products cross-sell well, and which customer cohorts churn. Pallio pushes event streams automatically.",
    category: "analytics",
    letter: "M",
    brand: "#7856FF",
    docsUrl: "https://developer.mixpanel.com",
    fields: [
      { key: "projectToken", label: "Project token", kind: "password", placeholder: "•••",  required: true, sensitive: true },
      { key: "secret",       label: "API secret",    kind: "password", placeholder: "•••",  sensitive: true },
    ],
  },
]

// ---------- kv-backed connection state ----------
const STORAGE_KEY = "pallio:integrations"

function readState(): Record<string, IntegrationConnection> {
  const raw = kv.get(STORAGE_KEY)
  if (!raw) return {}
  try {
    return JSON.parse(raw) as Record<string, IntegrationConnection>
  } catch {
    return {}
  }
}

function writeState(state: Record<string, IntegrationConnection>): Promise<void> {
  return kv.set(STORAGE_KEY, JSON.stringify(state))
}

export function getConnections(): Record<string, IntegrationConnection> {
  return readState()
}

export function getConnection(id: string): IntegrationConnection | undefined {
  return readState()[id]
}

export function getStatus(id: string): IntegrationStatus {
  return readState()[id]?.status ?? "disconnected"
}

/** Connect a provider — stores masked field hints + an event row.
 *  Real backend would persist credentials server-side. Here we just
 *  mark it connected + remember the last few characters of each
 *  sensitive field so the detail page can show a hint. */
export async function connectProvider(
  id: string,
  fields: Record<string, string>,
): Promise<void> {
  const state = readState()
  const masked: Record<string, string> = {}
  for (const [k, v] of Object.entries(fields)) {
    if (!v) continue
    masked[k] = v.length > 6 ? `•••• ${v.slice(-4)}` : "•••• " + v
  }
  state[id] = {
    providerId: id,
    status: "connected",
    fieldsMasked: masked,
    connectedAt: new Date().toISOString(),
    events: [
      ...(state[id]?.events ?? []),
      { at: new Date().toISOString(), kind: "connected" as const, message: "Connection saved + credentials encrypted." },
    ].slice(-20),
  }
  await writeState(state)
}

export async function recordTest(id: string, ok: boolean): Promise<void> {
  const state = readState()
  const existing = state[id]
  if (!existing) return
  existing.events = [
    ...existing.events,
    { at: new Date().toISOString(), kind: (ok ? "test" : "error") as "test" | "error", message: ok ? "Test request returned 200." : "Test request failed — check the secret + try again." },
  ].slice(-20)
  existing.status = ok ? "connected" : "error"
  await writeState(state)
}

export async function disconnectProvider(id: string): Promise<void> {
  const state = readState()
  const existing = state[id]
  if (existing) {
    existing.events.push({ at: new Date().toISOString(), kind: "disconnected", message: "Disconnected — credentials revoked." })
  }
  delete state[id]
  await writeState(state)
}

export function getProvider(id: string): IntegrationProvider | undefined {
  return PROVIDERS.find((p) => p.id === id)
}

// ---------- Per-provider insights ----------
// Each provider returns a 3- or 4-tile snapshot of "what Pallio is
// actually doing with this connection" — surfaced on the detail
// page. Dummy-data world: numbers are computed from the connection
// `connectedAt` so they look stable per session. Real backend will
// replace with live telemetry.
import type { IntegrationInsight } from "./types"

function daysSince(iso: string): number {
  return Math.max(1, Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000))
}

export function getInsights(providerId: string, connection: IntegrationConnection): IntegrationInsight[] {
  const provider = getProvider(providerId)
  if (!provider) return []
  const d = daysSince(connection.connectedAt)
  const seed = (provider.id.charCodeAt(0) + d) % 7
  // Provider-specific shapes. The fixed-arithmetic make the tiles
  // feel real ("845 events processed") without claiming live data.
  switch (provider.category) {
    case "payments":
      return [
        { label: "Payments processed", value: `${(120 + d * 14)}`, delta: `+${4 + seed}%`, trend: "up",   hint: "last 30 days" },
        { label: "Settlement volume",  value: `₦${((6 + seed) * 100_000 + d * 8_400).toLocaleString()}`, delta: "+12%", trend: "up", hint: "credited to bank" },
        { label: "Refund rate",        value: `${(0.6 + seed * 0.1).toFixed(1)}%`, delta: "−0.2pp", trend: "down", hint: "of orders" },
        { label: "Success rate",       value: `${(97.4 + seed * 0.3).toFixed(1)}%`, delta: "+0.1pp", trend: "up", hint: "auth → settle" },
      ]
    case "delivery":
      return [
        { label: "Labels bought",      value: `${48 + d * 3}`,  delta: `+${8 + seed}%`, trend: "up", hint: "last 30 days" },
        { label: "On-time delivery",   value: `${(92 + seed).toFixed(0)}%`, delta: "+2pp", trend: "up", hint: "vs SLA" },
        { label: "Avg cost / parcel",  value: `₦${(1100 + seed * 50)}`, delta: "−₦40", trend: "down", hint: "blended" },
        { label: "Returned to sender", value: `${seed}`, hint: "this month" },
      ]
    case "commerce":
      return [
        { label: "Orders synced",      value: `${64 + d * 2}`, delta: "+9%", trend: "up", hint: "last 30 days" },
        { label: "Stock pushes",       value: `${320 + d * 12}`, hint: "catalog updates" },
        { label: "Sync errors",        value: `${seed}`, hint: "auto-retried" },
      ]
    case "comms":
      return [
        { label: "Messages sent",      value: `${480 + d * 26}`, delta: "+18%", trend: "up", hint: "last 30 days" },
        { label: "Delivery rate",      value: `${(95 + seed * 0.4).toFixed(1)}%`, hint: "of sends" },
        { label: "Open rate",          value: `${(38 + seed).toFixed(0)}%`, delta: "+3pp", trend: "up", hint: "industry: 22%" },
      ]
    case "marketing":
      return [
        { label: "Contacts synced",    value: `${(2_400 + d * 18).toLocaleString()}`, hint: "audience size" },
        { label: "Campaigns sent",     value: `${4 + seed}`, hint: "this month" },
        { label: "Campaign revenue",   value: `₦${((seed + 4) * 80_000).toLocaleString()}`, delta: "+24%", trend: "up", hint: "attributed" },
      ]
    case "accounting":
      return [
        { label: "Journals posted",    value: `${180 + d * 6}`, hint: "last 30 days" },
        { label: "Reconciled",         value: `${(96 + seed * 0.3).toFixed(1)}%`, hint: "auto-matched" },
        { label: "Pending review",     value: `${seed}`, hint: "needs manual touch" },
      ]
    case "team":
      return [
        { label: "Alerts routed",      value: `${28 + d}`, hint: "to channels" },
        { label: "Active channels",    value: `${2 + (seed % 3)}`, hint: "receiving" },
      ]
    case "analytics":
      return [
        { label: "Events captured",    value: `${(4_800 + d * 220).toLocaleString()}`, delta: "+22%", trend: "up", hint: "last 30 days" },
        { label: "Funnels tracked",    value: `${3 + (seed % 3)}`, hint: "configured" },
      ]
    default:
      return []
  }
}
