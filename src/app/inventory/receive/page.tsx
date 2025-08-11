"use client"

import { PageShell } from "@/src/components/page-shell"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/src/components/ui/card"
import { Label } from "@/src/components/ui/label"
import { Input } from "@/src/components/ui/input"
import { Button } from "@/src/components/ui/button"

export default function ReceiveStockPage() {
  return (
    <PageShell title="Inventory — Receive Stock" withToolbar={false}>
      <Card>
        <CardHeader>
          <CardTitle>Receive Stock</CardTitle>
          <CardDescription>Increase on-hand quantities</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label>SKU</Label>
            <Input placeholder="EL-2109" />
          </div>
          <div className="grid gap-2">
            <Label>Quantity</Label>
            <Input type="number" defaultValue={20} />
          </div>
          <div className="grid gap-2">
            <Label>Reference</Label>
            <Input placeholder="PO-1043" />
          </div>
          <div className="col-span-2">
            <Button className="bg-violet-600 hover:bg-violet-600/90">Receive</Button>
          </div>
        </CardContent>
      </Card>
    </PageShell>
  )
}
