import * as React from "react"
import { Link } from "react-router-dom"
import { toast } from "sonner"
import {
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  Download,
  FileText,
  Plus,
  Search,
} from "lucide-react"
import { ReportShell } from "@/components/reports/report-shell"
import { type Period } from "@/components/reports/period-chips"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { StatusBadge, type StatusTone } from "@/components/lists/status-badge"
import { useIsMobile } from "@/hooks/use-mobile"
import { useRegisterPageRefresh } from "@/hooks/use-pull-to-refresh"
import { useCurrency } from "@/contexts/currency"
import { cn } from "@/lib/utils"

type EntryStatus = "posted" | "draft" | "void"
type EntrySource = "system" | "manual" | "import"

type JournalLine = {
  account: string // code
  accountName: string
  debit: number
  credit: number
}

type Journal = {
  id: string
  date: string
  description: string
  reference?: string
  source: EntrySource
  origin: string
  status: EntryStatus
  postedBy: string
  lines: JournalLine[]
}

const JOURNALS: Journal[] = [
  {
    id: "JE-2026-05-001",
    date: "May 20, 2026",
    description: "POS sale · SO-7842 · Lekki",
    reference: "POS-2026-05-7842",
    source: "system",
    origin: "POS",
    status: "posted",
    postedBy: "Pallio (auto)",
    lines: [
      { account: "1040", accountName: "Paystack · settlement", debit:  21_500, credit:      0 },
      { account: "4000", accountName: "Product sales · POS",   debit:      0, credit: 20_000 },
      { account: "2200", accountName: "Sales tax payable · VAT", debit:    0, credit:  1_500 },
    ],
  },
  {
    id: "JE-2026-05-002",
    date: "May 19, 2026",
    description: "COGS recognition · SO-7842",
    reference: "POS-2026-05-7842",
    source: "system",
    origin: "POS",
    status: "posted",
    postedBy: "Pallio (auto)",
    lines: [
      { account: "5000", accountName: "Cost of goods sold", debit: 12_000, credit:      0 },
      { account: "1300", accountName: "Inventory · at cost", debit:     0, credit: 12_000 },
    ],
  },
  {
    id: "JE-2026-05-003",
    date: "May 18, 2026",
    description: "Storefront online sale · SHOP-7841",
    reference: "SHOP-7841",
    source: "system",
    origin: "Storefront",
    status: "posted",
    postedBy: "Pallio (auto)",
    lines: [
      { account: "1040", accountName: "Paystack · settlement", debit:  68_687, credit:      0 },
      { account: "4010", accountName: "Product sales · Online", debit:      0, credit: 63_900 },
      { account: "2200", accountName: "Sales tax payable · VAT", debit:    0, credit:  4_787 },
    ],
  },
  {
    id: "JE-2026-05-004",
    date: "May 15, 2026",
    description: "Vendor bill · Cobalt Distributors",
    reference: "BILL-2410",
    source: "system",
    origin: "Bills",
    status: "posted",
    postedBy: "Aisha Nwosu",
    lines: [
      { account: "1300", accountName: "Inventory · at cost",  debit: 420_000, credit:       0 },
      { account: "2000", accountName: "Accounts payable",      debit:      0, credit: 420_000 },
    ],
  },
  {
    id: "JE-2026-05-005",
    date: "May 12, 2026",
    description: "May payroll · 7 employees",
    reference: "PR-2026-05",
    source: "system",
    origin: "Payroll",
    status: "posted",
    postedBy: "Mia Chen",
    lines: [
      { account: "5100", accountName: "Salaries + wages",      debit: 2_864_000, credit:         0 },
      { account: "2100", accountName: "Accrued payroll",       debit:         0, credit: 2_466_000 },
      { account: "2220", accountName: "PAYE payable",           debit:         0, credit:   230_000 },
      { account: "2210", accountName: "Withholding tax payable", debit:        0, credit:   142_000 },
      { account: "2300", accountName: "Loans · current portion", debit:        0, credit:    26_000 },
    ],
  },
  {
    id: "JE-2026-05-006",
    date: "May 10, 2026",
    description: "Manual adjustment · prepaid rent amortisation",
    source: "manual",
    origin: "Manual",
    status: "posted",
    postedBy: "Aisha Nwosu",
    lines: [
      { account: "5200", accountName: "Rent",              debit:  52_000, credit:       0 },
      { account: "1400", accountName: "Prepaid expenses",  debit:       0, credit:  52_000 },
    ],
  },
  {
    id: "JE-2026-05-007",
    date: "May 9, 2026",
    description: "Affiliate commission accrual · April batch",
    reference: "COMM-2026-04",
    source: "system",
    origin: "Commissions",
    status: "posted",
    postedBy: "Pallio (auto)",
    lines: [
      { account: "5110", accountName: "Sales commissions", debit: 214_000, credit:       0 },
      { account: "2400", accountName: "Commissions payable", debit:     0, credit: 214_000 },
    ],
  },
  {
    id: "JE-2026-05-008",
    date: "May 8, 2026",
    description: "Owner draw",
    source: "manual",
    origin: "Manual",
    status: "draft",
    postedBy: "Aisha Nwosu",
    lines: [
      { account: "3000", accountName: "Owner equity",      debit: 300_000, credit:       0 },
      { account: "1020", accountName: "GTBank · operating", debit:      0, credit: 300_000 },
    ],
  },
  {
    id: "JE-2026-05-009",
    date: "May 4, 2026",
    description: "Depreciation · POS hardware",
    source: "system",
    origin: "Schedule",
    status: "posted",
    postedBy: "Pallio (auto)",
    lines: [
      { account: "5700", accountName: "Depreciation",                  debit: 18_000, credit:      0 },
      { account: "1530", accountName: "Accumulated depreciation",      debit:      0, credit: 18_000 },
    ],
  },
  {
    id: "JE-2026-05-010",
    date: "May 2, 2026",
    description: "Bank reconciliation · Apr fees",
    source: "manual",
    origin: "Reconciliation",
    status: "posted",
    postedBy: "Aisha Nwosu",
    lines: [
      { account: "5600", accountName: "Bank + payment fees", debit: 8_400, credit:     0 },
      { account: "1020", accountName: "GTBank · operating",  debit:     0, credit: 8_400 },
    ],
  },
  {
    id: "JE-2026-04-118",
    date: "Apr 28, 2026",
    description: "VOID — duplicate posting",
    source: "manual",
    origin: "Manual",
    status: "void",
    postedBy: "Aisha Nwosu",
    lines: [
      { account: "5500", accountName: "Software + tools",  debit:      0, credit:   24_000 },
      { account: "1020", accountName: "GTBank · operating", debit:  24_000, credit:        0 },
    ],
  },
]

