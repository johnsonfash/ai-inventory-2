import type { Invoice, Order, Payment, Receipt } from "./types"

// Mock orders + invoices + payments + receipts. All four lists
// reference each other by id so pages can chase the links and
// render a true "pipeline" view of one customer's lifecycle.
//
// Numbers are designed to demo every interesting state:
//   - SO-2401 → INV-2401 → RT-2401 (fully closed, on time)
//   - SO-2402 → INV-2402 (partially paid, overdue)
//   - SO-2403 → INV-2403 (sent, no payments yet)
//   - SO-2404 (accepted, not invoiced yet)
//   - SO-2405 (draft)
//   - SO-2406 → INV-2406 → RT-2406 (refunded after pay)

function iso(daysAgo: number): string {
  return new Date(Date.now() - daysAgo * 86_400_000).toISOString()
}
function isoAhead(days: number): string {
  return new Date(Date.now() + days * 86_400_000).toISOString()
}

const CUSTOMERS = {
  nova:   { id: "cust-nova",   name: "NovaApps",          email: "ops@novaapps.com" },
  bright: { id: "cust-bright", name: "BrightLane",        email: "billing@brightlane.io" },
  acme:   { id: "cust-acme",   name: "Acme Co",           email: "ap@acme.co" },
  aisha:  { id: "cust-aisha",  name: "Aisha N.",          email: "aisha@walkin.local" },
  glow:   { id: "cust-glow",   name: "Glow Co",           email: "wholesale@glowco.com" },
  delta:  { id: "cust-delta",  name: "Delta Apparel",     email: "orders@deltaapparel.co" },
}

const sample = (overrides: Partial<Order["lines"][number]>): Order["lines"][number] => ({
  sku: "EL-2109", name: "USB‑C Hub 6‑in‑1", qty: 1, unitPriceUsd: 39.99, taxRate: 0.075, ...overrides,
})

function totals(lines: Order["lines"]): { subtotal: number; tax: number; total: number } {
  let sub = 0, tax = 0
  for (const l of lines) {
    const lineSub = l.unitPriceUsd * l.qty
    sub += lineSub
    tax += lineSub * (l.taxRate ?? 0)
  }
  return { subtotal: round(sub), tax: round(tax), total: round(sub + tax) }
}
function round(n: number): number { return Math.round(n * 100) / 100 }

const ORDERS_LINES: Record<string, Order["lines"]> = {
  "SO-2401": [
    sample({ sku: "EL-2109", name: "USB‑C Hub 6‑in‑1", qty: 4, unitPriceUsd: 39.99 }),
    sample({ sku: "EL-1001", name: "Wireless Mouse",    qty: 4, unitPriceUsd: 22.00 }),
  ],
  "SO-2402": [
    sample({ sku: "AP-4012", name: "Cotton Tee — Black", qty: 12, unitPriceUsd: 12.00 }),
    sample({ sku: "HM-2205", name: "Ceramic Mug 12oz",   qty: 12, unitPriceUsd: 8.00 }),
  ],
  "SO-2403": [
    sample({ sku: "BT-9091", name: "Hydrating Serum", qty: 6, unitPriceUsd: 18.95 }),
  ],
  "SO-2404": [
    sample({ sku: "EL-2109", name: "USB‑C Hub 6‑in‑1", qty: 1 }),
    sample({ sku: "BT-9091", name: "Hydrating Serum",  qty: 2, unitPriceUsd: 18.95 }),
  ],
  "SO-2405": [
    sample({ sku: "EL-1001", name: "Wireless Mouse", qty: 5, unitPriceUsd: 22.00 }),
  ],
  "SO-2406": [
    sample({ sku: "BT-9091", name: "Hydrating Serum", qty: 3, unitPriceUsd: 18.95 }),
  ],
}

