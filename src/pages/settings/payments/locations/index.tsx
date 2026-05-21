import * as React from "react"
import { Banknote, CreditCard, MapPin, Search, Smartphone, Wallet } from "lucide-react"
import { PageShell } from "@/components/page-shell"
import { Input } from "@/components/ui/input"
import { useRegisterPageRefresh } from "@/hooks/use-pull-to-refresh"
import { EmptyState } from "@/components/lists/empty-state"
import { StatusBadge } from "@/components/lists/status-badge"
import { SummaryStrip } from "@/components/lists/summary-strip"
import { cn } from "@/lib/utils"

type Method = "card" | "cash" | "transfer" | "wallet"

type Row = {
  location: string
  methods: Record<Method, boolean>
  defaultMethod: Method
  device: string
}

const rows: Row[] = [
  { location: "Downtown Austin", methods: { card: true, cash: true, transfer: true, wallet: true }, defaultMethod: "card", device: "Stripe Terminal · S700" },
  { location: "East DC", methods: { card: true, cash: false, transfer: true, wallet: false }, defaultMethod: "card", device: "Stripe Terminal · M2" },
  { location: "West Hub", methods: { card: false, cash: true, transfer: false, wallet: false }, defaultMethod: "cash", device: "Manual" },
  { location: "SXSW Popup", methods: { card: true, cash: true, transfer: false, wallet: true }, defaultMethod: "card", device: "Square Terminal" },
]

const ICONS: Record<Method, typeof CreditCard> = {
  card: CreditCard,
  cash: Banknote,
  transfer: Wallet,
  wallet: Smartphone,
}

const LABELS: Record<Method, string> = {
  card: "Card",
  cash: "Cash",
  transfer: "Transfer",
  wallet: "Wallet",
}

export default function PaymentLocations() {
  const [query, setQuery] = React.useState("")
  useRegisterPageRefresh(React.useCallback(async () => { await new Promise((r) => setTimeout(r, 400)) }, []))

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return rows
    return rows.filter((r) => r.location.toLowerCase().includes(q))
  }, [query])

  const acceptCard = rows.filter((r) => r.methods.card).length
  const acceptCash = rows.filter((r) => r.methods.cash).length

  return (
    <PageShell
      title="Per-location payments"
      withToolbar={false}
      titleTooltip={
        <>
          Which payment methods are allowed at each store. Useful if
          one branch can only take cash (no card terminal) or your
          wholesale warehouse should only accept transfer. Override
          the business-wide default per location here.
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <SummaryStrip
          tiles={[
            { label: "Locations", value: String(rows.length), tone: "brand", hint: "configured" },
            { label: "Accept card", value: String(acceptCard), tone: "info", hint: "of total" },
            { label: "Accept cash", value: String(acceptCash), tone: "success", hint: "of total" },
            { label: "Devices", value: String(new Set(rows.map((r) => r.device)).size), tone: "warning", hint: "in use" },
          ]}
        />

        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search location…" className="pl-9" />
        </div>

        {filtered.length === 0 ? (
          <EmptyState Icon={MapPin} title="No locations match" description="Try a different name." />
        ) : (
          <ul className="space-y-2">
            {filtered.map((r) => {
              const acceptedCount = Object.values(r.methods).filter(Boolean).length
              return (
                <li key={r.location} className="rounded-2xl border border-border bg-card p-3">
                  <div className="flex items-start gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand dark:bg-primary/15 dark:text-primary">
                      <MapPin className="h-4 w-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate text-sm font-semibold">{r.location}</p>
                        <StatusBadge tone="info">{acceptedCount} methods</StatusBadge>
                      </div>
                      <p className="mt-0.5 text-[11px] text-muted-foreground">Device: {r.device}</p>
                    </div>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-1.5 sm:grid-cols-4">
                    {(Object.keys(ICONS) as Method[]).map((m) => {
                      const Icon = ICONS[m]
                      const accepted = r.methods[m]
                      const isDefault = r.defaultMethod === m
                      return (
                        <div
                          key={m}
                          className={cn(
                            "flex items-center gap-2 rounded-lg border px-2.5 py-1.5 text-xs",
                            accepted
                              ? "border-border bg-background"
                              : "border-dashed border-border bg-muted/30 text-muted-foreground line-through",
                          )}
                        >
                          <Icon className={accepted ? "h-3.5 w-3.5 text-brand dark:text-primary" : "h-3.5 w-3.5"} />
                          {LABELS[m]}
                          {isDefault && (
                            <span className="ml-auto rounded-full bg-brand px-1.5 py-0.5 text-[9px] font-bold text-brand-foreground dark:bg-primary dark:text-primary-foreground">
                              default
                            </span>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </PageShell>
  )
}
