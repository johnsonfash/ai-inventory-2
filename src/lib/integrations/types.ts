// Integrations registry + connection state types. The registry is
// static (defined in data.ts), the connection state lives in kv so
// it survives reinstalls.

export type IntegrationCategory =
  | "payments"      // Paystack, Flutterwave, Opay, PalmPay, Stripe
  | "commerce"      // Shopify, WooCommerce, FB Shop
  | "comms"         // Mailgun, Twilio, WhatsApp Cloud
  | "team"          // Slack, Microsoft Teams
  | "analytics"     // Google Analytics, Segment

export type FieldKind = "text" | "password" | "url" | "select" | "switch"

export type ProviderField = {
  key: string
  label: string
  kind: FieldKind
  /** Used by select. */
  options?: { value: string; label: string }[]
  placeholder?: string
  hint?: string
  /** Sensitive fields are masked + show a "Reveal" toggle. */
  sensitive?: boolean
  required?: boolean
}

export type IntegrationProvider = {
  id: string
  name: string
  /** One-line description shown on the card. */
  tagline: string
  /** Longer description for the connect modal + detail page. */
  description: string
  category: IntegrationCategory
  /** Letter + brand colour for the inline glyph (no PNG dep). */
  letter: string
  /** Brand hex used as the tile background. */
  brand: string
  /** Where the user gets their credentials (URL to the provider's
   *  dashboard). Surfaced in the connect modal as a help link. */
  docsUrl?: string
  /** Provider-specific fields the connect modal renders. */
  fields: ProviderField[]
  /** Coarse tag — "Recommended for Nigerian SMBs" etc. */
  tag?: { label: string; tone: "brand" | "success" | "warning" | "info" }
}

export type IntegrationStatus = "disconnected" | "connected" | "error" | "pending"

export type IntegrationConnection = {
  providerId: string
  status: IntegrationStatus
  /** Masked credential preview ("•••• abc1") so the detail page shows
   *  a hint without storing the real secret in plain kv. Real backend
   *  stores secrets server-side; this is just for the UI. */
  fieldsMasked: Record<string, string>
  connectedAt: string
  /** Ad-hoc event log we show on the detail page. */
  events: { at: string; kind: "connected" | "test" | "disconnected" | "error"; message: string }[]
}
