import { kvJson } from "@/lib/storage/kv"
import { accountBalance, accountByCode, listEntries } from "@/lib/accounting/ledger"

// ACCT-4 — bank reconciliation, the real way (how Xero/QuickBooks do it):
// tick off the ledger's own bank movements against the statement. Each
// posted journal line that hits the bank account is a reconcilable item;
// marking it "cleared" means it appeared on the statement. The cleared
// balance should match the statement's closing balance; any gap is fees,
// in-flight transfers, or a missed entry.
//
// Frontend foundation: cleared state + "reconciled through" date persist
// in kv. A CSV/OFX statement import + auto-match is the next step (the UI
// already points at it); this layer is what that import reconciles against.

export type BankLedgerLine = {
  /** entryId + line index, unique per bank movement. */
  key: string
  entryId: string
  date: string
  memo: string
  /** Signed: positive = money into the bank, negative = out. */
  amount: number
  cleared: boolean
}

type ReconState = {
  /** keys marked cleared. */
  cleared: string[]
  /** ISO date reconciled through (entries on/before are locked-ish). */
  reconciledThrough?: string
}

const KEY = "acct:reconcile:v1"

function loadState(): ReconState {
  return kvJson.get<ReconState>(KEY) ?? { cleared: [] }
}
function saveState(s: ReconState) {
  void kvJson.set(KEY, s)
}

/** All posted ledger movements on a bank/cash account, newest first. */
export function bankLedgerLines(accountCode = "1010"): BankLedgerLine[] {
  const acct = accountByCode(accountCode)
  if (!acct) return []
  const state = loadState()
  const clearedSet = new Set(state.cleared)
  const lines: BankLedgerLine[] = []
  for (const e of listEntries()) {
    if (!e.posted) continue
    e.lines.forEach((l, i) => {
      if (l.accountId !== acct.id) return
      const key = `${e.id}:${i}`
      lines.push({
        key,
        entryId: e.id,
        date: e.date,
        memo: e.memo,
        amount: Math.round(((l.debit || 0) - (l.credit || 0)) * 100) / 100,
        cleared: clearedSet.has(key),
      })
    })
  }
  return lines.sort((a, b) => (a.date < b.date ? 1 : -1))
}

export function toggleCleared(key: string) {
  const s = loadState()
  s.cleared = s.cleared.includes(key) ? s.cleared.filter((k) => k !== key) : [...s.cleared, key]
  saveState(s)
}

export function reconciledThrough(): string | undefined {
  return loadState().reconciledThrough
}
export function setReconciledThrough(date: string) {
  const s = loadState()
  s.reconciledThrough = date
  saveState(s)
}

export type ReconSummary = {
  bookBalance: number
  clearedBalance: number
  unclearedCount: number
  /** Difference vs an entered statement balance (0 when not provided). */
  difference: (statementBalance: number) => number
}

export function reconSummary(accountCode = "1010"): ReconSummary {
  const lines = bankLedgerLines(accountCode)
  const bookBalance = accountBalance(accountByCode(accountCode)?.id ?? "")
  const clearedBalance = Math.round(lines.filter((l) => l.cleared).reduce((s, l) => s + l.amount, 0) * 100) / 100
  return {
    bookBalance,
    clearedBalance,
    unclearedCount: lines.filter((l) => !l.cleared).length,
    difference: (statementBalance: number) => Math.round((statementBalance - clearedBalance) * 100) / 100,
  }
}
