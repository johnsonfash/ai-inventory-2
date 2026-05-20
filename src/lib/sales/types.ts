// Sales workflow types — Order ➜ Invoice ➜ Payment ➜ Receipt.
// Designed to mirror what a real backend would return; the existing
// POS-side dummy data (src/lib/pos/storage.ts) stays as the
// register's own record, separate from these "back office" objects.

export type OrderStatus =
  | "draft"      // not sent to the customer yet
  | "sent"       // emailed / shared, awaiting confirmation
  | "accepted"   // customer confirmed
  | "invoiced"   // converted to an invoice
  | "fulfilled"  // shipped / picked up / delivered
  | "cancelled"

export type InvoiceStatus =
  | "open"        // sent, awaiting any payment
  | "partial"     // partially paid
  | "paid"        // fully paid (auto receipt generated)
  | "overdue"     // open past due date
  | "void"        // cancelled
  | "refunded"    // refunded after paid

export type PaymentMethod = "cash" | "card" | "transfer" | "wallet" | "store-credit"

export type LineItem = {
  sku: string
  name: string
  qty: number
  unitPriceUsd: number
  /** Per-line tax rate as a fraction (0.075 = 7.5%). */
  taxRate?: number
}

export type Order = {
  id: string
  number: string
  customer: { id: string; name: string; email: string }
  /** Member id of the sales rep that owns it. */
  ownerId: string
  status: OrderStatus
  lines: LineItem[]
  subtotalUsd: number
  taxUsd: number
  totalUsd: number
  /** Optional: location it was fulfilled from. */
  locationId?: string
  createdAt: string
  expectedFulfillBy?: string
  /** Linked invoice id, once converted. */
  invoiceId?: string
}

export type Invoice = {
  id: string
  number: string
  orderId?: string
  customer: { id: string; name: string; email: string }
  status: InvoiceStatus
  lines: LineItem[]
  subtotalUsd: number
  taxUsd: number
  totalUsd: number
  paidUsd: number
  /** Computed = totalUsd - paidUsd; kept as a snapshot for sorting. */
  balanceUsd: number
  issueDate: string
  dueDate: string
  /** Sales rep / member id. */
  issuerId: string
  /** Optional free-form note shown on the customer-facing PDF. */
  memo?: string
  /** Payment events on this invoice (chronological). */
  payments: Payment[]
  /** Receipt id auto-generated after the final paid payment. */
  receiptId?: string
}

export type Payment = {
  id: string
  invoiceId: string
  amountUsd: number
  method: PaymentMethod
  /** External reference (Stripe charge id, cheque number, bank txn). */
  reference?: string
  note?: string
  paidAt: string
  /** Member id who recorded it (cashier / manager / sales rep). */
  recordedById: string
}

export type Receipt = {
  id: string
  number: string
  invoiceId: string
  /** Sum of every payment under the invoice when the receipt was minted. */
  amountUsd: number
  paymentMethodSummary: string
  customer: { id: string; name: string; email: string }
  issuedAt: string
  /** Receipts can be emailed; we track delivery so we can show "sent" pills. */
  emailedAt?: string
}