export const ORDERS: Order[] = [
  {
    id: "ord-2401", number: "SO-2401", customer: CUSTOMERS.nova,   ownerId: "m-2",
    status: "fulfilled", lines: ORDERS_LINES["SO-2401"]!, ...totalsAs(ORDERS_LINES["SO-2401"]!),
    locationId: "wh-a", createdAt: iso(10), expectedFulfillBy: iso(3), invoiceId: "inv-2401",
  },
  {
    id: "ord-2402", number: "SO-2402", customer: CUSTOMERS.bright, ownerId: "m-2",
    status: "invoiced", lines: ORDERS_LINES["SO-2402"]!, ...totalsAs(ORDERS_LINES["SO-2402"]!),
    locationId: "downtown", createdAt: iso(15), expectedFulfillBy: iso(2), invoiceId: "inv-2402",
  },
  {
    id: "ord-2403", number: "SO-2403", customer: CUSTOMERS.glow,   ownerId: "m-1",
    status: "invoiced", lines: ORDERS_LINES["SO-2403"]!, ...totalsAs(ORDERS_LINES["SO-2403"]!),
    locationId: "wh-a", createdAt: iso(3), expectedFulfillBy: isoAhead(4), invoiceId: "inv-2403",
  },
  {
    id: "ord-2404", number: "SO-2404", customer: CUSTOMERS.aisha,  ownerId: "m-2",
    status: "accepted", lines: ORDERS_LINES["SO-2404"]!, ...totalsAs(ORDERS_LINES["SO-2404"]!),
    locationId: "downtown", createdAt: iso(1), expectedFulfillBy: isoAhead(2),
  },
  {
    id: "ord-2405", number: "SO-2405", customer: CUSTOMERS.delta,  ownerId: "m-1",
    status: "draft", lines: ORDERS_LINES["SO-2405"]!, ...totalsAs(ORDERS_LINES["SO-2405"]!),
    createdAt: iso(0.2),
  },
  {
    id: "ord-2406", number: "SO-2406", customer: CUSTOMERS.acme,   ownerId: "m-2",
    status: "fulfilled", lines: ORDERS_LINES["SO-2406"]!, ...totalsAs(ORDERS_LINES["SO-2406"]!),
    locationId: "wh-a", createdAt: iso(22), expectedFulfillBy: iso(18), invoiceId: "inv-2406",
  },
]

export const INVOICES: Invoice[] = [
  // FULL PAYMENT — closed clean
  buildInvoice({
    id: "inv-2401", number: "INV-2401", orderId: "ord-2401",
    customer: CUSTOMERS.nova, issuerId: "m-2",
    lines: ORDERS_LINES["SO-2401"]!,
    issueDate: iso(8), dueDate: iso(0),
    payments: [{ id: "pay-2401-1", method: "transfer", amount: -1, paidAt: iso(2), reference: "ACH-7841", recordedById: "m-1" }],
    receiptId: "rcp-2401",
    memo: "Thanks for the quick order!",
  }),
  // PARTIAL — overdue
  buildInvoice({
    id: "inv-2402", number: "INV-2402", orderId: "ord-2402",
    customer: CUSTOMERS.bright, issuerId: "m-2",
    lines: ORDERS_LINES["SO-2402"]!,
    issueDate: iso(14), dueDate: iso(1),
    payments: [
      { id: "pay-2402-1", method: "card",     amount: 100, paidAt: iso(7), reference: "ch_3abc",  recordedById: "m-1" },
    ],
  }),
  // OPEN — sent, no payments
  buildInvoice({
    id: "inv-2403", number: "INV-2403", orderId: "ord-2403",
    customer: CUSTOMERS.glow, issuerId: "m-1",
    lines: ORDERS_LINES["SO-2403"]!,
    issueDate: iso(2), dueDate: isoAhead(13),
    payments: [],
  }),
  // REFUNDED — paid then refunded
  buildInvoice({
    id: "inv-2406", number: "INV-2406", orderId: "ord-2406",
    customer: CUSTOMERS.acme, issuerId: "m-2",
    lines: ORDERS_LINES["SO-2406"]!,
    issueDate: iso(20), dueDate: iso(13),
    payments: [
      { id: "pay-2406-1", method: "card",   amount: -1, paidAt: iso(19), reference: "ch_5def", recordedById: "m-1" },
      { id: "pay-2406-2", method: "card",   amount: -1, paidAt: iso(10), reference: "ch_5def-refund", recordedById: "m-1", note: "Refund — wrong colour" },
    ],
    receiptId: "rcp-2406",
    statusOverride: "refunded",
  }),
]

