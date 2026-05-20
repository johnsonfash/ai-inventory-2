import type { EmailMessage, EmailTemplate } from "./types"
import { formatPriceFor } from "@/contexts/currency"

const sampleAmount = formatPriceFor(120_000)
const sampleRefund = formatPriceFor(24_000)
const samplePayout = formatPriceFor(14_280_000)
const sampleSalesTotal = formatPriceFor(14_280_000)
const sampleCommission = formatPriceFor(714_000)

// Seed email templates. Tokens use {{double-brace}} syntax that
// interpolate() (below) replaces. Keep the bodies in plain HTML so
// they render correctly inside the RichTextEditor AND inside a
// preview iframe.
//
// builtin: true means the user can clone or edit but can't delete —
// matches Mailchimp / Klaviyo / Postmark conventions.

export const TEMPLATES: EmailTemplate[] = [
  {
    id: "tpl-invoice",
    name: "Invoice ready",
    category: "transactional",
    description: "Send the invoice PDF + payment link to the customer.",
    subject: "Invoice {{invoice_number}} from {{business_name}}",
    body: `
      <p>Hi {{customer_first_name}},</p>
      <p>Thanks for your purchase. Your invoice <strong>{{invoice_number}}</strong> for <strong>{{amount}}</strong> is ready.</p>
      <p>You can pay it online here:</p>
      <p><a href="{{pay_link}}">Pay invoice {{invoice_number}}</a></p>
      <p>If you've already paid, you can ignore this. Any questions, just reply.</p>
      <p>Cheers,<br>{{sender_name}}<br>{{business_name}}</p>
    `,
    tokens: [
      { key: "invoice_number",     label: "Invoice number",   sample: "INV-2174" },
      { key: "amount",             label: "Amount",           sample: sampleAmount },
      { key: "customer_first_name",label: "Customer first name", sample: "Aisha" },
      { key: "business_name",      label: "Business",         sample: "Acme Co" },
      { key: "sender_name",        label: "Your name",        sample: "Mia Chen" },
      { key: "pay_link",           label: "Payment link",     sample: "https://pallio.app/pay/INV-2174" },
    ],
    builtin: true,
  },
  {
    id: "tpl-receipt",
    name: "Payment receipt",
    category: "transactional",
    description: "Confirms a payment landed + thanks the customer.",
    subject: "Receipt for {{invoice_number}} — {{business_name}}",
    body: `
      <p>Hi {{customer_first_name}},</p>
      <p>We've received your payment of <strong>{{amount}}</strong> for invoice <strong>{{invoice_number}}</strong>. Thanks!</p>
      <p>You can view + download the receipt any time here: <a href="{{receipt_link}}">{{receipt_link}}</a></p>
      <p>— {{sender_name}}</p>
    `,
    tokens: [
      { key: "invoice_number",     label: "Invoice number", sample: "INV-2174" },
      { key: "amount",             label: "Amount",         sample: sampleAmount },
      { key: "customer_first_name",label: "First name",     sample: "Aisha" },
      { key: "business_name",      label: "Business",       sample: "Acme Co" },
      { key: "sender_name",        label: "Sender",         sample: "Mia Chen" },
      { key: "receipt_link",       label: "Receipt link",   sample: "https://pallio.app/r/RT-2174" },
    ],
    builtin: true,
  },
  {
    id: "tpl-refund",
    name: "Refund issued",
    category: "transactional",
    description: "Lets the customer know money is on the way back.",
    subject: "Your refund for {{invoice_number}} is on the way",
    body: `
      <p>Hi {{customer_first_name}},</p>
      <p>We've issued a refund of <strong>{{amount}}</strong> against your original payment. It should land back on your card within 5–10 business days.</p>
      <p>Reason: {{reason}}</p>
      <p>— {{sender_name}}</p>
    `,
    tokens: [
      { key: "invoice_number",     label: "Invoice number", sample: "INV-2174" },
      { key: "amount",             label: "Refund amount",  sample: sampleRefund },
      { key: "customer_first_name",label: "First name",     sample: "Aisha" },
      { key: "reason",             label: "Reason",         sample: "Defective item" },
      { key: "sender_name",        label: "Sender",         sample: "Mia Chen" },
    ],
    builtin: true,
  },
  {
    id: "tpl-welcome",
    name: "Welcome new customer",
    category: "marketing",
    description: "First touch after they sign up or buy.",
    subject: "Welcome to {{business_name}}, {{customer_first_name}}",
    body: `
      <p>Hi {{customer_first_name}},</p>
      <p>Welcome to {{business_name}}! We're glad to have you.</p>
      <p>Here's what to expect:</p>
      <ul>
        <li>Receipts + invoices land here automatically.</li>
        <li>Heads-up emails when items you've bought before come back into stock.</li>
        <li>The occasional "thought you'd like this" — we promise not to abuse it.</li>
      </ul>
      <p>— The team at {{business_name}}</p>
    `,
    tokens: [
      { key: "customer_first_name", label: "First name", sample: "Aisha" },
      { key: "business_name",       label: "Business",   sample: "Acme Co" },
    ],
    builtin: true,
  },
  {
    id: "tpl-abandoned",
    name: "Abandoned cart",
    category: "marketing",
    description: "Nudge after a customer leaves items in their cart for >24h.",
    subject: "You left {{item_name}} behind — still want it?",
    body: `
      <p>Hi {{customer_first_name}},</p>
      <p>You added <strong>{{item_name}}</strong> to your cart and didn't quite finish. We're holding it for you for 48 hours.</p>
      <p><a href="{{cart_link}}">Pick up where you left off →</a></p>
      <p>If you decided against it, no worries.</p>
    `,
    tokens: [
      { key: "customer_first_name", label: "First name",    sample: "Aisha" },
      { key: "item_name",           label: "Item",          sample: "USB-C Hub 6-in-1" },
      { key: "cart_link",           label: "Cart link",     sample: "https://pallio.app/cart/xyz" },
    ],
    builtin: true,
  },
  {
    id: "tpl-restock",
    name: "Restock alert",
    category: "marketing",
    description: "Tell waitlisted customers an item is back.",
    subject: "{{item_name}} is back in stock",
    body: `
      <p>Hi {{customer_first_name}},</p>
      <p>You wanted to know when <strong>{{item_name}}</strong> came back — it has. We have {{stock_count}} in stock at <strong>{{location}}</strong>.</p>
      <p><a href="{{item_link}}">Grab one →</a></p>
    `,
    tokens: [
      { key: "customer_first_name", label: "First name", sample: "Aisha" },
      { key: "item_name",           label: "Item",       sample: "Cotton Tee — Black" },
      { key: "stock_count",         label: "In stock",   sample: "12" },
      { key: "location",            label: "Location",   sample: "Downtown Store" },
      { key: "item_link",           label: "Item link",  sample: "https://pallio.app/i/AP-4012" },
    ],
    builtin: true,
  },
  {
    id: "tpl-promo",
    name: "Promotion / sale",
    category: "marketing",
    description: "General promo blast with a discount code.",
    subject: "{{promo_name}} — {{discount_label}} for {{customer_first_name}}",
    body: `
      <p>Hi {{customer_first_name}},</p>
      <p>{{promo_blurb}}</p>
      <p>Use code <strong>{{promo_code}}</strong> at checkout to get <strong>{{discount_label}}</strong>. Expires {{expires_at}}.</p>
      <p><a href="{{shop_link}}">Shop the sale →</a></p>
    `,
    tokens: [
      { key: "customer_first_name", label: "First name",  sample: "Aisha" },
      { key: "promo_name",          label: "Promo name",  sample: "Spring sale" },
      { key: "promo_blurb",         label: "Promo blurb", sample: "We're clearing winter stock with 20% off everything." },
      { key: "promo_code",          label: "Code",        sample: "SPRING20" },
      { key: "discount_label",      label: "Discount",    sample: "20% off" },
      { key: "expires_at",          label: "Expires",     sample: "Sunday at 11:59pm" },
      { key: "shop_link",           label: "Shop link",   sample: "https://pallio.app/shop" },
    ],
    builtin: true,
  },
  {
    id: "tpl-commission",
    name: "Commission report",
    category: "ops",
    description: "Weekly / monthly commission summary for a sales rep or affiliate.",
    subject: "Your {{period}} commission report — {{amount}}",
    body: `
      <p>Hi {{sender_name}},</p>
      <p>Here's your {{period}} commission report.</p>
      <ul>
        <li>Sales: <strong>{{sales_total}}</strong></li>
        <li>Commission rate: <strong>{{rate}}</strong></li>
        <li>Commission earned: <strong>{{amount}}</strong></li>
      </ul>
      <p>Payout lands on {{payout_date}}.</p>
    `,
    tokens: [
      { key: "sender_name",   label: "Recipient",   sample: "Mia Chen" },
      { key: "period",        label: "Period",      sample: "October" },
      { key: "sales_total",   label: "Sales total", sample: sampleSalesTotal },
      { key: "rate",          label: "Rate",        sample: "5%" },
      { key: "amount",        label: "Amount",      sample: sampleCommission },
      { key: "payout_date",   label: "Payout date", sample: "Nov 5" },
    ],
    builtin: true,
  },
  {
    id: "tpl-low-stock",
    name: "Low-stock heads-up (internal)",
    category: "team",
    description: "Nudges the team when an item crosses its reorder threshold.",
    subject: "Heads up: {{item_name}} is low",
    body: `
      <p>Hi team,</p>
      <p>{{item_name}} ({{sku}}) is at <strong>{{stock_count}}</strong> units — below its reorder point of {{reorder_point}}. Suggested PO size: <strong>{{suggested_qty}}</strong>.</p>
      <p><a href="{{po_link}}">Draft a PO →</a></p>
    `,
    tokens: [
      { key: "item_name",      label: "Item",         sample: "USB-C Hub" },
      { key: "sku",            label: "SKU",          sample: "EL-2109" },
      { key: "stock_count",    label: "Stock count",  sample: "18" },
      { key: "reorder_point",  label: "Reorder point", sample: "20" },
      { key: "suggested_qty",  label: "Suggested qty", sample: "60" },
      { key: "po_link",        label: "PO link",      sample: "https://pallio.app/purchasing/pos/new" },
    ],
    builtin: true,
  },
]

