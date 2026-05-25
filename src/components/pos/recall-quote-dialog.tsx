import * as React from "react"
import { FileText, Search } from "lucide-react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { ORDERS, getOrder } from "@/lib/sales/data"
import type { Order } from "@/lib/sales/types"
import { useCurrency } from "@/contexts/currency"

// Pull an existing sales quote/order into the POS cart so the cashier can
// ring it up. Only orders not yet fully closed are recallable. POS-2.
const RECALLABLE: Order["status"][] = ["draft", "sent", "accepted", "invoiced"]

export function RecallQuoteDialog({
  open,
  onClose,
  onRecall,
}: {
  open: boolean
  onClose: () => void
  onRecall: (order: Order) => void
}) {
  const { formatPrice } = useCurrency()
  const [q, setQ] = React.useState("")

  React.useEffect(() => {
    if (open) setQ("")
  }, [open])

  const list = React.useMemo(() => {
    const s = q.trim().toLowerCase()
    return ORDERS.filter((o) => RECALLABLE.includes(o.status)).filter(
      (o) =>
        !s ||
        o.number.toLowerCase().includes(s) ||
        o.customer.name.toLowerCase().includes(s),
    )
  }, [q])

  const pick = (order: Order) => {
    onRecall(order)
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-soft text-brand dark:bg-primary/15 dark:text-primary">
            <FileText className="h-4 w-4" />
          </span>
          <div>
            <p className="text-base font-semibold">Recall a quote</p>
            <p className="text-[11px] text-muted-foreground">
              Load an existing quote or order into the cart to ring it up.
            </p>
          </div>
        </div>

        <form
          className="relative mt-4"
          onSubmit={(e) => {
            e.preventDefault()
            const exact = getOrder(q.trim())
            if (exact && RECALLABLE.includes(exact.status)) pick(exact)
          }}
        >
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Quote number or customer name"
            className="pl-9"
          />
        </form>

        <ul className="mt-3 max-h-72 divide-y divide-border overflow-y-auto rounded-xl border border-border">
          {list.length === 0 ? (
            <li className="p-4 text-center text-sm text-muted-foreground">No open quotes match.</li>
          ) : (
            list.map((o) => (
              <li key={o.id}>
                <button
                  type="button"
                  onClick={() => pick(o)}
                  className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-accent/40"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">
                      <span className="font-mono">{o.number}</span> · {o.customer.name}
                    </p>
                    <p className="truncate text-[11px] capitalize text-muted-foreground">
                      {o.status} · {o.lines.length} item{o.lines.length === 1 ? "" : "s"}
                    </p>
                  </div>
                  <span className="shrink-0 text-sm font-bold tabular-nums">{formatPrice(o.totalUsd)}</span>
                </button>
              </li>
            ))
          )}
        </ul>
      </DialogContent>
    </Dialog>
  )
}
