import { kvJson } from "@/lib/storage/kv"
import { genId, listInvoices, listReturns, type Invoice } from "@/lib/pos/storage"
import { db } from "@/lib/db/index"

// Cashier shifts + X/Z reports (POS-5). A shift is one cashier's run on a
// till: opened with a declared cash float, closed with a counted drawer,
// and reconciled against what the system expected. Generic across
// industries — every till-based business reconciles cash at close.

export type Shift = {
  id: string
  cashier: string
  location: string
  openedAt: number
  closedAt?: number
  openingFloat: number
  /** Counted cash at close (what was physically in the drawer). */
  declaredClose?: number
  status: "open" | "closed"
  /** Cash paid out / dropped mid-shift (negative drawer movements). */
  paidOut?: number
  note?: string
}

const SHIFTS_KEY = "pos:shifts:v1"
const ACTIVE_KEY = "pos:active-shift:v1"

export function listShifts(): Shift[] {
  return kvJson.get<Shift[]>(SHIFTS_KEY) ?? []
}
function saveShifts(list: Shift[]) {
  void kvJson.set(SHIFTS_KEY, list)
}

export function activeShift(): Shift | undefined {
  const id = kvJson.get<string>(ACTIVE_KEY)
  if (!id) return undefined
  return listShifts().find((s) => s.id === id && s.status === "open")
}

export function openShift(opts: { cashier: string; location: string; openingFloat: number }): Shift {
  const shift: Shift = {
    id: genId("shift"),
    cashier: opts.cashier,
    location: opts.location,
    openedAt: Date.now(),
    openingFloat: opts.openingFloat,
    status: "open",
  }
  saveShifts([shift, ...listShifts()])
  void kvJson.set(ACTIVE_KEY, shift.id)
  void db.enqueue("shift-open", shift)
  return shift
}

export function closeShift(id: string, declaredClose: number, note?: string) {
  const list = listShifts()
  const shift = list.find((s) => s.id === id)
  if (!shift) return
  shift.closedAt = Date.now()
  shift.declaredClose = declaredClose
  shift.status = "closed"
  if (note) shift.note = note
  saveShifts(list)
  if (kvJson.get<string>(ACTIVE_KEY) === id) void kvJson.set(ACTIVE_KEY, "")
  void db.enqueue("shift-close", shift)
}

// ---- Reporting ----

export type ShiftReport = {
  byTender: Record<string, number>
  grossSales: number
  cashSales: number
  refunds: number
  tips: number
  voids: number
  saleCount: number
  /** Expected cash in drawer = opening float + cash sales − refunds (cash). */
  expectedCash: number
  /** declaredClose − expectedCash (only meaningful on a closed shift). */
  variance?: number
}

// Build an X-report (mid-shift snapshot) or Z-report (at close). Both read
// the same window: invoices + returns created during the shift.
export function buildShiftReport(shift: Shift): ShiftReport {
  const from = shift.openedAt
  const to = shift.closedAt ?? Date.now()
  const inWindow = (t: number) => t >= from && t <= to
  const invoices = listInvoices().filter((i) => inWindow(i.createdAt))
  const returns = listReturns().filter((r) => inWindow(r.createdAt))

  const byTender: Record<string, number> = {}
  let grossSales = 0
  let cashSales = 0
  let tips = 0
  for (const inv of invoices) {
    grossSales += inv.total
    tips += inv.tip ?? 0
    for (const p of inv.payments) {
      byTender[p.method] = Math.round(((byTender[p.method] ?? 0) + p.amount) * 100) / 100
      if (p.method === "cash") cashSales += p.amount
    }
  }
  let refunds = 0
  let cashRefunds = 0
  for (const r of returns) {
    refunds += r.totalRefund
    if (r.method === "cash") cashRefunds += r.totalRefund
  }
  const expectedCash = Math.round((shift.openingFloat + cashSales - cashRefunds - (shift.paidOut ?? 0)) * 100) / 100
  const report: ShiftReport = {
    byTender,
    grossSales: Math.round(grossSales * 100) / 100,
    cashSales: Math.round(cashSales * 100) / 100,
    refunds: Math.round(refunds * 100) / 100,
    tips: Math.round(tips * 100) / 100,
    voids: 0,
    saleCount: invoices.length,
    expectedCash,
  }
  if (shift.status === "closed" && shift.declaredClose != null) {
    report.variance = Math.round((shift.declaredClose - expectedCash) * 100) / 100
  }
  return report
}

// Invoices belonging to a shift window — used by the shift detail view.
export function invoicesForShift(shift: Shift): Invoice[] {
  const to = shift.closedAt ?? Date.now()
  return listInvoices().filter((i) => i.createdAt >= shift.openedAt && i.createdAt <= to)
}
