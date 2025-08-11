"use client"

import { PageShell } from "@/src/components/page-shell"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/src/components/ui/card"
import { Label } from "@/src/components/ui/label"
import { Input } from "@/src/components/ui/input"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/src/components/ui/select"
import { Button } from "@/src/components/ui/button"

export default function NewPO() {
  return (
    <PageShell title="Purchasing — New PO" withToolbar={false}>
      <Card>
        <CardHeader>
          <CardTitle>Create Purchase Order</CardTitle>
          <CardDescription>Send purchase orders to vendors</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label>Vendor</Label>
              <Select defaultValue="cobalt">
                <SelectTrigger>
                  <SelectValue placeholder="Select vendor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cobalt">Cobalt</SelectItem>
                  <SelectItem value="delta">Delta</SelectItem>
                  <SelectItem value="acme">Acme</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>PO Number</Label>
              <Input placeholder="PO-1045" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="grid gap-2">
              <Label>SKU</Label>
              <Input placeholder="EL-2109" />
            </div>
            <div className="grid gap-2">
              <Label>Qty</Label>
              <Input type="number" defaultValue={50} />
            </div>
            <div className="grid gap-2">
              <Label>Unit Cost</Label>
              <Input type="number" defaultValue={12.5} />
            </div>
          </div>
          <Button className="bg-violet-600 hover:bg-violet-600/90 w-fit">Create PO</Button>
        </CardContent>
      </Card>
    </PageShell>
  )
}