export const RECEIPTS: Receipt[] = [
  {
    id: "rcp-2401", number: "RT-2401", invoiceId: "inv-2401",
    amountUsd: findInvoice("inv-2401").totalUsd,
    paymentMethodSummary: "Bank transfer",
    customer: CUSTOMERS.nova,
    issuedAt: iso(2),
    emailedAt: iso(2),
  },
  {
    id: "rcp-2406", number: "RT-2406", invoiceId: "inv-2406",
    amountUsd: findInvoice("inv-2406").totalUsd,
    paymentMethodSummary: "Card (refunded)",
    customer: CUSTOMERS.acme,
    issuedAt: iso(19),
    emailedAt: iso(19),
  },
]

// ------------------------- helpers ----------------------------
function totalsAs(lines: Order["lines"]) {
  const t = totals(lines)
  return { subtotalUsd: t.subtotal, taxUsd: t.tax, totalUsd: t.total }
}

// Build an invoice with synthetic state — auto-computes paid + balance
// + status (unless explicitly overridden) so the seed data stays
// internally consistent without manual fiddling.
function buildInvoice(opts: {
  id: string
  number: string
  orderId?: string
  customer: Invoice["customer"]
  issuerId: string
  lines: Invoice["lines"]
  issueDate: string
  dueDate: string
  payments: { id: string; method: Payment["method"]; amount: number; paidAt: string; reference?: string; note?: string; recordedById: string }[]
  receiptId?: string
  memo?: string
  /** Force a final status (e.g. "refunded") regardless of computed paid amount. */
  statusOverride?: Invoice["status"]
}): Invoice {
  const t = totals(opts.lines)
  // Resolve any "-1" sentinel to the full total (handy for "paid in
  // full" cases without restating the number twice).
  const payments: Payment[] = opts.payments.map((p) => ({
    id: p.id,
    invoiceId: opts.id,
    amountUsd: p.amount === -1 ? t.total : p.amount,
    method: p.method,
    paidAt: p.paidAt,
    reference: p.reference,
    note: p.note,
    recordedById: p.recordedById,
  }))
  const paid = round(payments.reduce((s, p) => s + p.amountUsd, 0))
  const balance = round(t.total - paid)
  let status: Invoice["status"]
  if (opts.statusOverride) status = opts.statusOverride
  else if (paid >= t.total) status = "paid"
  else if (paid > 0)        status = "partial"
  else if (new Date(opts.dueDate).getTime() < Date.now()) status = "overdue"
  else status = "open"

  return {
    id: opts.id,
    number: opts.number,
    orderId: opts.orderId,
    customer: opts.customer,
    status,
    lines: opts.lines,
    subtotalUsd: t.subtotal,
    taxUsd: t.tax,
    totalUsd: t.total,
    paidUsd: paid,
    balanceUsd: balance,
    issueDate: opts.issueDate,
    dueDate: opts.dueDate,
    issuerId: opts.issuerId,
    memo: opts.memo,
    payments,
    receiptId: opts.receiptId,
  }
}

function findInvoice(id: string): Invoice {
  return INVOICES.find((i) => i.id === id)!
}

// ----------- lookups -----------
export function getInvoice(id: string): Invoice | undefined {
  return INVOICES.find((i) => i.id === id || i.number === id)
}
export function getOrder(id: string): Order | undefined {
  return ORDERS.find((o) => o.id === id || o.number === id)
}
export function getReceipt(id: string): Receipt | undefined {
  return RECEIPTS.find((r) => r.id === id || r.number === id)
}
export function invoiceByOrder(orderId: string): Invoice | undefined {
  return INVOICES.find((i) => i.orderId === orderId)
}
