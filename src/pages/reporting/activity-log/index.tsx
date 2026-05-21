import * as React from "react"
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  ClipboardList,
  CreditCard,
  Package,
  RefreshCw,
  Truck,
  User,
  type LucideIcon,
} from "lucide-react"
import { ReportShell } from "@/components/reports/report-shell"
import { KpiBand } from "@/components/reports/kpi-band"
import { StatusBadge, type StatusTone } from "@/components/lists/status-badge"
import { useRegisterPageRefresh } from "@/hooks/use-pull-to-refresh"
import { type Period } from "@/components/reports/period-chips"
import { cn } from "@/lib/utils"
import { formatPriceFor } from "@/contexts/currency"

type Severity = "info" | "success" | "warning" | "danger"

type Event = {
  id: string
  actor: string
  message: string
  category: "Order" | "Stock" | "Payment" | "User" | "PO"
  severity: Severity
  Icon: LucideIcon
  agoMinutes: number
}

const events: Event[] = [
  { id: "ev-001", actor: "Mia Chen", message: `Fulfilled order SO-7842 (4 items, ${formatPriceFor(420)})`, category: "Order", severity: "success", Icon: CheckCircle2, agoMinutes: 8 },
  { id: "ev-002", actor: "Alex Larson", message: "Created purchase order PO-1045", category: "PO", severity: "info", Icon: Truck, agoMinutes: 22 },
  { id: "ev-003", actor: "system", message: "Stock received: 20 × EL-2109 to WH-A", category: "Stock", severity: "info", Icon: Package, agoMinutes: 41 },
  { id: "ev-004", actor: "Priya Patel", message: `Recorded payment ${formatPriceFor(1284)} (INV-2039)`, category: "Payment", severity: "success", Icon: CreditCard, agoMinutes: 58 },
  { id: "ev-005", actor: "system", message: "Low stock alert: BT-9091 (5/15)", category: "Stock", severity: "warning", Icon: AlertTriangle, agoMinutes: 90 },
  { id: "ev-006", actor: "Daniel Kim", message: "Cancelled order SO-7833", category: "Order", severity: "danger", Icon: ClipboardList, agoMinutes: 124 },
  { id: "ev-007", actor: "Mia Chen", message: "Created customer record: NovaApps", category: "User", severity: "info", Icon: User, agoMinutes: 180 },
  { id: "ev-008", actor: "system", message: "Daily sync completed (284 events)", category: "User", severity: "success", Icon: RefreshCw, agoMinutes: 360 },
]

const sevTone: Record<Severity, StatusTone> = {
  info: "info",
  success: "success",
  warning: "warning",
  danger: "danger",
}

const CATEGORIES = ["All", "Order", "Stock", "Payment", "User", "PO"] as const
const SEVERITIES: { label: string; value: Severity | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Info", value: "info" },
  { label: "Success", value: "success" },
  { label: "Warning", value: "warning" },
  { label: "Danger", value: "danger" },
]

function relTime(min: number) {
  if (min < 60) return `${min}m ago`
  const h = Math.floor(min / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

export default function ActivityLog() {
  const [period, setPeriod] = React.useState<Period>("7d")
  const [category, setCategory] = React.useState<(typeof CATEGORIES)[number]>("All")
  const [severity, setSeverity] = React.useState<Severity | "all">("all")

  useRegisterPageRefresh(
    React.useCallback(async () => {
      await new Promise((r) => setTimeout(r, 400))
    }, []),
  )

  const filtered = React.useMemo(() => {
    return events.filter((e) => {
      if (category !== "All" && e.category !== category) return false
      if (severity !== "all" && e.severity !== severity) return false
      return true
    })
  }, [category, severity])

  const totalCount = events.length
  const warningCount = events.filter((e) => e.severity === "warning" || e.severity === "danger").length
  const successCount = events.filter((e) => e.severity === "success").length
  const uniqueActors = new Set(events.map((e) => e.actor)).size

  return (
    <ReportShell
      title="Activity log"
      description="System-wide audit trail of user and system actions"
      titleTooltip={
        <>
          Every meaningful action taken in Pallio — sign-ins, sales,
          stock changes, settings tweaks, role grants. Filterable by
          actor + severity. Your first stop when something looks off
          and you need to trace exactly when + who did what.
        </>
      }
      period={period}
      onPeriodChange={setPeriod}
      exportFilename={`pallio-activity-${period}`}
      exportRows={events.map((e) => ({
        ID: e.id,
        Actor: e.actor,
        Category: e.category,
        Severity: e.severity,
        Message: e.message,
        "Minutes ago": e.agoMinutes,
      }))}
    >
      <KpiBand
        items={[
          { title: "Total events", value: String(totalCount), Icon: Activity, tone: "violet" },
          { title: "Successes", value: String(successCount), Icon: CheckCircle2, tone: "emerald" },
          { title: "Warnings", value: String(warningCount), Icon: AlertTriangle, tone: "amber" },
          { title: "Actors", value: String(uniqueActors), caption: "unique users", Icon: User, tone: "sky" },
        ]}
      />

      {/* Category + severity filter pills */}
      <div className="flex flex-col gap-2">
        <div className="-mx-4 flex gap-1.5 overflow-x-auto px-4 pb-1 scrollbar-hide md:mx-0 md:px-0">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCategory(c)}
              className={cn(
                "shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                category === c
                  ? "border-transparent bg-brand text-brand-foreground dark:bg-primary dark:text-primary-foreground"
                  : "border-border bg-card text-muted-foreground hover:bg-accent hover:text-foreground",
              )}
            >
              {c}
            </button>
          ))}
        </div>
        <div className="-mx-4 flex gap-1.5 overflow-x-auto px-4 pb-1 scrollbar-hide md:mx-0 md:px-0">
          {SEVERITIES.map((s) => (
            <button
              key={s.value}
              type="button"
              onClick={() => setSeverity(s.value)}
              className={cn(
                "shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                severity === s.value
                  ? "border-transparent bg-foreground/85 text-background"
                  : "border-border bg-card text-muted-foreground hover:bg-accent hover:text-foreground",
              )}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Timeline */}
      <ol className="relative space-y-3">
        {filtered.length === 0 ? (
          <li className="rounded-xl border border-border bg-card p-6 text-center text-sm text-muted-foreground">
            No events match these filters.
          </li>
        ) : (
          filtered.map((e) => {
            const Icon = e.Icon
            return (
              <li key={e.id} className="flex gap-3 rounded-2xl border border-border bg-card p-3">
                <span
                  className={cn(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
                    e.severity === "success" && "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300",
                    e.severity === "warning" && "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-300",
                    e.severity === "danger" && "bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-300",
                    e.severity === "info" && "bg-brand-soft text-brand dark:bg-primary/15 dark:text-primary",
                  )}
                >
                  <Icon className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="truncate text-sm font-medium">{e.message}</p>
                    <span className="shrink-0 text-[11px] text-muted-foreground">{relTime(e.agoMinutes)}</span>
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                    <span className="truncate">by {e.actor}</span>
                    <StatusBadge tone={sevTone[e.severity]}>{e.category}</StatusBadge>
                  </div>
                </div>
              </li>
            )
          })
        )}
      </ol>
    </ReportShell>
  )
}