// Helper — replaces {{token}} occurrences in a string with the
// values map. Unknown tokens render their sample for live preview.
export function interpolate(template: string, values: Record<string, string>): string {
  return template.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_, key) => {
    return values[key] ?? `{{${key}}}`
  })
}

// Mock inbox / sent / drafts — used by /communications hub.
export const MESSAGES: EmailMessage[] = [
  {
    id: "msg-1",
    folder: "inbox",
    from: { name: "Stripe Receipts", email: "receipts@stripe.com" },
    to: [{ name: "Mia Chen", email: "mia@acme.co" }],
    subject: `Your payout of ${samplePayout} is on the way`,
    preview: "We initiated a transfer to your bank account ending in 1023.",
    body: `<p>Hi Acme Co,</p><p>We initiated a transfer of <strong>${samplePayout}</strong> to your bank account ending in 1023. It should land in 1–2 business days.</p>`,
    sentAt: minutesAgoISO(15),
    read: false,
  },
  {
    id: "msg-2",
    folder: "inbox",
    from: { name: "Sara Quill", email: "sara@quillblog.com" },
    to: [{ name: "Mia Chen", email: "mia@acme.co" }],
    subject: "Re: Affiliate banner art",
    preview: "Got it — I'll have new creatives by Friday.",
    body: `<p>Got it — I'll have new creatives by Friday. The 1080×1080 + 1080×1920 sizes you sent are fine.</p><p>— Sara</p>`,
    sentAt: minutesAgoISO(180),
    read: true,
  },
  {
    id: "msg-3",
    folder: "inbox",
    from: { name: "Cobalt Distributors", email: "sales@cobalt-distributors.com" },
    to: [{ name: "Acme Co", email: "ap@acme.co" }],
    subject: "PO-1042 — partial shipment dispatched",
    preview: "Tracking ABCD-12345. ETA Friday.",
    body: `<p>PO-1042 partial shipment dispatched. Tracking ABCD-12345. ETA Friday. Remaining 2 lines on back-order.</p>`,
    sentAt: minutesAgoISO(60 * 18),
    read: true,
  },
  {
    id: "msg-4",
    folder: "sent",
    from: { name: "Mia Chen", email: "mia@acme.co" },
    to: [{ name: "Aisha N.", email: "aisha@walkin.local" }],
    subject: "Invoice INV-2174 from Acme Co",
    preview: `Thanks for your purchase. Your invoice INV-2174 for ${sampleAmount} is ready.`,
    body: `<p>Hi Aisha, thanks for your purchase. Your invoice <strong>INV-2174</strong> for <strong>${sampleAmount}</strong> is ready.</p>`,
    sentAt: minutesAgoISO(60 * 2),
    templateId: "tpl-invoice",
  },
  {
    id: "msg-5",
    folder: "sent",
    from: { name: "Daniel Kim", email: "daniel@acme.co" },
    to: [{ name: "Sara Quill", email: "sara@quillblog.com" }],
    subject: "Spring sale — 20% off for our affiliates",
    preview: "Use code SPRING20 in your next post.",
    body: `<p>Hi Sara, use code <strong>SPRING20</strong> in your next post.</p>`,
    sentAt: minutesAgoISO(60 * 24 * 2),
    templateId: "tpl-promo",
  },
  {
    id: "msg-6",
    folder: "drafts",
    from: { name: "Mia Chen", email: "mia@acme.co" },
    to: [{ name: "NovaApps", email: "ops@novaapps.com" }],
    subject: "Re: Net-30 terms",
    preview: "Re-attaching the W-9 and our standard payment terms…",
    body: `<p>Hi team,</p><p>Re-attaching the W-9 and our standard payment terms…</p>`,
    sentAt: minutesAgoISO(60 * 8),
  },
]

function minutesAgoISO(min: number): string {
  return new Date(Date.now() - min * 60_000).toISOString()
}
