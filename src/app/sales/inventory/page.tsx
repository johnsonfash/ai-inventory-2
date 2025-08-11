"use client"

import { PageShell } from "@/src/components/page-shell"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/src/components/ui/card"
import { loadCatalog } from "@/src/lib/pos/storage"
import { useMemo, useState } from "react"
import { Input } from "@/src/components/ui/input"

export default function SalesInventoryPage() {
  const [mode, setMode] = useState<"retail" | "restaurant" | "services" | "auto">("retail")
  const [q, setQ] = useState("")
  const catalog = useMemo(() => loadCatalog(mode), [mode])
  const filtered = catalog.filter(
    (c) =>
      c.name.toLowerCase().includes(q.toLowerCase()) ||
      c.sku.toLowerCase().includes(q.toLowerCase()) ||
      (c.category || "").toLowerCase().includes(q.toLowerCase()),
  )

  return (
    <PageShell title="Sales — Live Inventory" withToolbar>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Inventory</CardTitle>
          <CardDescription>Real-time stock overview for sales</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <label className="text-sm">
              <span className="mr-2 text-muted-foreground">Mode</span>
              <select
                className="h-9 rounded-md border bg-background px-2 text-sm"
                value={mode}
                onChange={(e) => setMode(e.target.value as any)}
              >
                <option value="retail">Retail</option>
                <option value="restaurant">Restaurant</option>
                <option value="services">Services</option>
                <option value="auto">Auto</option>
              </select>
            </label>
            <Input
              placeholder="Search name/SKU/category"
              className="w-72"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((c) => (
              <div key={c.sku} className="rounded-lg border p-3">
                <div className="text-sm font-medium">{c.name}</div>
                <div className="text-xs text-muted-foreground">{c.sku}</div>
                <div className="mt-2 flex items-center justify-between text-sm">
                  <span>Price</span>
                  <span className="tabular-nums">${c.price.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Stock</span>
                  <span className="tabular-nums">{c.stock ?? "-"}</span>
                </div>
              </div>
            ))}
            {filtered.length === 0 && <div className="text-sm text-muted-foreground">No items.</div>}
          </div>
        </CardContent>
      </Card>
    </PageShell>
  )
}
