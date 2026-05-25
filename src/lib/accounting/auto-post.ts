import { accountByCode, listEntries, postEntry, type JournalLine } from "@/lib/accounting/ledger"
import type { Invoice, ReturnRecord } from "@/lib/pos/storage"

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

/**
 * Post a return/refund: it partly reverses a sale. Debit Sales for the
 * goods + VAT Payable for the tax (reducing both), credit the tender the
 * money went back through. Idempotent by return number.
 */
export function postReturnToLedger(ret: ReturnRecord): boolean {
  const ref = ret.number
  if (alreadyPosted(ref)) return false
  const sales = accountByCode("4000")
  const vat = accountByCode("2100")
  const tender = accountByCode(tenderAccountCode(ret.method))
  if (!sales || !vat || !tender) return false
  const goods = Math.round(ret.subtotal * 100) / 100
  const tax = Math.round(ret.tax * 100) / 100
  const lines: JournalLine[] = []
  if (goods > 0) lines.push({ accountId: sales.id, debit: goods, credit: 0 })
  if (tax > 0) lines.push({ accountId: vat.id, debit: tax, credit: 0 })
  lines.push({ accountId: tender.id, debit: 0, credit: Math.round(ret.totalRefund * 100) / 100 })
  try {
    postEntry({
      date: new Date(ret.createdAt).toISOString().slice(0, 10),
      memo: `Refund ${ret.number}`,
      lines,
      source: "system",
      sourceRef: ref,
    })
    return true
  } catch {
    return false
  }
}

// ---- Ready-to-wire posters for the other operational sources ----
// These follow the same balanced + idempotent pattern; wire them from the
// purchasing / payroll / expense create flows as those persist at runtime.

/** A supplier bill: DR Inventory (or an expense), CR Accounts Payable. */
export function postBillToLedger(bill: { id: string; date?: string; amount: number; toInventory?: boolean; expenseCode?: string }): boolean {
  if (alreadyPosted(bill.id)) return false
  const ap = accountByCode("2000")
  const debitAcct = accountByCode(bill.toInventory === false ? bill.expenseCode ?? "5900" : "1200")
  if (!ap || !debitAcct || bill.amount <= 0) return false
  try {
    postEntry({
      date: bill.date ?? new Date().toISOString().slice(0, 10),
      memo: `Bill ${bill.id}`,
      lines: [
        { accountId: debitAcct.id, debit: bill.amount, credit: 0 },
        { accountId: ap.id, debit: 0, credit: bill.amount },
      ],
      source: "system",
      sourceRef: bill.id,
    })
    return true
  } catch {
    return false
  }
}

/** An expense paid from cash/bank: DR expense account, CR Cash/Bank. */
export function postExpenseToLedger(exp: { id: string; date?: string; amount: number; expenseCode: string; fromCash?: boolean }): boolean {
  if (alreadyPosted(exp.id)) return false
  const expenseAcct = accountByCode(exp.expenseCode)
  const cashAcct = accountByCode(exp.fromCash ? "1000" : "1010")
  if (!expenseAcct || !cashAcct || exp.amount <= 0) return false
  try {
    postEntry({
      date: exp.date ?? new Date().toISOString().slice(0, 10),
      memo: `Expense ${exp.id}`,
      lines: [
        { accountId: expenseAcct.id, debit: exp.amount, credit: 0 },
        { accountId: cashAcct.id, debit: 0, credit: exp.amount },
      ],
      source: "system",
      sourceRef: exp.id,
    })
    return true
  } catch {
    return false
  }
}

/** A payroll run: DR Wages, CR Wages Payable + tax payables. */
export function postPayrollToLedger(run: { id: string; date?: string; gross: number; paye?: number; otherDeductions?: number }): boolean {
  if (alreadyPosted(run.id)) return false
  const wages = accountByCode("5100")
  const wagesPayable = accountByCode("2200")
  const vat = accountByCode("2100") // PAYE folded into a payable; reuse VAT-style payable if no PAYE acct
  if (!wages || !wagesPayable || run.gross <= 0) return false
  const paye = Math.round((run.paye ?? 0) * 100) / 100
  const net = Math.round((run.gross - paye - (run.otherDeductions ?? 0)) * 100) / 100
  const lines: JournalLine[] = [{ accountId: wages.id, debit: run.gross, credit: 0 }]
  if (net > 0) lines.push({ accountId: wagesPayable.id, debit: 0, credit: net })
  if (paye > 0 && vat) lines.push({ accountId: vat.id, debit: 0, credit: paye })
  if ((run.otherDeductions ?? 0) > 0) lines.push({ accountId: wagesPayable.id, debit: 0, credit: Math.round((run.otherDeductions ?? 0) * 100) / 100 })
  try {
    postEntry({ date: run.date ?? new Date().toISOString().slice(0, 10), memo: `Payroll ${run.id}`, lines, source: "system", sourceRef: run.id })
    return true
  } catch {
    return false
  }
}
