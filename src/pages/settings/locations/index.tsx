import * as React from "react"
import { Building2, ChevronRight, MapPin, Phone, Plus, Search } from "lucide-react"
import { PageShell } from "@/components/page-shell"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useRegisterPageRefresh } from "@/hooks/use-pull-to-refresh"
import { EmptyState } from "@/components/lists/empty-state"
import { StatusBadge, type StatusTone } from "@/components/lists/status-badge"
import { SummaryStrip } from "@/components/lists/summary-strip"
import { MobileFab } from "@/components/mobile/mobile-fab"
import { AddLocationDialog, type QuickLocation } from "@/components/dialogs/add-location-dialog"

type Row = {
  id: string
  name: string
  type: "storefront" | "warehouse" | "office" | "popup"
  address: string
  phone: string
  manager: string
  status: "active" | "paused" | "closed"
}

const SEED_LOCATIONS: Row[] = [
  { id: "L-1", name: "Downtown Austin", type: "storefront", address: "200 Congress Ave, Austin, TX", phone: "+1 512 555 0100", manager: "Mia Chen", status: "active" },
  { id: "L-2", name: "East DC", type: "warehouse", address: "44 Industrial Way, Atlanta, GA", phone: "+1 404 555 0101", manager: "Alex Larson", status: "active" },
  { id: "L-3", name: "West Hub", type: "warehouse", address: "1212 Riverside, Portland, OR", phone: "+1 503 555 0102", manager: "Priya Patel", status: "active" },
  { id: "L-4", name: "HQ — Operations", type: "office", address: "100 Congress Ave, Austin, TX", phone: "+1 512 555 0103", manager: "Daniel Kim", status: "active" },
  { id: "L-5", name: "SXSW Popup", type: "popup", address: "Convention Center, Austin, TX", phone: "—", manager: "Mia Chen", status: "closed" },
]

const typeTone: Record<Row["type"], StatusTone> = {
  storefront: "brand",
  warehouse: "info",
  office: "neutral",
  popup: "fuchsia" as StatusTone,
}
const statusTone: Record<Row["status"], StatusTone> = { active: "success", paused: "warning", closed: "neutral" }

export default function Locations() {
  const [query, setQuery] = React.useState("")
  const [rows, setRows] = React.useState<Row[]>(SEED_LOCATIONS)
  const [addOpen, setAddOpen] = React.useState(false)
  useRegisterPageRefresh(React.useCallback(async () => { await new Promise((r) => setTimeout(r, 400)) }, []))

  const handleCreate = (l: QuickLocation) => {
    setRows((prev) => [{ id: `L-${Date.now().toString().slice(-5)}`, status: "active", ...l }, ...prev])
  }

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return rows
    return rows.filter(
      (r) => r.name.toLowerCase().includes(q) || r.address.toLowerCase().includes(q) || r.manager.toLowerCase().includes(q),
    )
  }, [query, rows])

  const active = rows.filter((r) => r.status === "active").length
  const storefronts = rows.filter((r) => r.type === "storefront").length
  const warehouses = rows.filter((r) => r.type === "warehouse").length

  return (
    <PageShell
      title="Locations"
      withToolbar={false}
      titleTooltip={
        <>
          Public-facing business addresses — what customers see on
          your storefront's "Find us" page, on invoices, and in
          delivery zones. Distinct from <strong>Warehouses</strong>,
          which is the internal stock view.
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <SummaryStrip
          tiles={[
            { label: "Locations", value: String(rows.length), tone: "brand", hint: "configured" },
            { label: "Active", value: String(active), tone: "success", hint: "operating" },
            { label: "Storefronts", value: String(storefronts), tone: "warning", hint: "retail" },
            { label: "Warehouses", value: String(warehouses), tone: "info", hint: "stock points" },
          ]}
        />

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-[180px] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by name, city, or manager…" className="pl-9" />
          </div>
          <Button className="hidden md:inline-flex" onClick={() => setAddOpen(true)}><Plus className="h-4 w-4" /> Add location</Button>
        </div>

        {filtered.length === 0 ? (
          <Card><CardContent className="p-0">
            <EmptyState
              Icon={Building2}
              title={query ? "No locations match" : "No locations yet"}
              description={query ? "Try a different name or city." : "Add a storefront, warehouse, office, or pop-up."}
              action={!query ? <Button onClick={() => setAddOpen(true)}><Plus className="h-4 w-4" /> Add location</Button> : undefined}
            />
          </CardContent></Card>
        ) : (
          <ul className="space-y-2">
            {filtered.map((r) => (
              <li key={r.id} className="flex items-start gap-3 rounded-2xl border border-border bg-card p-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand dark:bg-primary/15 dark:text-primary">
                  <MapPin className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-semibold">{r.name}</p>
                    <div className="flex items-center gap-1.5">
                      <StatusBadge tone={typeTone[r.type]}>{r.type}</StatusBadge>
                      <StatusBadge tone={statusTone[r.status]}>{r.status}</StatusBadge>
                    </div>
                  </div>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">{r.address}</p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground inline-flex items-center gap-2">
                    <Phone className="h-3 w-3" /> {r.phone} · Manager: {r.manager}
                  </p>
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
              </li>
            ))}
          </ul>
        )}
      </div>

      <MobileFab onClick={() => setAddOpen(true)} label="Add location" />
      <AddLocationDialog open={addOpen} onClose={() => setAddOpen(false)} onCreate={handleCreate} />
    </PageShell>
  )
}
