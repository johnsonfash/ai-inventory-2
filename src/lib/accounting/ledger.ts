import { kvJson } from "@/lib/storage/kv"

// ACCT-1 — the real double-entry ledger core. This is the schema spine an
// accountant trusts: every transaction is a balanced JournalEntry (sum of
// debits === sum of credits), accounts have a type + normal side, and the
// trial balance is DERIVED from posted entries so it can't lie. Posted
// entries are append-only — corrections are reversing entries, never edits.
//
// Frontend-only for now (kv-backed); the backend persists + secures this
// exact model later. See memory: accounting-completeness-waves.

export type AccountType = "asset" | "liability" | "equity" | "income" | "expense"
export type Side = "debit" | "credit"

export type Account = {
  id: string
  /** Numeric code (1000s assets, 2000s liabilities, …). */
  code: string
  name: string
  type: AccountType
  /** The side that increases this account. */
  normalSide: Side
  /** Control accounts roll up subsidiary ledgers (AR, AP, Inventory). */
  isControl?: boolean
}

export type JournalLine = {
  accountId: string
  debit: number
  credit: number
}

export type EntrySource = "system" | "manual" | "import"

export type JournalEntry = {
  id: string
  /** ISO date (yyyy-mm-dd). */
  date: string
  memo: string
  lines: JournalLine[]
  source: EntrySource
  /** Link back to the source document (invoice id, bill id, …). */
  sourceRef?: string
  posted: boolean
  locked: boolean
  /** Set when this entry has been reversed by another. */
  reversedBy?: string
  /** Set on the reversing entry, pointing at what it reverses. */
  reverses?: string
}

const ACCOUNTS_KEY = "acct:accounts:v1"
const ENTRIES_KEY = "acct:journal:v1"
const LOCK_KEY = "acct:period-lock:v1"

// ---- Period lock (ACCT-5) ----
// Once a period is closed, no entry dated on/before the lock may be
// posted — corrections after close go in as adjusting/reversing entries
// dated in the open period. This is the rule that lets an accountant
// trust that last month's numbers won't silently change.
export function periodLock(): string | undefined {
  if (typeof window === "undefined") return undefined
  return kvJson.get<string>(LOCK_KEY) || undefined
}
export function setPeriodLock(date: string) {
  void kvJson.set(LOCK_KEY, date)
}

// ---- Normal side helper ----
export function normalSideFor(type: AccountType): Side {
  return type === "asset" || type === "expense" ? "debit" : "credit"
}

// ---- Starter chart of accounts (Nigerian-SMB-friendly, generic) ----
function starterChart(): Account[] {
  const mk = (code: string, name: string, type: AccountType, isControl?: boolean): Account => ({
    id: `acct-${code}`,
    code,
    name,
    type,
    normalSide: normalSideFor(type),
    isControl,
  })
  return [
    // Assets
    mk("1000", "Cash on hand", "asset"),
    mk("1010", "Bank", "asset"),
    mk("1100", "Accounts Receivable", "asset", true),
    mk("1200", "Inventory", "asset", true),
    // Liabilities
    mk("2000", "Accounts Payable", "liability", true),
    mk("2100", "VAT Payable", "liability"),
    mk("2200", "Wages Payable", "liability"),
    // Equity
    mk("3000", "Owner's Equity", "equity"),
    mk("3900", "Retained Earnings", "equity"),
    // Income
    mk("4000", "Sales", "income"),
    mk("4100", "Service Income", "income"),
    // Expenses
    mk("5000", "Cost of Goods Sold", "expense"),
    mk("5100", "Wages Expense", "expense"),
    mk("5200", "Rent", "expense"),
    mk("5300", "Utilities", "expense"),
    mk("5900", "Other Expenses", "expense"),
  ]
}

export function loadAccounts(): Account[] {
  const stored = kvJson.get<Account[]>(ACCOUNTS_KEY)
  if (stored && stored.length) return stored
  const seeded = starterChart()
  void kvJson.set(ACCOUNTS_KEY, seeded)
  return seeded
}

export function getAccount(id: string): Account | undefined {
  return loadAccounts().find((a) => a.id === id)
}
/** Find an account by its code (useful for the auto-posting layer, ACCT-2). */
export function accountByCode(code: string): Account | undefined {
  return loadAccounts().find((a) => a.code === code)
}

export function saveAccounts(list: Account[]) {
  void kvJson.set(ACCOUNTS_KEY, list)
}

// ---- Journal ----
export function listEntries(): JournalEntry[] {
  return kvJson.get<JournalEntry[]>(ENTRIES_KEY) ?? []
}
function saveEntries(list: JournalEntry[]) {
  void kvJson.set(ENTRIES_KEY, list)
}

const round2 = (n: number) => Math.round(n * 100) / 100

