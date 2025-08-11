"use client"

import * as React from "react"
import { PageShell } from "@/components/page-shell"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function LabelPrint() {
  const [sku, setSku] = React.useState("EL-2109")
  const [qty, setQty] = React.useState(6)

  return (
    <PageShell title="Inventory — Label Print" withToolbar={false}>
      <Card>
        <CardHeader>
          <CardTitle>Print Labels</CardTitle>
          <CardDescription>Generate barcode/QR labels for shelves and items</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="grid gap-2">
              <Label>SKU</Label>
              <Input value={sku} onChange={(e) => setSku(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label>Quantity</Label>
              <Input type="number" value={qty} onChange={(e) => setQty(Number(e.target.value))} />
            </div>
            <div className="flex items-end">
              <Button onClick={() => window.print()} className="bg-violet-600 hover:bg-violet-600/90">
                Print
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 print:block">
            {Array.from({ length: qty }).map((_, i) => (
              <div key={i} className="rounded border p-3 text-center">
                <div className="font-mono text-sm">{sku}</div>
                <div className="mt-2 text-xs text-muted-foreground">{"|| | | || ||| | |"}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </PageShell>
  )
}
