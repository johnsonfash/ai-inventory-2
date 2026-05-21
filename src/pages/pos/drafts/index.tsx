import * as React from "react"
import { useNavigate } from "react-router-dom"
import { Layers, Play, Search, Trash2 } from "lucide-react"
import { PageShell } from "@/components/page-shell"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useIsMobile } from "@/hooks/use-mobile"
import { useRegisterPageRefresh } from "@/hooks/use-pull-to-refresh"
import { EmptyState } from "@/components/lists/empty-state"
import { StatusBadge } from "@/components/lists/status-badge"
import { SummaryStrip } from "@/components/lists/summary-strip"
import { SwipeableRow } from "@/components/mobile/swipeable-row"
import { OnboardingNudge } from "@/components/onboarding/onboarding-nudge"
import { deleteDraft, listDrafts, type Draft } from "@/lib/pos/storage"
import { useCurrency } from "@/contexts/currency"

function relTime(ms: number) {
  const diff = Date.now() - ms
  const m = Math.floor(diff / 60_000)
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

export default function DraftsPage() {
  const navigate = useNavigate()
  const isMobile = useIsMobile()
  const [drafts, setDrafts] = React.useState<Draft[]>(() => listDrafts())
  const [query, setQuery] = React.useState("")
  const { formatPrice } = useCurrency()

  useRegisterPageRefresh(
    React.useCallback(async () => {
      setDrafts(listDrafts())
      await new Promise((r) => setTimeout(r, 200))
    }, []),
  )

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return drafts
    return drafts.filter(
      (d) => (d.note ?? "").toLowerCase().includes(q) || (d.customer?.name ?? "").toLowerCase().includes(q),
    )
  }, [drafts, query])

  const del = (id: string) => {
    deleteDraft(id)
    setDrafts(listDrafts())
  }
  const restore = (id: string) => navigate(`/pos?draftId=${id}`)

  const totalItems = drafts.reduce((s, d) => s + d.items.reduce((ss, i) => ss + i.qty, 0), 0)
  const totalValue = drafts.reduce((s, d) => s + d.items.reduce((ss, i) => ss + i.qty * i.price, 0), 0)

  return (
    <PageShell
      title="POS drafts"
      withToolbar={false}
      titleTooltip={
        <>
          Carts you've parked mid-sale — the customer left to grab one
          more item, the queue grew, or you swapped registers. Pallio
          holds the items + the price on the draft so you can pick it
          up exactly where you stopped.
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <OnboardingNudge stepKey="first-sale" cta="Make first sale" />
        <SummaryStrip
          tiles={[
            { label: "Drafts", value: String(drafts.length), tone: "brand", hint: "held" },
            { label: "Items queued", value: String(totalItems), tone: "info", hint: "across drafts" },
            { label: "Pending value", value: formatPrice(totalValue), tone: "warning", hint: "if all charged" },
            { label: "Oldest", value: drafts.length ? relTime(Math.min(...drafts.map((d) => d.createdAt))) : "—", tone: "neutral", hint: "since saved" },
          ]}
        />

        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search notes or customer…" className="pl-9" />
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            Icon={Layers}
            title={drafts.length === 0 ? "No held sales" : "No matches"}
            description={drafts.length === 0 ? "Tap 'Hold' on the POS cart to save a sale for later." : "Try a different search."}
            action={drafts.length === 0 ? <Button onClick={() => navigate("/pos")}>Open POS</Button> : undefined}
          />
        ) : isMobile ? (
          <ul className="space-y-2">
            {filtered.map((d) => {
              const value = d.items.reduce((s, i) => s + i.qty * i.price, 0)
              return (
                <li key={d.id}>
                  <SwipeableRow
                    rightActions={[
                      { label: "Restore", tone: "primary", icon: <Play className="h-4 w-4" />, onPress: () => restore(d.id) },
                      { label: "Delete", tone: "danger", icon: <Trash2 className="h-4 w-4" />, onPress: () => del(d.id) },
                    ]}
                  >
                    <button
                      type="button"
                      onClick={() => restore(d.id)}
                      className="flex w-full items-center gap-3 p-3 text-left"
                    >
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand dark:bg-primary/15 dark:text-primary">
                        <Layers className="h-4 w-4" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="truncate text-sm font-semibold">
                            {d.customer?.name || d.note || "Held sale"}
                          </p>
                          <p className="shrink-0 text-sm font-semibold tabular-nums">{formatPrice(value)}</p>
                        </div>
                        <p className="mt-0.5 text-[11px] text-muted-foreground">
                          {d.items.length} {d.items.length === 1 ? "item" : "items"} · {relTime(d.createdAt)}
                        </p>
                        {d.meta?.location && (
                          <div className="mt-1.5">
                            <StatusBadge tone="info">{d.meta.location}</StatusBadge>
                          </div>
                        )}
                      </div>
                    </button>
                  </SwipeableRow>
                </li>
              )
            })}
          </ul>
        ) : (
          <div className="overflow-hidden rounded-xl border border-border bg-card">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-3 py-2.5 font-medium">Held</th>
                  <th className="px-3 py-2.5 font-medium">Customer / Note</th>
                  <th className="px-3 py-2.5 font-medium">Location</th>
                  <th className="px-3 py-2.5 text-right font-medium">Items</th>
                  <th className="px-3 py-2.5 text-right font-medium">Value</th>
                  <th className="px-3 py-2.5 text-right font-medium" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((d) => {
                  const value = d.items.reduce((s, i) => s + i.qty * i.price, 0)
                  return (
                    <tr key={d.id} className="transition-colors hover:bg-accent/30">
                      <td className="px-3 py-2.5 text-muted-foreground">{relTime(d.createdAt)}</td>
                      <td className="px-3 py-2.5 font-medium">{d.customer?.name || d.note || "Held sale"}</td>
                      <td className="px-3 py-2.5">
                        {d.meta?.location ? <StatusBadge tone="info">{d.meta.location}</StatusBadge> : <span className="text-muted-foreground">—</span>}
                      </td>
                      <td className="px-3 py-2.5 text-right tabular-nums">{d.items.length}</td>
                      <td className="px-3 py-2.5 text-right tabular-nums">{formatPrice(value)}</td>
                      <td className="px-3 py-2.5 text-right">
                        <div className="inline-flex items-center gap-1">
                          <Button size="sm" onClick={() => restore(d.id)}>
                            <Play className="h-3.5 w-3.5" /> Restore
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => del(d.id)}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </PageShell>
  )
}