export function entryDebits(e: JournalEntry): number {
  return round2(e.lines.reduce((s, l) => s + (l.debit || 0), 0))
}
export function entryCredits(e: JournalEntry): number {
  return round2(e.lines.reduce((s, l) => s + (l.credit || 0), 0))
}
/** The invariant: a postable entry has equal, non-zero debits and credits. */
export function isBalanced(e: Pick<JournalEntry, "lines">): boolean {
  const d = round2(e.lines.reduce((s, l) => s + (l.debit || 0), 0))
  const c = round2(e.lines.reduce((s, l) => s + (l.credit || 0), 0))
  return d > 0 && Math.abs(d - c) < 0.005
}

export function genEntryId(): string {
  return `je_${Math.random().toString(36).slice(2, 9)}_${Date.now().toString(36)}`
}

/**
 * Post a balanced entry. Throws if it doesn't balance — the ledger never
 * accepts a lopsided entry. Returns the stored entry.
 */
export function postEntry(input: {
  date?: string
  memo: string
  lines: JournalLine[]
  source?: EntrySource
  sourceRef?: string
}): JournalEntry {
  if (!isBalanced({ lines: input.lines })) {
    throw new Error("Journal entry does not balance (debits must equal credits).")
  }
  const date = input.date ?? new Date().toISOString().slice(0, 10)
  const lock = periodLock()
  if (lock && date <= lock) {
    throw new Error(`Period is closed through ${lock}. Post into an open period instead.`)
  }
  const entry: JournalEntry = {
    id: genEntryId(),
    date,
    memo: input.memo,
    lines: input.lines.map((l) => ({ accountId: l.accountId, debit: round2(l.debit || 0), credit: round2(l.credit || 0) })),
    source: input.source ?? "manual",
    sourceRef: input.sourceRef,
    posted: true,
    locked: false,
  }
  saveEntries([entry, ...listEntries()])
  return entry
}

/**
 * Reverse a posted entry by booking a mirror entry (debits↔credits). The
 * original is never edited — this is how correct books fix mistakes.
 */
export function reverseEntry(entryId: string): JournalEntry | undefined {
  const list = listEntries()
  const original = list.find((e) => e.id === entryId)
  if (!original || original.reversedBy) return undefined
  const mirror: JournalEntry = {
    id: genEntryId(),
    date: new Date().toISOString().slice(0, 10),
    memo: `Reversal of ${original.memo}`,
    lines: original.lines.map((l) => ({ accountId: l.accountId, debit: l.credit, credit: l.debit })),
    source: original.source,
    sourceRef: original.sourceRef,
    posted: true,
    locked: false,
    reverses: original.id,
  }
  original.reversedBy = mirror.id
  saveEntries([mirror, ...list])
  return mirror
}

// ---- Trial balance (derived — always balances by construction) ----
export type TrialBalanceRow = {
  account: Account
  debit: number
  credit: number
  /** Signed balance on the account's normal side (positive = normal). */
  balance: number
}

export function trialBalance(opts?: { from?: string; to?: string }): {
  rows: TrialBalanceRow[]
  totalDebit: number
  totalCredit: number
  balanced: boolean
} {
  const accounts = loadAccounts()
  const within = (d: string) => (!opts?.from || d >= opts.from) && (!opts?.to || d <= opts.to)
  const sums = new Map<string, { debit: number; credit: number }>()
  for (const e of listEntries()) {
    if (!e.posted || !within(e.date)) continue
    for (const l of e.lines) {
      const rec = sums.get(l.accountId) || { debit: 0, credit: 0 }
      rec.debit += l.debit || 0
      rec.credit += l.credit || 0
      sums.set(l.accountId, rec)
    }
  }
  const rows: TrialBalanceRow[] = accounts
    .map((account) => {
      const s = sums.get(account.id) || { debit: 0, credit: 0 }
      const net = round2(s.debit - s.credit) // positive = net debit
      const balance = account.normalSide === "debit" ? net : -net
      return { account, debit: round2(s.debit), credit: round2(s.credit), balance: round2(balance) }
    })
    .filter((r) => r.debit !== 0 || r.credit !== 0)
  const totalDebit = round2(rows.reduce((s, r) => s + r.debit, 0))
  const totalCredit = round2(rows.reduce((s, r) => s + r.credit, 0))
  return { rows, totalDebit, totalCredit, balanced: Math.abs(totalDebit - totalCredit) < 0.005 }
}

