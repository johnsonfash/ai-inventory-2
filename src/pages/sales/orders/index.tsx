import * as React from "react"
import { Link } from "react-router-dom"
import {
  ChevronRight,
  ClipboardList,
  Filter,
  Plus,
  Printer,
  Search,
  XCircle,
} from "lucide-react"
import { PageShell } from "@/components/page-shell"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useIsMobile } from "@/hooks/use-mobile"
import { useRegisterPageRefresh } from "@/hooks/use-pull-to-refresh"
import { StatusBadge, type StatusTone } from "@/components/lists/status-badge"
import { EmptyState } from "@/components/lists/empty-state"
import { FilterChips, type FilterChip } from "@/components/lists/filter-chips"
import { FilterButton } from "@/components/lists/filter-button"
import {
  FilterPillGroup,
  FilterSection,
  FilterSheet,
} from "@/components/lists/filter-sheet"
import { SwipeableRow } from "@/components/mobile/swipeable-row"

type OrderStatus = "fulfilled" | "pending" | "processing" | "cancelled"
type Channel = "online" | "retail" | "wholesale"

type Order = {
  id: string
  customer: string
  items: number
  total: number
  status: OrderStatus
  date: string
  channel: Channel
}

const orders: Order[] = [
  { id: "SO-7842", customer: "NovaApps", items: 4, total: 420.0, status: "fulfilled", date: "2026-05-19", channel: "online" },
  { id: "SO-7849", customer: "BrightLane", items: 2, total: 120.0, status: "pending", date: "2026-05-20", channel: "wholesale" },
  { id: "SO-7851", customer: "Aisha N.", items: 1, total: 28.5, status: "processing", date: "2026-05-20", channel: "retail" },
  { id: "SO-7846", customer: "Daniel K.", items: 6, total: 1284.0, status: "fulfilled", date: "2026-05-18", channel: "online" },
  { id: "SO-7833", customer: "Linda M.", items: 3, total: 92.15, status: "cancelled", date: "2026-05-17", channel: "retail" },
  { id: "SO-7828", customer: "Acme Co", items: 12, total: 3210.0, status: "processing", date: "2026-05-16", channel: "wholesale" },
]

const STATUS_OPTIONS = [
  { value: "fulfilled", label: "Fulfilled" },
  { value: "processing", label: "Processing" },
  { value: "pending", label: "Pending" },
  { value: "cancelled", label: "Cancelled" },
] as const
const CHANNEL_OPTIONS = [
  { value: "online", label: "Online" },
  { value: "retail", label: "Retail" },
  { value: "wholesale", label: "Wholesale" },
] as const
const PERIOD_OPTIONS = [
  { value: "all", label: "All time" },
  { value: "today", label: "Today" },
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
] as const

type Period = (typeof PERIOD_OPTIONS)[number]["value"]

const statusTone: Record<OrderStatus, StatusTone> = {
  fulfilled: "success",
  processing: "info",
  pending: "warning",
  cancelled: "danger",
}

