import * as React from "react"
import { CalendarDays, ChevronLeft, ChevronRight, Clock, MapPin, Plus, User } from "lucide-react"
import { PageShell } from "@/components/page-shell"
import { Button } from "@/components/ui/button"
import { useRegisterPageRefresh } from "@/hooks/use-pull-to-refresh"
import { EmptyState } from "@/components/lists/empty-state"
import { StatusBadge, type StatusTone } from "@/components/lists/status-badge"
import { cn } from "@/lib/utils"

type Appt = {
  id: string
  title: string
  customer: string
  date: string // YYYY-MM-DD
  start: string
  end: string
  staff: string
  location: string
  type: "consult" | "service" | "installation" | "follow-up"
  status: "scheduled" | "confirmed" | "cancelled"
}

const todayISO = new Date().toISOString().slice(0, 10)
const addDays = (n: number) => {
  const d = new Date()
  d.setDate(d.getDate() + n)
  return d.toISOString().slice(0, 10)
}

const appointments: Appt[] = [
  { id: "A-1042", title: "Pickup — bulk order", customer: "Acme Co", date: todayISO, start: "09:30", end: "10:00", staff: "Mia Chen", location: "WH-A loading bay", type: "service", status: "confirmed" },
  { id: "A-1043", title: "Inventory consult", customer: "NovaApps", date: todayISO, start: "11:00", end: "11:45", staff: "Alex Larson", location: "Conference room", type: "consult", status: "scheduled" },
  { id: "A-1044", title: "POS install", customer: "BrightLane", date: todayISO, start: "14:30", end: "16:00", staff: "Priya Patel", location: "On-site", type: "installation", status: "confirmed" },
  { id: "A-1045", title: "Quarterly review", customer: "Linda M.", date: addDays(1), start: "10:00", end: "10:30", staff: "Mia Chen", location: "Virtual · Zoom", type: "consult", status: "scheduled" },
  { id: "A-1046", title: "Damaged item follow-up", customer: "Zenith Ltd", date: addDays(2), start: "13:00", end: "13:30", staff: "Daniel Kim", location: "WH-B", type: "follow-up", status: "scheduled" },
  { id: "A-1047", title: "Pickup", customer: "Walk-in", date: addDays(3), start: "09:00", end: "09:30", staff: "Mia Chen", location: "Storefront", type: "service", status: "cancelled" },
]

const typeTone: Record<Appt["type"], StatusTone> = {
  consult: "info",
  service: "brand",
  installation: "warning",
  "follow-up": "neutral",
}
const statusTone: Record<Appt["status"], StatusTone> = {
  scheduled: "warning",
  confirmed: "success",
  cancelled: "danger",
}

function buildMonth(ref: Date) {
  const first = new Date(ref.getFullYear(), ref.getMonth(), 1)
  const start = new Date(first)
  start.setDate(first.getDate() - ((first.getDay() + 6) % 7)) // start on Monday
  return Array.from({ length: 42 }).map((_, i) => {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    return d
  })
}