// Seed a handful of balanced example entries so the chart, journal, and
// trial balance show real, balancing data on first open. Idempotent.
export function seedExampleLedger() {
  if (listEntries().length > 0) return
  loadAccounts() // ensure chart exists
  const code = (c: string) => accountByCode(c)!.id
  const today = new Date()
  const d = (daysAgo: number) => new Date(today.getTime() - daysAgo * 86_400_000).toISOString().slice(0, 10)

  // Owner puts ₦500,000 into the business bank account.
  postEntry({
    date: d(30), memo: "Opening capital", source: "manual",
    lines: [{ accountId: code("1010"), debit: 500000, credit: 0 }, { accountId: code("3000"), debit: 0, credit: 500000 }],
  })
  // Bought ₦180,000 of inventory on credit (a supplier bill).
  postEntry({
    date: d(20), memo: "Stock purchase — Cobalt Distributors", source: "system", sourceRef: "BILL-1042",
    lines: [{ accountId: code("1200"), debit: 180000, credit: 0 }, { accountId: code("2000"), debit: 0, credit: 180000 }],
  })
  // Cash sale of ₦120,000 + 7.5% VAT; COGS ₦60,000.
  postEntry({
    date: d(10), memo: "POS sale INV-2401", source: "system", sourceRef: "INV-2401",
    lines: [
      { accountId: code("1000"), debit: 129000, credit: 0 },
      { accountId: code("4000"), debit: 0, credit: 120000 },
      { accountId: code("2100"), debit: 0, credit: 9000 },
    ],
  })
  postEntry({
    date: d(10), memo: "COGS for INV-2401", source: "system", sourceRef: "INV-2401",
    lines: [{ accountId: code("5000"), debit: 60000, credit: 0 }, { accountId: code("1200"), debit: 0, credit: 60000 }],
  })
  // Paid ₦80,000 rent from the bank.
  postEntry({
    date: d(5), memo: "Monthly rent", source: "manual",
    lines: [{ accountId: code("5200"), debit: 80000, credit: 0 }, { accountId: code("1010"), debit: 0, credit: 80000 }],
  })
}

// ---- Statements derived from the ledger (ACCT-3) ----
// These compute FROM the trial balance, so they can never disagree with
// the journal. The balance sheet balances because it folds the period's
// net profit into equity (income/expense are temporary accounts).

export type StatementLine = { account: Account; amount: number }

export function profitAndLoss(opts?: { from?: string; to?: string }) {
  const { rows } = trialBalance(opts)
  const income: StatementLine[] = rows.filter((r) => r.account.type === "income").map((r) => ({ account: r.account, amount: r.balance }))
  const expense: StatementLine[] = rows.filter((r) => r.account.type === "expense").map((r) => ({ account: r.account, amount: r.balance }))
  const totalIncome = round2(income.reduce((s, l) => s + l.amount, 0))
  const totalExpense = round2(expense.reduce((s, l) => s + l.amount, 0))
  return { income, expense, totalIncome, totalExpense, netProfit: round2(totalIncome - totalExpense) }
}

export function balanceSheet(opts?: { to?: string }) {
  const { rows } = trialBalance({ to: opts?.to })
  const pick = (t: AccountType): StatementLine[] =>
    rows.filter((r) => r.account.type === t).map((r) => ({ account: r.account, amount: r.balance }))
  const assets = pick("asset")
  const liabilities = pick("liability")
  const equityAccounts = pick("equity")
  const { netProfit } = profitAndLoss({ to: opts?.to })
  const totalAssets = round2(assets.reduce((s, l) => s + l.amount, 0))
  const totalLiabilities = round2(liabilities.reduce((s, l) => s + l.amount, 0))
  const equityFromAccounts = round2(equityAccounts.reduce((s, l) => s + l.amount, 0))
  // Current-period earnings live in equity until closed at year end.
  const totalEquity = round2(equityFromAccounts + netProfit)
  return {
    assets,
    liabilities,
    equity: equityAccounts,
    retainedEarningsThisPeriod: netProfit,
    totalAssets,
    totalLiabilities,
    totalEquity,
    balanced: Math.abs(totalAssets - (totalLiabilities + totalEquity)) < 0.01,
  }
}

// ---- VAT / sales-tax summary from the ledger (ACCT-6) ----
// Output tax = credits to VAT Payable (collected on sales); input tax =
// debits (reclaimable on purchases). Net payable = the account balance —
// what you'd remit. Derived from posted entries, so the filing figure
// equals the books.
export function vatSummary(opts?: { from?: string; to?: string }): {
  outputTax: number
  inputTax: number
  netPayable: number
} {
  const vat = accountByCode("2100")
  if (!vat) return { outputTax: 0, inputTax: 0, netPayable: 0 }
  const within = (d: string) => (!opts?.from || d >= opts.from) && (!opts?.to || d <= opts.to)
  let credits = 0
  let debits = 0
  for (const e of listEntries()) {
    if (!e.posted || !within(e.date)) continue
    for (const l of e.lines) {
      if (l.accountId !== vat.id) continue
      credits += l.credit || 0
      debits += l.debit || 0
    }
  }
  return {
    outputTax: round2(credits),
    inputTax: round2(debits),
    netPayable: round2(credits - debits),
  }
}

// Net balance for one account (debit-positive on its normal side). Used by
// statements (ACCT-3) and the chart-of-accounts page.
export function accountBalance(accountId: string): number {
  const acct = getAccount(accountId)
  if (!acct) return 0
  let net = 0
  for (const e of listEntries()) {
    if (!e.posted) continue
    for (const l of e.lines) if (l.accountId === accountId) net += (l.debit || 0) - (l.credit || 0)
  }
  return round2(acct.normalSide === "debit" ? net : -net)
}
