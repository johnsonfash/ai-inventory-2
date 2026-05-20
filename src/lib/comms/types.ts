// Shared types for the Communications module — used by the composer,
// inbox, templates page, and the customer-facing "Send via email"
// affordance on invoices.

export type TemplateCategory =
  | "transactional"  // invoice, receipt, refund, password reset
  | "marketing"       // promo, abandoned cart, restock alert
  | "ops"             // commission report, low-stock heads-up
  | "team"            // internal team updates

export type EmailTemplate = {
  id: string
  name: string
  category: TemplateCategory
  /** One-line description shown in the picker. */
  description: string
  /** Subject line — supports {{tokens}}. */
  subject: string
  /** HTML body — supports {{tokens}}. */
  body: string
  /** Variable tokens referenced in subject/body. UI surfaces a
   *  reminder so the user fills them before sending. */
  tokens: { key: string; label: string; sample: string }[]
  /** Built-in templates can't be deleted. */
  builtin?: boolean
}

export type EmailMessage = {
  id: string
  /** "inbox" (received), "sent", or "draft". */
  folder: "inbox" | "sent" | "drafts"
  from: { name: string; email: string }
  to: { name: string; email: string }[]
  cc?: { name: string; email: string }[]
  subject: string
  preview: string
  /** HTML body — sanitised at render time. */
  body: string
  sentAt: string
  read?: boolean
  /** Optional template + which member used it (sent + drafts). */
  templateId?: string
  /** Reference for attachments — names only for the mock. */
  attachments?: string[]
}
