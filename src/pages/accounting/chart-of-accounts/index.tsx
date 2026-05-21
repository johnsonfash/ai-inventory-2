import * as React from "react"
import { Link } from "react-router-dom"
import { toast } from "sonner"
import {
  Banknote,
  Building2,
  ChevronDown,
  ChevronRight,
  Download,
  Edit3,
  FileText,
  Plus,
  Receipt,
  Search,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react"
import { ReportShell } from "@/components/reports/report-shell"
import { type Period } from "@/components/reports/period-chips"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { StatusBadge, type StatusTone } from "@/components/lists/status-badge"
import { useRegisterPageRefresh } from "@/hooks/use-pull-to-refresh"
import { useCurrency } from "@/contexts/currency"
import { cn } from "@/lib/utils"

// Chart of accounts — the canonical list of every account Pallio
// posts to. Standard Nigerian SMB layout with FIRS-friendly codes.

type AccountType = "asset" | "liability" | "equity" | "revenue" | "expense"

type Account = {
  code: string
  name: string
  type: AccountType
  parent?: string
  balance: number
  /** Whether transactions can be posted to this account (false for
   *  parent rollup accounts). */
  postable?: boolean
  /** True if Pallio derives this from another source (e.g. POS) and
   *  manual entries shouldn't touch it. */
  systemOwned?: boolean
}

const ACCOUNTS: Account[] = [
  // ASSETS — 1xxx
  { code: "1000", name: "Cash + bank",             type: "asset", balance: 6_240_000 },
  { code: "1010", name: "Petty cash · Lekki",      type: "asset", parent: "1000", balance:    180_000, postable: true },
  { code: "1020", name: "GTBank · operating",      type: "asset", parent: "1000", balance: 4_280_000, postable: true },
  { code: "1030", name: "Kuda · savings",           type: "asset", parent: "1000", balance: 1_180_000, postable: true },
  { code: "1040", name: "Paystack · settlement",   type: "asset", parent: "1000", balance:   600_000, postable: true, systemOwned: true },

  { code: "1200", name: "Accounts receivable",     type: "asset", balance:   840_000 },
  { code: "1210", name: "Customer A/R · POS",       type: "asset", parent: "1200", balance:    240_000, postable: true, systemOwned: true },
  { code: "1220", name: "Customer A/R · Wholesale", type: "asset", parent: "1200", balance:    600_000, postable: true },

  { code: "1300", name: "Inventory · at cost",     type: "asset", balance: 6_840_000, systemOwned: true },
  { code: "1400", name: "Prepaid expenses",        type: "asset", balance:   180_000, postable: true },
  { code: "1500", name: "Fixed assets · net",      type: "asset", balance: 2_840_000 },
  { code: "1510", name: "POS hardware",             type: "asset", parent: "1500", balance:    320_000, postable: true },
  { code: "1520", name: "Delivery vehicles",        type: "asset", parent: "1500", balance: 2_400_000, postable: true },
  { code: "1530", name: "Accumulated depreciation", type: "asset", parent: "1500", balance:   -120_000, postable: true },

  // LIABILITIES — 2xxx
  { code: "2000", name: "Accounts payable",        type: "liability", balance: 1_240_000, systemOwned: true },
  { code: "2100", name: "Accrued payroll",         type: "liability", balance:   320_000, systemOwned: true },
  { code: "2200", name: "Sales tax payable · VAT", type: "liability", balance:   313_680, systemOwned: true },
  { code: "2210", name: "Withholding tax payable",  type: "liability", balance:    42_000, systemOwned: true },
  { code: "2220", name: "PAYE payable",             type: "liability", balance:   168_400, systemOwned: true },
  { code: "2300", name: "Loans · current portion", type: "liability", balance:   560_000, postable: true },
  { code: "2400", name: "Commissions payable",     type: "liability", balance:   268_000, systemOwned: true },

  // EQUITY — 3xxx
  { code: "3000", name: "Owner equity",            type: "equity", balance: 4_200_000, postable: true },
  { code: "3100", name: "Retained earnings",       type: "equity", balance: 9_840_000, systemOwned: true },

  // REVENUE — 4xxx
  { code: "4000", name: "Product sales · POS",     type: "revenue", balance: 8_240_000, systemOwned: true },
  { code: "4010", name: "Product sales · Online",  type: "revenue", balance: 4_180_000, systemOwned: true },
  { code: "4020", name: "Wholesale",                type: "revenue", balance: 2_640_000, systemOwned: true },
  { code: "4100", name: "Service fees",            type: "revenue", balance:   384_000, postable: true },
  { code: "4200", name: "Affiliate referral commission", type: "revenue", balance: 98_000, systemOwned: true },

  // EXPENSES — 5xxx
  { code: "5000", name: "Cost of goods sold",      type: "expense", balance: 6_320_000, systemOwned: true },
  { code: "5100", name: "Salaries + wages",        type: "expense", balance: 1_840_000, systemOwned: true },
  { code: "5110", name: "Sales commissions",       type: "expense", balance:   214_000, systemOwned: true },
  { code: "5200", name: "Rent",                     type: "expense", balance:   620_000, postable: true },
  { code: "5300", name: "Marketing + ads",         type: "expense", balance:   840_000, systemOwned: true },
  { code: "5400", name: "Utilities",                type: "expense", balance:    96_000, postable: true },
  { code: "5500", name: "Software + tools",        type: "expense", balance:   124_000, postable: true },
  { code: "5600", name: "Bank + payment fees",     type: "expense", balance:   148_000, systemOwned: true },
  { code: "5700", name: "Depreciation",             type: "expense", balance:   180_000, postable: true },
  { code: "5900", name: "Other admin",              type: "expense", balance:    72_000, postable: true },
]

const TYPE_META: Record<AccountType, { label: string; icon: typeof Wallet; tone: "info" | "warning" | "brand" | "success" | "danger" }> = {
  asset:     { label: "Assets",      icon: Wallet,    tone: "info"    },
  liability: { label: "Liabilities", icon: Receipt,   tone: "warning" },
  equity:    { label: "Equity",      icon: Building2, tone: "brand"   },
  revenue:   { label: "Revenue",     icon: TrendingUp, tone: "success" },
  expense:   { label: "Expenses",    icon: TrendingDown, tone: "danger" },
}

const STATUS_TONE: Record<"system" | "manual", StatusTone> = {
  system: "info",
  manual: "neutral",
}

type Filter = "all" | AccountType | "system" | "manual"

export default function ChartOfAccounts() {
  useRegisterPageRefresh(React.useCallback(async () => { await new Promise((r) => setTimeout(r, 400)) }, []))
  const { formatPrice } = useCurrency()
  const [period, setPeriod] = React.useState<Period>("ytd")
  const [filter, setFilter] = React.useState<Filter>("all")
  const [query, setQuery] = React.useState("")
  const [expanded, setExpanded] = React.useState<Set<string>>(new Set(["1000", "1200", "1500", "2000"]))

  const toggle = (code: string) => {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(code)) next.delete(code)
      else next.add(code)
      return next
    })
  }

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    return ACCOUNTS.filter((a) => {
      if (filter !== "all") {
        if (filter === "system") {
          if (!a.systemOwned) return false
        } else if (filter === "manual") {
          if (a.systemOwned) return false
        } else if (a.type !== filter) return false
      }
      if (!q) return true
      return a.code.includes(q) || a.name.toLowerCase().includes(q)
    })
  }, [filter, query])

  const groupedByType = React.useMemo(() => {
    const groups: Record<AccountType, Account[]> = { asset: [], liability: [], equity: [], revenue: [], expense: [] }
    for (const a of filtered) groups[a.type].push(a)
    return groups
  }, [filtered])

  const totals = React.useMemo(() => {
    const t: Record<AccountType, number> = { asset: 0, liability: 0, equity: 0, revenue: 0, expense: 0 }
    for (const a of ACCOUNTS) if (!a.parent) t[a.type] += a.balance
    return t
  }, [])

  const counts: Record<Filter, number> = {
    all:        ACCOUNTS.length,
    asset:      ACCOUNTS.filter((a) => a.type === "asset").length,
    liability:  ACCOUNTS.filter((a) => a.type === "liability").length,
    equity:     ACCOUNTS.filter((a) => a.type === "equity").length,
    revenue:    ACCOUNTS.filter((a) => a.type === "revenue").length,
    expense:    ACCOUNTS.filter((a) => a.type === "expense").length,
    system:     ACCOUNTS.filter((a) => a.systemOwned).length,
    manual:     ACCOUNTS.filter((a) => !a.systemOwned).length,
  }

  const exportRows = ACCOUNTS.map((a) => ({
    code: a.code, name: a.name, type: a.type, parent: a.parent ?? "",
    balance: a.balance, postable: (a.postable ?? !a.parent) ? "yes" : "no",
    source: a.systemOwned ? "system" : "manual",
  }))

  return (
    <ReportShell
      title="Chart of Accounts"
      titleTooltip={
        <>
          The canonical list of every account Pallio posts to —
          assets, liabilities, equity, revenue, expenses. Pallio
          mirrors this structure into QuickBooks / Xero / Sage so your
          books are recognisably standard. Anything tagged "system"
          is owned by Pallio (POS sales, payroll, etc.) and shouldn't
          take manual entries.
        </>
      }
      exportFilename={`pallio-coa-${period}`}
      exportRows={exportRows}
      period={period}
      onPeriodChange={setPeriod}
    >
      {/* KPI strip — totals by account type */}
      <section className="grid gap-3 lg:grid-cols-5">
        {(["asset", "liability", "equity", "revenue", "expense"] as const).map((t) => {
          const meta = TYPE_META[t]
          const Icon = meta.icon
          return (
            <Card key={t}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{meta.label}</p>
                  <Icon className={cn("h-4 w-4",
                    meta.tone === "info"    && "text-sky-600 dark:text-sky-300",
                    meta.tone === "warning" && "text-amber-600 dark:text-amber-300",
                    meta.tone === "brand"   && "text-brand dark:text-primary",
                    meta.tone === "success" && "text-emerald-600 dark:text-emerald-400",
                    meta.tone === "danger"  && "text-rose-600 dark:text-rose-400",
                  )} />
                </div>
                <p className={cn(
                  "mt-1 text-xl font-bold tabular-nums",
                  meta.tone === "info"    && "text-sky-600 dark:text-sky-300",
                  meta.tone === "warning" && "text-amber-600 dark:text-amber-300",
                  meta.tone === "brand"   && "text-brand dark:text-primary",
                  meta.tone === "success" && "text-emerald-600 dark:text-emerald-400",
                  meta.tone === "danger"  && "text-rose-600 dark:text-rose-400",
                )}>{formatPrice(totals[t])}</p>
                <p className="text-[10px] text-muted-foreground">{counts[t]} accounts</p>
              </CardContent>
            </Card>
          )
        })}
      </section>

      {/* Filter chips + search */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="-mx-4 flex gap-1.5 overflow-x-auto px-4 scrollbar-hide sm:mx-0 sm:px-0">
          {(["all", "asset", "liability", "equity", "revenue", "expense", "system", "manual"] as const).map((f) => (
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
        <div className="flex gap-2 sm:ml-auto">
          <div className="relative min-w-[200px] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by code or name…"
              className="pl-9"
            />
          </div>
          <Button size="sm" onClick={() => toast("Account creation arrives with the backend.")} className="hidden sm:inline-flex">
            <Plus className="h-3.5 w-3.5" /> Add account
          </Button>
        </div>
      </div>

      {/* Account groups */}
      {(["asset", "liability", "equity", "revenue", "expense"] as const).map((t) => {
        const list = groupedByType[t]
        if (list.length === 0) return null
        const meta = TYPE_META[t]
        const Icon = meta.icon
        return (
          <Card key={t}>
            <CardContent className="p-0">
              <div className="flex items-center justify-between border-b border-border bg-muted/30 px-4 py-3">
                <div className="flex items-center gap-2">
                  <Icon className={cn("h-4 w-4",
                    meta.tone === "info"    && "text-sky-600 dark:text-sky-300",
                    meta.tone === "warning" && "text-amber-600 dark:text-amber-300",
                    meta.tone === "brand"   && "text-brand dark:text-primary",
                    meta.tone === "success" && "text-emerald-600 dark:text-emerald-400",
                    meta.tone === "danger"  && "text-rose-600 dark:text-rose-400",
                  )} />
                  <h3 className="text-sm font-bold uppercase tracking-wider">{meta.label}</h3>
                  <span className="text-[10px] text-muted-foreground">· {list.length} accounts</span>
                </div>
                <p className={cn("text-sm font-bold tabular-nums",
                  meta.tone === "info"    && "text-sky-600 dark:text-sky-300",
                  meta.tone === "warning" && "text-amber-600 dark:text-amber-300",
                  meta.tone === "brand"   && "text-brand dark:text-primary",
                  meta.tone === "success" && "text-emerald-600 dark:text-emerald-400",
                  meta.tone === "danger"  && "text-rose-600 dark:text-rose-400",
                )}>{formatPrice(totals[t])}</p>
              </div>
              <ul className="divide-y divide-border">
                {list.filter((a) => !a.parent).map((parent) => {
                  const children = list.filter((c) => c.parent === parent.code)
                  const isExpanded = expanded.has(parent.code)
                  const hasChildren = children.length > 0
                  return (
                    <React.Fragment key={parent.code}>
                      <li className="flex items-center gap-3 px-4 py-2.5 hover:bg-accent/30">
                        {hasChildren ? (
                          <button onClick={() => toggle(parent.code)} className="flex h-5 w-5 shrink-0 items-center justify-center rounded text-muted-foreground hover:bg-accent">
                            {isExpanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                          </button>
                        ) : (
                          <span className="h-5 w-5 shrink-0" />
                        )}
                        <span className="font-mono text-xs font-bold tabular-nums text-muted-foreground">{parent.code}</span>
                        <span className="flex-1 truncate text-sm font-semibold">{parent.name}</span>
                        {parent.systemOwned && <span className="rounded bg-sky-500/15 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-sky-700 dark:text-sky-300">System</span>}
                        <span className="font-mono text-sm font-bold tabular-nums">{formatPrice(parent.balance)}</span>
                        {parent.postable && !parent.systemOwned && (
                          <button
                            type="button"
                            onClick={() => toast(`Edit ${parent.code} arrives with the backend.`)}
                            aria-label="Edit"
                            className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </li>
                      {hasChildren && isExpanded && children.map((child) => (
                        <li key={child.code} className="flex items-center gap-3 bg-muted/10 px-4 py-2 pl-12 hover:bg-accent/30">
                          <span className="font-mono text-xs tabular-nums text-muted-foreground">{child.code}</span>
                          <span className="flex-1 truncate text-sm">{child.name}</span>
                          {child.systemOwned && <span className="rounded bg-sky-500/15 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-sky-700 dark:text-sky-300">System</span>}
                          <span className="font-mono text-xs tabular-nums">{formatPrice(child.balance)}</span>
                          {child.postable && !child.systemOwned && (
                            <button
                              type="button"
                              onClick={() => toast(`Edit ${child.code} arrives with the backend.`)}
                              aria-label="Edit"
                              className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
                            >
                              <Edit3 className="h-3 w-3" />
                            </button>
                          )}
                        </li>
                      ))}
                    </React.Fragment>
                  )
                })}
              </ul>
            </CardContent>
          </Card>
        )
      })}

      {/* Cross-links */}
      <div className="grid gap-2 sm:grid-cols-3">
        {[
          { Icon: FileText, label: "Journal Entries", body: "Every debit + credit Pallio has posted.", href: "/accounting/journal-entries" },
          { Icon: Banknote, label: "Balance Sheet",   body: "Snapshot rolled up from these accounts.", href: "/accounting/balance-sheet" },
          { Icon: Download, label: "Export to QuickBooks", body: "Mirror this CoA into your QuickBooks file.", href: "/settings/integrations/quickbooks" },
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
