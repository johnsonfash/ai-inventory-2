"use client"

import * as React from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { listInvoices, listDrafts, listReturns } from "@/lib/pos/storage"

export function RecentTransactionsDialog() {
  const [open, setOpen] = React.useState(false)
  const [tab, setTab] = React.useState<"invoices" | "drafts" | "returns">("invoices")

  const invoices = listInvoices().slice(0, 10)
  const drafts = listDrafts().slice(0, 10)
  const returns = listReturns().slice(0, 10)

  return (
    <>
      <Button variant="outline" className="bg-transparent" onClick={() => setOpen(true)}>
        Recent
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <div className="mb-2 flex items-center justify-between">
            <div className="text-base font-semibold">Recent Activity</div>
            <div className="flex gap-1">
              <button
                className={`rounded px-2 py-1 text-sm ${tab === "invoices" ? "bg-accent" : "hover:bg-accent/50"}`}
                onClick={() => setTab("invoices")}
              >
                Invoices
              </button>
              <button
                className={`rounded px-2 py-1 text-sm ${tab === "drafts" ? "bg-accent" : "hover:bg-accent/50"}`}
                onClick={() => setTab("drafts")}
              >
                Drafts
              </button>
              <button
                className={`rounded px-2 py-1 text-sm ${tab === "returns" ? "bg-accent" : "hover:bg-accent/50"}`}
                onClick={() => setTab("returns")}
              >
                Returns
              </button>
            </div>
          </div>
          <div className="max-h-[50vh] overflow-auto rounded border">
            {tab === "invoices" && (
              <ul className="divide-y">
                {invoices.length === 0 && <li className="p-3 text-sm text-muted-foreground">No invoices yet.</li>}
                {invoices.map((i) => (
                  <li key={i.id} className="flex items-center gap-3 p-3 text-sm">
                    <div className="font-mono">{i.number}</div>
                    <div className="ml-auto tabular-nums">${i.total.toFixed(2)}</div>
                  </li>
                ))}
              </ul>
            )}
            {tab === "drafts" && (
              <ul className="divide-y">
                {drafts.length === 0 && <li className="p-3 text-sm text-muted-foreground">No drafts yet.</li>}
                {drafts.map((d) => (
                  <li key={d.id} className="flex items-center gap-3 p-3 text-sm">
                    <div>{new Date(d.createdAt).toLocaleString()}</div>
                    <div className="ml-auto text-muted-foreground">{d.items.length} item(s)</div>
                  </li>
                ))}
              </ul>
            )}
            {tab === "returns" && (
              <ul className="divide-y">
                {returns.length === 0 && <li className="p-3 text-sm text-muted-foreground">No returns yet.</li>}
                {returns.map((r) => (
                  <li key={r.id} className="flex items-center gap-3 p-3 text-sm">
                    <div className="font-mono">{r.number}</div>
                    <div className="ml-auto tabular-nums">-${r.totalRefund.toFixed(2)}</div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
