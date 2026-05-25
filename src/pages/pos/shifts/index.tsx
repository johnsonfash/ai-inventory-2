import * as React from "react"
import { ClipboardList, LockKeyhole, PlayCircle, StopCircle } from "lucide-react"
import { PageShell } from "@/components/page-shell"
import { BottomSheet } from "@/components/mobile/bottom-sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { EmptyState } from "@/components/lists/empty-state"
import { StatusBadge } from "@/components/lists/status-badge"
import { useRegisterPageRefresh } from "@/hooks/use-pull-to-refresh"
import { useCurrency } from "@/contexts/currency"
import { listCashiersForLocation, listLocations } from "@/lib/payments/virtual-accounts"
import {
  activeShift,
  buildShiftReport,
  closeShift,
  listShifts,
  openShift,
  seedExampleShift,
  type Shift,
  type ShiftReport,
} from "@/lib/pos/shifts"

export default function ShiftsPage() {
  const { formatPrice } = useCurrency()
  const [shifts, setShifts] = React.useState<Shift[]>(() => listShifts())
  const active = activeShift()
  const [openSheet, setOpenSheet] = React.useState(false)
  const [closeSheet, setCloseSheet] = React.useState(false)
  const [reportShift, setReportShift] = React.useState<Shift | null>(null)

  // Open-shift form
  const [location, setLocation] = React.useState(() => listLocations()[0] || "HQ")
  const [cashier, setCashier] = React.useState(() => listCashiersForLocation(location)[0] || "Alice")
  const [float, setFloat] = React.useState("")
  // Close-shift form
  const [counted, setCounted] = React.useState("")

  const reload = React.useCallback(() => setShifts(listShifts()), [])
  useRegisterPageRefresh(
    React.useCallback(async () => {
      reload()
      await new Promise((r) => setTimeout(r, 150))
    }, [reload]),
  )

  const doOpen = () => {
    openShift({ cashier, location, openingFloat: Number(float) || 0 })
    setFloat("")
    setOpenSheet(false)
    reload()
  }
  const doClose = () => {
    if (!active) return
    closeShift(active.id, Number(counted) || 0)
    setCounted("")
    setCloseSheet(false)
    reload()
  }

  return (
    <PageShell
      title="Cashier shifts"
      withToolbar={false}
      titleTooltip={
        <>
          Open a shift with the cash you start with, close it with what you count at the
          end. Pallio shows expected vs counted so you spot a short drawer immediately. The
          X-report is a mid-shift snapshot; the Z-report closes the day.
        </>
      }
      toolbarActions={
        active ? (
          <Button type="button" variant="outline" onClick={() => setCloseSheet(true)}>
            <StopCircle className="h-4 w-4" /> Close shift
          </Button>
        ) : (
          <Button type="button" onClick={() => setOpenSheet(true)}>
            <PlayCircle className="h-4 w-4" /> Open shift
          </Button>
        )
      }
    >
      {/* Active shift card */}
      {active && (
        <div className="mb-4 rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold">
                Shift open · {active.cashier} @ {active.location}
              </p>
              <p className="text-xs text-muted-foreground">
                Since {new Date(active.openedAt).toLocaleString()} · float {formatPrice(active.openingFloat)}
              </p>
            </div>
            <Button type="button" variant="outline" size="sm" onClick={() => setReportShift(active)}>
              <ClipboardList className="h-4 w-4" /> X-report
            </Button>
          </div>
        </div>
      )}

      {shifts.length === 0 ? (
        <EmptyState
          Icon={LockKeyhole}
          title="No shifts yet"
          description="Open a shift to start tracking the cash drawer. At close you'll get a Z-report with expected vs counted cash."
          action={
            <div className="flex flex-wrap items-center justify-center gap-2">
              <Button type="button" onClick={() => setOpenSheet(true)}>Open the first shift</Button>
              <Button type="button" variant="outline" onClick={() => { seedExampleShift(); reload() }}>
                Show me an example
              </Button>
            </div>
          }
        />
      ) : (
        <ul className="space-y-2">
          {shifts.map((s) => {
            const r = buildShiftReport(s)
            return (
              <li key={s.id}>
                <button
                  type="button"
                  onClick={() => setReportShift(s)}
                  className="flex w-full items-center justify-between gap-3 rounded-xl border border-border bg-card p-3 text-left transition-colors hover:bg-accent/40"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">
                      {s.cashier} · {s.location}
                    </p>
                    <p className="truncate text-[11px] text-muted-foreground">
                      {new Date(s.openedAt).toLocaleString()}
                      {s.closedAt ? ` → ${new Date(s.closedAt).toLocaleTimeString()}` : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold tabular-nums">{formatPrice(r.grossSales)}</span>
                    {s.status === "open" ? (
                      <StatusBadge tone="success">Open</StatusBadge>
                    ) : r.variance && Math.abs(r.variance) > 0.009 ? (
                      <StatusBadge tone={r.variance < 0 ? "danger" : "warning"}>
                        {r.variance < 0 ? "Short" : "Over"} {formatPrice(Math.abs(r.variance))}
                      </StatusBadge>
                    ) : (
                      <StatusBadge tone="neutral">Balanced</StatusBadge>
                    )}
                  </div>
                </button>
              </li>
            )
          })}
        </ul>
      )}

      {/* Open shift sheet */}
      <BottomSheet open={openSheet} onClose={() => setOpenSheet(false)} title="Open shift" description="Declare the cash you're starting with">
        <div className="flex flex-col gap-3 pb-3">
          <Field label="Cashier">
            <Input value={cashier} onChange={(e) => setCashier(e.target.value)} />
          </Field>
          <Field label="Location">
            <Input value={location} onChange={(e) => setLocation(e.target.value)} />
          </Field>
          <Field label="Opening cash float">
            <Input type="number" value={float} onChange={(e) => setFloat(e.target.value)} placeholder="0.00" min={0} />
          </Field>
          <Button type="button" onClick={doOpen}>Open shift</Button>
        </div>
      </BottomSheet>

      {/* Close shift sheet */}
      <BottomSheet open={closeSheet} onClose={() => setCloseSheet(false)} title="Close shift" description="Count the drawer and reconcile">
        {active && (
          <CloseShiftBody
            report={buildShiftReport(active)}
            counted={counted}
            onCounted={setCounted}
            onClose={doClose}
          />
        )}
      </BottomSheet>

      {/* X / Z report */}
      <BottomSheet
        open={!!reportShift}
        onClose={() => setReportShift(null)}
        title={reportShift?.status === "open" ? "X-report (snapshot)" : "Z-report"}
        description={reportShift ? `${reportShift.cashier} · ${reportShift.location}` : ""}
        maxHeightVh={86}
      >
        {reportShift && <ReportBody shift={reportShift} report={buildShiftReport(reportShift)} />}
      </BottomSheet>
    </PageShell>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      {children}
    </label>
  )
}

function CloseShiftBody({
  report,
  counted,
  onCounted,
  onClose,
}: {
  report: ShiftReport
  counted: string
  onCounted: (v: string) => void
  onClose: () => void
}) {
  const { formatPrice } = useCurrency()
  const variance = (Number(counted) || 0) - report.expectedCash
  return (
    <div className="flex flex-col gap-3 pb-3">
      <Row label="Expected cash in drawer" value={formatPrice(report.expectedCash)} strong />
      <Field label="Counted cash">
        <Input type="number" value={counted} onChange={(e) => onCounted(e.target.value)} placeholder="0.00" min={0} autoFocus />
      </Field>
      {counted !== "" && (
        <div className={`rounded-lg p-2.5 text-sm font-semibold ${Math.abs(variance) < 0.01 ? "bg-muted text-muted-foreground" : variance < 0 ? "bg-rose-500/10 text-rose-600 dark:text-rose-400" : "bg-amber-500/10 text-amber-700 dark:text-amber-300"}`}>
          {Math.abs(variance) < 0.01 ? "Balanced" : variance < 0 ? `Short ${formatPrice(Math.abs(variance))}` : `Over ${formatPrice(variance)}`}
        </div>
      )}
      <Button type="button" onClick={onClose}>Close shift</Button>
    </div>
  )
}

function ReportBody({ shift, report }: { shift: Shift; report: ShiftReport }) {
  const { formatPrice } = useCurrency()
  return (
    <div className="flex flex-col gap-2 pb-3">
      <Row label="Sales" value={`${report.saleCount}`} />
      <Row label="Gross sales" value={formatPrice(report.grossSales)} strong />
      {Object.entries(report.byTender).map(([m, amt]) => (
        <Row key={m} label={`  ${m}`} value={formatPrice(amt)} muted />
      ))}
      <Row label="Tips" value={formatPrice(report.tips)} muted />
      <Row label="Refunds" value={`−${formatPrice(report.refunds)}`} muted />
      <div className="my-1 border-t border-border" />
      <Row label="Opening float" value={formatPrice(shift.openingFloat)} muted />
      <Row label="Expected cash" value={formatPrice(report.expectedCash)} strong />
      {shift.status === "closed" && shift.declaredClose != null && (
        <>
          <Row label="Counted cash" value={formatPrice(shift.declaredClose)} />
          <Row
            label="Variance"
            value={`${(report.variance ?? 0) < 0 ? "−" : ""}${formatPrice(Math.abs(report.variance ?? 0))}`}
            strong
          />
        </>
      )}
    </div>
  )
}

function Row({ label, value, strong, muted }: { label: string; value: string; strong?: boolean; muted?: boolean }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className={muted ? "text-muted-foreground" : strong ? "font-semibold" : ""}>{label}</span>
      <span className={`tabular-nums ${strong ? "font-bold" : ""}`}>{value}</span>
    </div>
  )
}
