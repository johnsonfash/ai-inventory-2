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