const STATUS_TONE: Record<EntryStatus, StatusTone> = {
  posted: "success",
  draft:  "warning",
  void:   "neutral",
}

const SOURCE_TONE: Record<EntrySource, StatusTone> = {
  system: "info",
  manual: "brand",
  import: "warning",
}

type Filter = "all" | EntryStatus | EntrySource

export default function JournalEntries() {
  useRegisterPageRefresh(React.useCallback(async () => { await new Promise((r) => setTimeout(r, 400)) }, []))
  const isMobile = useIsMobile()
  const { formatPrice } = useCurrency()
  const [period, setPeriod] = React.useState<Period>("30d")
  const [filter, setFilter] = React.useState<Filter>("all")
  const [query, setQuery] = React.useState("")
  const [expanded, setExpanded] = React.useState<Set<string>>(new Set([JOURNALS[0]!.id]))

  const toggle = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    return JOURNALS.filter((j) => {
      if (filter !== "all") {
        if (filter === "posted" || filter === "draft" || filter === "void") {
          if (j.status !== filter) return false
        } else if (j.source !== filter) return false
      }
      if (!q) return true
      return (
        j.id.toLowerCase().includes(q) ||
        j.description.toLowerCase().includes(q) ||
        (j.reference?.toLowerCase().includes(q) ?? false) ||
        j.lines.some((l) => l.accountName.toLowerCase().includes(q) || l.account.includes(q))
      )
    })
  }, [filter, query])

  const posted = JOURNALS.filter((j) => j.status === "posted")
  const drafts = JOURNALS.filter((j) => j.status === "draft")
  const totalDebits = posted.flatMap((j) => j.lines).reduce((s, l) => s + l.debit, 0)
  const balanced = posted.flatMap((j) => j.lines).reduce((s, l) => s + l.debit - l.credit, 0) === 0

  const counts: Record<Filter, number> = {
    all:     JOURNALS.length,
    posted:  posted.length,
    draft:   drafts.length,
    void:    JOURNALS.filter((j) => j.status === "void").length,
    system:  JOURNALS.filter((j) => j.source === "system").length,
    manual:  JOURNALS.filter((j) => j.source === "manual").length,
    import:  JOURNALS.filter((j) => j.source === "import").length,
  }

  const exportRows = JOURNALS.flatMap((j) =>
    j.lines.map((l) => ({
      id: j.id, date: j.date, description: j.description, reference: j.reference ?? "",
      source: j.source, status: j.status, account_code: l.account, account_name: l.accountName,
      debit: l.debit, credit: l.credit,
    })),
  )

  return (
    <ReportShell
      title="Journal Entries"
      titleTooltip={
        <>
          The general-ledger view — every debit + credit Pallio has
          posted. System entries flow automatically from POS, online
          sales, payroll, commissions, and bills. Manual entries are
          for adjustments your accountant raises (depreciation,
          prepaid amortisation, etc).
        </>
      }
      exportFilename={`pallio-journal-${period}`}
      exportRows={exportRows}
      period={period}
      onPeriodChange={setPeriod}
    >
      {/* KPIs */}
      <section className="grid gap-3 lg:grid-cols-4">
        <Tile label="Entries posted"     value={String(posted.length)}      tone="success" sub="balanced" />
        <Tile label="Drafts"             value={String(drafts.length)}      tone="warning" sub="awaiting review" />
        <Tile label="Total debits posted" value={formatPrice(totalDebits)}  tone="info"    sub="= total credits" />
        <Tile label="Balance check"      value={balanced ? "Balanced" : "Off"} tone={balanced ? "success" : "danger"} sub={balanced ? "debits = credits" : "investigate now"} />
      </section>

      {/* Action bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-[11px] text-muted-foreground">{filtered.length} entries · {filtered.flatMap((j) => j.lines).length} line items</p>
        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm" variant="outline" onClick={() => toast.success("Journal export started — CSV ready in your downloads.")}>
            <Download className="h-3.5 w-3.5" /> Export
          </Button>
          <Button size="sm" onClick={() => toast("Manual journal form arrives with the backend.")}>
            <Plus className="h-3.5 w-3.5" /> Manual entry
          </Button>
        </div>
      </div>

      {/* Filter chips + search */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="-mx-4 flex gap-1.5 overflow-x-auto px-4 scrollbar-hide sm:mx-0 sm:px-0">
          {(["all", "posted", "draft", "void", "system", "manual"] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={cn(
                "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold capitalize transition-colors",
                filter === f
                  ? "border-transparent bg-brand text-brand-foreground dark:bg-primary dark:text-primary-foreground"
                  : "border-border bg-card text-muted-foreground hover:bg-accent hover:text-foreground",
              )}
            >
              {f === "all" ? "All" : f}
              <span className={cn("rounded-full px-1.5 py-0.5 text-[10px] tabular-nums", filter === f ? "bg-white/20" : "bg-muted")}>
                {counts[f]}
              </span>
            </button>
          ))}
        </div>
        <div className="relative min-w-[220px] sm:ml-auto">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search description, ref, account…"
            className="pl-9"
          />
        </div>
      </div>

      {/* Journal list */}
      <Card>
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <div className="p-12 text-center text-sm text-muted-foreground">No journal entries match.</div>
          ) : (
            <ul className="divide-y divide-border">
              {filtered.map((j) => {
                const isExpanded = expanded.has(j.id)
                const debits  = j.lines.reduce((s, l) => s + l.debit, 0)
                const credits = j.lines.reduce((s, l) => s + l.credit, 0)
                return (
                  <li key={j.id}>
                    {/* Summary row */}
                    <button
                      type="button"
                      onClick={() => toggle(j.id)}
                      className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-accent/30"
                    >
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded text-muted-foreground">
                        {isExpanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                      </span>
                      <div className="hidden w-32 shrink-0 sm:block">
                        <p className="font-mono text-xs font-bold">{j.id}</p>
                        <p className="text-[10px] text-muted-foreground">{j.date}</p>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <p className="truncate text-sm font-semibold">{j.description}</p>
                          <StatusBadge tone={SOURCE_TONE[j.source]}>{j.origin}</StatusBadge>
                          <StatusBadge tone={STATUS_TONE[j.status]} withDot>{j.status}</StatusBadge>
                        </div>
                        <p className="truncate text-[11px] text-muted-foreground sm:hidden">
                          <span className="font-mono">{j.id}</span> · {j.date} · {j.lines.length} lines
                        </p>
                        <p className="truncate text-[11px] text-muted-foreground hidden sm:block">
                          {j.lines.length} lines · {j.postedBy}{j.reference && ` · ref ${j.reference}`}
                        </p>
                      </div>
                      <p className="font-mono text-sm font-bold tabular-nums">{formatPrice(debits)}</p>
                    </button>

                    {/* Line items */}
                    {isExpanded && (
                      <div className="border-t border-border bg-muted/20 px-4 py-3 sm:px-8">
                        {isMobile ? (
                          <ul className="space-y-2">
                            {j.lines.map((l, i) => (
                              <li key={i} className="rounded-lg border border-border bg-card p-2.5">
                                <div className="flex items-baseline justify-between gap-2">
                                  <Link to="/accounting/chart-of-accounts" className="font-mono text-[11px] font-bold text-brand hover:underline dark:text-primary">
                                    {l.account}
                                  </Link>
                                  <p className="text-xs font-bold tabular-nums">
                                    {l.debit > 0 ? formatPrice(l.debit) : ""}
                                    {l.credit > 0 ? <span className="text-rose-600 dark:text-rose-400">({formatPrice(l.credit)})</span> : ""}
                                  </p>
                                </div>
                                <p className="text-xs">{l.accountName}</p>
                                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                                  {l.debit > 0 ? "debit" : "credit"}
                                </p>
                              </li>
                            ))}
                            <li className="flex items-baseline justify-between border-t border-border pt-2 text-xs font-bold">
                              <span>Totals</span>
                              <span className="font-mono tabular-nums">{formatPrice(debits)} / {formatPrice(credits)}</span>
                            </li>
                          </ul>
                        ) : (
                          <table className="w-full text-xs">
                            <thead className="text-[10px] uppercase tracking-wider text-muted-foreground">
                              <tr>
                                <th className="py-1.5 text-left font-medium">Code</th>
                                <th className="py-1.5 text-left font-medium">Account</th>
                                <th className="py-1.5 text-right font-medium">Debit</th>
                                <th className="py-1.5 text-right font-medium">Credit</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-border/60">
                              {j.lines.map((l, i) => (
                                <tr key={i}>
                                  <td className="py-1.5">
                                    <Link to="/accounting/chart-of-accounts" className="font-mono font-bold text-brand hover:underline dark:text-primary">
                                      {l.account}
                                    </Link>
                                  </td>
                                  <td className="py-1.5">{l.accountName}</td>
                                  <td className="py-1.5 text-right tabular-nums">{l.debit > 0 ? formatPrice(l.debit) : ""}</td>
                                  <td className="py-1.5 text-right tabular-nums text-rose-600 dark:text-rose-400">{l.credit > 0 ? formatPrice(l.credit) : ""}</td>
                                </tr>
                              ))}
                              <tr className="border-t border-border font-bold">
                                <td colSpan={2} className="py-1.5">Totals</td>
                                <td className="py-1.5 text-right tabular-nums">{formatPrice(debits)}</td>
                                <td className="py-1.5 text-right tabular-nums">{formatPrice(credits)}</td>
                              </tr>
                            </tbody>
                          </table>
                        )}
                        {j.status === "draft" && (
                          <div className="mt-3 flex justify-end gap-2">
                            <Button size="sm" variant="outline" onClick={() => toast("Edit draft arrives with the backend.")}>
                              Edit
                            </Button>
                            <Button size="sm" onClick={() => toast.success(`${j.id} posted to ledger.`)}>
                              <CheckCircle2 className="h-3.5 w-3.5" /> Post
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                  </li>
                )
              })}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Cross-links */}
      <div className="grid gap-2 sm:grid-cols-3">
        {[
          { Icon: FileText, label: "Chart of Accounts", body: "The account list every entry references.", href: "/accounting/chart-of-accounts" },
          { Icon: Clock,    label: "Reconciliation",     body: "Match Pallio entries against bank statement.", href: "/accounting/reconciliation" },
          { Icon: Download, label: "Trial balance",      body: "Sum of all account balances — should be zero.", href: "#" },
        ].map((q) => (
          <Link key={q.label} to={q.href} className="group flex items-center gap-3 rounded-2xl border border-border bg-card p-3 transition-colors hover:border-brand/40 hover:bg-accent/40">
            <q.Icon className="h-4 w-4 text-brand dark:text-primary" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{q.label}</p>
              <p className="truncate text-[11px] text-muted-foreground">{q.body}</p>
            </div>
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
          </Link>
        ))}
      </div>
    </ReportShell>
  )
}

function Tile({ label, value, sub, tone }: { label: string; value: string; sub?: string; tone?: "success" | "info" | "warning" | "danger" }) {
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
        <p className={cn(
          "mt-1 text-2xl font-bold tabular-nums",
          tone === "success" && "text-emerald-600 dark:text-emerald-400",
          tone === "info"    && "text-sky-600 dark:text-sky-300",
          tone === "warning" && "text-amber-600 dark:text-amber-300",
          tone === "danger"  && "text-rose-600 dark:text-rose-400",
        )}>{value}</p>
        {sub && <p className="mt-1 text-[11px] text-muted-foreground">{sub}</p>}
      </CardContent>
    </Card>
  )
}

void ArrowRight