export default function SalesOrders() {
  const isMobile = useIsMobile()
  const [query, setQuery] = React.useState("")
  const [filterOpen, setFilterOpen] = React.useState(false)

  const [statuses, setStatuses] = React.useState<OrderStatus[]>([])
  const [channels, setChannels] = React.useState<Channel[]>([])
  const [period, setPeriod] = React.useState<Period>("all")

  const [stagedStatuses, setStagedStatuses] = React.useState<OrderStatus[]>([])
  const [stagedChannels, setStagedChannels] = React.useState<Channel[]>([])
  const [stagedPeriod, setStagedPeriod] = React.useState<Period>("all")

  React.useEffect(() => {
    if (filterOpen) {
      setStagedStatuses(statuses)
      setStagedChannels(channels)
      setStagedPeriod(period)
    }
  }, [filterOpen, statuses, channels, period])

  useRegisterPageRefresh(
    React.useCallback(async () => {
      await new Promise((r) => setTimeout(r, 400))
    }, []),
  )

  const filtered = React.useMemo(() => {
    let list = orders
    const q = query.trim().toLowerCase()
    if (q) {
      list = list.filter(
        (o) => o.id.toLowerCase().includes(q) || o.customer.toLowerCase().includes(q),
      )
    }
    if (statuses.length > 0) list = list.filter((o) => statuses.includes(o.status))
    if (channels.length > 0) list = list.filter((o) => channels.includes(o.channel))
    return list
  }, [query, statuses, channels])

  const chips: FilterChip[] = React.useMemo(() => {
    const c: FilterChip[] = []
    for (const s of statuses) {
      c.push({
        key: `s:${s}`,
        label: STATUS_OPTIONS.find((o) => o.value === s)!.label,
        onRemove: () => setStatuses((p) => p.filter((x) => x !== s)),
      })
    }
    for (const ch of channels) {
      c.push({
        key: `c:${ch}`,
        label: CHANNEL_OPTIONS.find((o) => o.value === ch)!.label,
        onRemove: () => setChannels((p) => p.filter((x) => x !== ch)),
      })
    }
    if (period !== "all") {
      c.push({
        key: `p:${period}`,
        label: PERIOD_OPTIONS.find((o) => o.value === period)!.label,
        onRemove: () => setPeriod("all"),
      })
    }
    return c
  }, [statuses, channels, period])

  const appliedCount = chips.length

  const totalRevenue = orders.reduce((s, o) => (o.status === "fulfilled" ? s + o.total : s), 0)
  const fulfilledCount = orders.filter((o) => o.status === "fulfilled").length
  const processingCount = orders.filter((o) => o.status === "processing").length
  const pendingCount = orders.filter((o) => o.status === "pending").length

  return (
    <PageShell
      title="Orders"
      withToolbar
      mobileTrailing={<FilterButton onClick={() => setFilterOpen(true)} count={appliedCount} />}
    >
      <div className="flex flex-col gap-4">
        <div className="-mx-4 flex gap-2.5 overflow-x-auto px-4 pb-1 scrollbar-hide snap-x snap-mandatory md:mx-0 md:grid md:grid-cols-4 md:gap-3 md:overflow-visible md:px-0">
          {[
            { label: "Revenue", value: `$${totalRevenue.toLocaleString()}`, tone: "brand" as StatusTone },
            { label: "Fulfilled", value: String(fulfilledCount), tone: "success" as StatusTone },
            { label: "Processing", value: String(processingCount), tone: "info" as StatusTone },
            { label: "Pending", value: String(pendingCount), tone: "warning" as StatusTone },
          ].map((t) => (
            <div
              key={t.label}
              className="min-w-[140px] snap-start rounded-2xl border border-border bg-card p-3 md:min-w-0"
            >
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{t.label}</p>
              <p className="mt-1 text-xl font-bold tabular-nums">{t.value}</p>
              <div className="mt-1.5">
                <StatusBadge tone={t.tone} withDot>
                  this period
                </StatusBadge>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-[180px] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search order # or customer…"
              className="pl-9"
            />
          </div>
          <Button variant="outline" className="hidden md:inline-flex" onClick={() => setFilterOpen(true)}>
            <Filter className="h-4 w-4" /> Filters {appliedCount ? `(${appliedCount})` : ""}
          </Button>
          <Link to="/sales/orders/new" className="hidden md:inline-flex">
            <Button>
              <Plus className="h-4 w-4" /> New order
            </Button>
          </Link>
        </div>

        <FilterChips
          chips={chips}
          onClearAll={
            appliedCount > 0
              ? () => {
                  setStatuses([])
                  setChannels([])
                  setPeriod("all")
                }
              : undefined
          }
        />

        {filtered.length === 0 ? (
          <Card>
            <CardContent className="p-0">
              <EmptyState
                Icon={ClipboardList}
                title="No orders match"
                description="Adjust filters or clear search to broaden the result set."
              />
            </CardContent>
          </Card>
        ) : isMobile ? (
          <ul className="space-y-2">
            {filtered.map((o) => (
              <li key={o.id}>
                <SwipeableRow
                  rightActions={[
                    { label: "Print", tone: "neutral", icon: <Printer className="h-4 w-4" />, onPress: () => {} },
                    { label: "Cancel", tone: "danger", icon: <XCircle className="h-4 w-4" />, onPress: () => {} },
                  ]}
                >
                  <Link to={`/sales/orders`} className="flex items-center gap-3 p-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate text-sm font-semibold">{o.customer}</p>
                        <p className="shrink-0 text-sm font-semibold tabular-nums">${o.total.toFixed(2)}</p>
                      </div>
                      <div className="mt-0.5 flex items-center justify-between gap-2 text-[11px] text-muted-foreground">
                        <span className="truncate">
                          <span className="font-mono">{o.id}</span> · {o.items} items · {o.channel}
                        </span>
                        <StatusBadge tone={statusTone[o.status]}>{o.status}</StatusBadge>
                      </div>
                      <div className="mt-1 text-[10px] tabular-nums text-muted-foreground">{o.date}</div>
                    </div>
                    <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                  </Link>
                </SwipeableRow>
              </li>
            ))}
          </ul>
        ) : (
          <div className="overflow-hidden rounded-xl border border-border bg-card">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-3 py-2.5 font-medium">Order</th>
                  <th className="px-3 py-2.5 font-medium">Customer</th>
                  <th className="px-3 py-2.5 font-medium">Channel</th>
                  <th className="px-3 py-2.5 text-right font-medium">Items</th>
                  <th className="px-3 py-2.5 text-right font-medium">Total</th>
                  <th className="px-3 py-2.5 font-medium">Status</th>
                  <th className="px-3 py-2.5 font-medium">Date</th>
                  <th className="px-3 py-2.5 text-right font-medium" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((o) => (
                  <tr key={o.id} className="transition-colors hover:bg-accent/30">
                    <td className="px-3 py-2.5 font-mono text-xs">{o.id}</td>
                    <td className="px-3 py-2.5 font-medium">{o.customer}</td>
                    <td className="px-3 py-2.5 capitalize text-muted-foreground">{o.channel}</td>
                    <td className="px-3 py-2.5 text-right tabular-nums">{o.items}</td>
                    <td className="px-3 py-2.5 text-right tabular-nums">${o.total.toFixed(2)}</td>
                    <td className="px-3 py-2.5">
                      <StatusBadge tone={statusTone[o.status]} withDot>
                        {o.status}
                      </StatusBadge>
                    </td>
                    <td className="px-3 py-2.5 text-muted-foreground">{o.date}</td>
                    <td className="px-3 py-2.5 text-right">
                      <Button size="sm" variant="ghost" asChild>
                        <Link to="/sales/orders">Open</Link>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <FilterSheet
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        onApply={() => {
          setStatuses(stagedStatuses)
          setChannels(stagedChannels)
          setPeriod(stagedPeriod)
        }}
        onReset={() => {
          setStagedStatuses([])
          setStagedChannels([])
          setStagedPeriod("all")
        }}
        appliedCount={appliedCount}
        title="Filter orders"
      >
        <FilterSection title="Status">
          <FilterPillGroup
            multi
            options={STATUS_OPTIONS as unknown as { value: OrderStatus; label: string }[]}
            value={stagedStatuses}
            onChange={(v) => setStagedStatuses(Array.isArray(v) ? v : v ? [v] : [])}
          />
        </FilterSection>
        <FilterSection title="Channel">
          <FilterPillGroup
            multi
            options={CHANNEL_OPTIONS as unknown as { value: Channel; label: string }[]}
            value={stagedChannels}
            onChange={(v) => setStagedChannels(Array.isArray(v) ? v : v ? [v] : [])}
          />
        </FilterSection>
        <FilterSection title="Period">
          <FilterPillGroup
            options={PERIOD_OPTIONS as unknown as { value: Period; label: string }[]}
            value={stagedPeriod}
            onChange={(v) => setStagedPeriod((v as Period) ?? "all")}
          />
        </FilterSection>
      </FilterSheet>
    </PageShell>
  )
}
