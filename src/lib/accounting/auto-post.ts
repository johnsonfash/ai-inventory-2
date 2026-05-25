import { accountByCode, listEntries, postEntry, type JournalLine } from "@/lib/accounting/ledger"
import type { Invoice } from "@/lib/pos/storage"

// ACCT-2 — auto-posting. Turns operational activity into balanced journal
// entries so the books reflect real life without anyone touching the
// ledger by hand. Idempotent: a source document (invoice number, bill id)
// only ever posts once, so re-running is safe.

function alreadyPosted(sourceRef: string): boolean {
  return listEntries().some((e) => e.sourceRef === sourceRef)
}

// Which ledger cash/bank account a tender lands in.
function tenderAccountCode(method: string): string {
  if (method === "cash") return "1000" // Cash on hand
  return "1010" // Bank (card, transfer, paypal, stripe, gift-card, store-credit)
}

/**
 * Post a POS sale: debit the tender account(s) for what was collected,
 * credit Sales for the goods, credit VAT Payable for the tax. (COGS is
 * skipped until the catalogue carries unit cost — noted in ACCT-2 scope.)
 * No-op if the invoice was already posted or has a balance owed (layaway
 * posts when fully paid).
 */
export function postInvoiceToLedger(invoice: Invoice): boolean {
  const ref = invoice.number
  if (alreadyPosted(ref)) return false
  if (invoice.status === "partial") return false // wait until paid in full

  const sales = accountByCode("4000")
  const vat = accountByCode("2100")
  if (!sales || !vat) return false

  const tax = Math.round(((invoice.itemTax || 0) + (invoice.orderTax || 0)) * 100) / 100
  const revenue = Math.round((invoice.total - tax) * 100) / 100
  if (revenue <= 0 && tax <= 0) return false

  // Debit tenders by how much each collected (so split payments map
  // to the right cash/bank accounts).
  const lines: JournalLine[] = []
  const byAccount = new Map<string, number>()
  for (const p of invoice.payments) {
    const code = tenderAccountCode(p.method)
    byAccount.set(code, Math.round(((byAccount.get(code) ?? 0) + p.amount) * 100) / 100)
  }
  // If payments don't sum to total (shouldn't happen), fall back to bank.
  const paid = Array.from(byAccount.values()).reduce((s, n) => s + n, 0)
  if (Math.abs(paid - invoice.total) > 0.01) {
    byAccount.clear()
    byAccount.set("1010", invoice.total)
  }
  for (const [code, amount] of byAccount) {
    const acct = accountByCode(code)
    if (acct && amount > 0) lines.push({ accountId: acct.id, debit: amount, credit: 0 })
  }
  if (revenue > 0) lines.push({ accountId: sales.id, debit: 0, credit: revenue })
  if (tax > 0) lines.push({ accountId: vat.id, debit: 0, credit: tax })

  try {
    postEntry({
      date: new Date(invoice.createdAt).toISOString().slice(0, 10),
      memo: `POS sale ${invoice.number}`,
      lines,
      source: "system",
      sourceRef: ref,
    })
    return true
  } catch {
    // postEntry throws if it somehow doesn't balance — never corrupt books.
    return false
  }
}