export default function Appointments() {
  const [refDate, setRefDate] = React.useState(new Date())
  const [selected, setSelected] = React.useState(todayISO)

  useRegisterPageRefresh(React.useCallback(async () => { await new Promise((r) => setTimeout(r, 400)) }, []))

  const days = buildMonth(refDate)
  const monthLabel = refDate.toLocaleString(undefined, { month: "long", year: "numeric" })
  const sameMonth = (d: Date) => d.getMonth() === refDate.getMonth()
  const isoOf = (d: Date) => d.toISOString().slice(0, 10)

  const countsByDay = React.useMemo(() => {
    const m = new Map<string, number>()
    for (const a of appointments) m.set(a.date, (m.get(a.date) ?? 0) + 1)
    return m
  }, [])

  const dayItems = appointments.filter((a) => a.date === selected).sort((a, b) => a.start.localeCompare(b.start))
  const upcoming = appointments
    .filter((a) => a.date >= todayISO && a.status !== "cancelled")
    .sort((a, b) => `${a.date}T${a.start}`.localeCompare(`${b.date}T${b.start}`))
    .slice(0, 5)

  return (
    <PageShell title="Appointments" withToolbar>
      <div className="flex flex-col gap-4">
        {/* Header strip */}
        <div className="flex items-end justify-between gap-2">
          <div className="min-w-0">
            <h2 className="text-lg font-bold tracking-tight md:text-xl">Schedule</h2>
            <p className="mt-0.5 text-sm text-muted-foreground">{appointments.length} appointments on the calendar</p>
          </div>
          <Button className="hidden md:inline-flex"><Plus className="h-4 w-4" /> New appointment</Button>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
          {/* Calendar */}
          <div className="rounded-2xl border border-border bg-card p-4">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-base font-semibold">{monthLabel}</p>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setRefDate(new Date(refDate.getFullYear(), refDate.getMonth() - 1, 1))}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground"
                  aria-label="Previous month"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setRefDate(new Date())}
                  className="inline-flex h-8 items-center rounded-md px-3 text-xs font-medium text-muted-foreground hover:bg-accent hover:text-foreground"
                >
                  Today
                </button>
                <button
                  type="button"
                  onClick={() => setRefDate(new Date(refDate.getFullYear(), refDate.getMonth() + 1, 1))}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground"
                  aria-label="Next month"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center">
              {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
                <span key={i} className="py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {d}
                </span>
              ))}
              {days.map((d) => {
                const iso = isoOf(d)
                const inMonth = sameMonth(d)
                const isToday = iso === todayISO
                const isSelected = iso === selected
                const n = countsByDay.get(iso) ?? 0
                return (
                  <button
                    type="button"
                    key={iso}
                    onClick={() => setSelected(iso)}
                    className={cn(
                      "relative flex aspect-square min-h-9 flex-col items-center justify-center rounded-lg text-xs transition-colors",
                      !inMonth && "text-muted-foreground/40",
                      isSelected && "bg-brand text-brand-foreground dark:bg-primary dark:text-primary-foreground",
                      !isSelected && isToday && "ring-1 ring-inset ring-brand dark:ring-primary",
                      !isSelected && "hover:bg-accent",
                    )}
                  >
                    <span className={cn(isSelected ? "font-bold" : isToday ? "font-semibold" : "")}>{d.getDate()}</span>
                    {n > 0 && (
                      <span className={cn("mt-0.5 h-1 w-1 rounded-full", isSelected ? "bg-white" : "bg-brand dark:bg-primary")} />
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Selected day list */}
          <div className="flex flex-col gap-3">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              {new Date(selected).toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}
            </p>
            {dayItems.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border bg-muted/30 p-6 text-center">
                <CalendarDays className="mx-auto h-8 w-8 text-muted-foreground" />
                <p className="mt-2 text-sm font-medium">No appointments</p>
                <p className="mt-0.5 text-xs text-muted-foreground">Tap "New appointment" to add one.</p>
              </div>
            ) : (
              <ul className="space-y-2">
                {dayItems.map((a) => (
                  <li key={a.id} className="rounded-2xl border border-border bg-card p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold">{a.title}</p>
                        <p className="truncate text-[11px] text-muted-foreground">
                          {a.customer}
                        </p>
                      </div>
                      <StatusBadge tone={statusTone[a.status]}>{a.status}</StatusBadge>
                    </div>
                    <div className="mt-2 grid grid-cols-1 gap-1 text-[11px] text-muted-foreground sm:grid-cols-2">
                      <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" /> {a.start} – {a.end}</span>
                      <span className="inline-flex items-center gap-1"><User className="h-3 w-3" /> {a.staff}</span>
                      <span className="inline-flex items-center gap-1 sm:col-span-2"><MapPin className="h-3 w-3" /> {a.location}</span>
                    </div>
                    <div className="mt-2">
                      <StatusBadge tone={typeTone[a.type]}>{a.type}</StatusBadge>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Upcoming */}
        <section className="flex flex-col gap-3">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Upcoming</p>
          {upcoming.length === 0 ? (
            <EmptyState Icon={CalendarDays} title="Nothing scheduled" description="Add an appointment to see it here." size="sm" />
          ) : (
            <ul className="space-y-2">
              {upcoming.map((a) => (
                <li key={a.id} className="flex items-center gap-3 rounded-xl border border-border bg-card p-3">
                  <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-lg bg-brand-soft text-brand dark:bg-primary/15 dark:text-primary">
                    <span className="text-[10px] uppercase">
                      {new Date(a.date).toLocaleString(undefined, { month: "short" })}
                    </span>
                    <span className="text-base font-bold leading-tight">{new Date(a.date).getDate()}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-sm font-semibold">{a.title}</p>
                      <StatusBadge tone={statusTone[a.status]}>{a.status}</StatusBadge>
                    </div>
                    <p className="truncate text-[11px] text-muted-foreground">
                      {a.customer} · {a.start} · {a.staff}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </PageShell>
  )
}
