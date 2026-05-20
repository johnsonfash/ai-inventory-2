import { Link } from "react-router-dom"
import { ArrowRight, FileText, Truck } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { cn } from "@/lib/utils"

type PO = {
  id: string
  vendor: string
  due: string
  total: number
  status: "draft" | "pending" | "partial" | "received"
}

const pos: PO[] = [
  { id: "PO-1042", vendor: "Cobalt Distributors", due: "in 2 days", total: 4820, status: "pending" },
  { id: "PO-1041", vendor: "Glow Co", due: "today", total: 1240, status: "partial" },
  { id: "PO-1040", vendor: "Acme Supplies", due: "in 5 days", total: 920, status: "pending" },
  { id: "PO-1039", vendor: "Porcel Ceramics", due: "overdue", total: 2110, status: "draft" },
]

const statusUI = {
  draft: "bg-muted text-muted-foreground",
  pending: "bg-amber-500/10 text-amber-700 dark:text-amber-300 ring-1 ring-inset ring-amber-500/20",
  partial: "bg-sky-500/10 text-sky-700 dark:text-sky-300 ring-1 ring-inset ring-sky-500/20",
  received: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 ring-1 ring-inset ring-emerald-500/20",
} as const

export function OpenPosCard() {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-50 text-sky-600 dark:bg-sky-500/10 dark:text-sky-300">
            <Truck className="h-4 w-4" />
          </span>
          <div className="min-w-0 flex-1">
            <CardTitle className="text-base">Open purchase orders</CardTitle>
            <CardDescription>Awaiting receipt or partially fulfilled</CardDescription>
          </div>
          <Link
            to="/purchasing/pos"
            className="hidden text-xs text-muted-foreground hover:text-foreground sm:inline-flex items-center gap-1"
          >
            All POs <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <ul className="space-y-2">
          {pos.map((p) => (
            <li key={p.id}>
              <Link
                to={`/purchasing/pos`}
                className="flex items-center gap-3 rounded-xl border border-border bg-card p-3 transition-colors hover:bg-accent/40"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                  <FileText className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-medium">{p.vendor}</p>
                    <p className="shrink-0 text-sm font-semibold tabular-nums">${p.total.toLocaleString()}</p>
                  </div>
                  <div className="mt-0.5 flex items-center justify-between gap-2 text-[11px] text-muted-foreground">
                    <span className="truncate font-mono">{p.id}</span>
                    <div className="flex items-center gap-1.5">
                      <span className={cn("rounded-full px-1.5 py-0.5 text-[10px] font-medium capitalize", statusUI[p.status])}>
                        {p.status}
                      </span>
                      <span className={cn(p.due === "overdue" && "text-rose-600 dark:text-rose-400 font-medium")}>{p.due}</span>
                    </div>
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}
