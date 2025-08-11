"use client"
import { PageShell } from "@/components/page-shell"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"

export default function NewOrder() {
  return (
    <PageShell title="Sales — New Order" withToolbar={false}>
      <Card>
        <CardHeader>
          <CardTitle>Create Sales Order</CardTitle>
          <CardDescription>Capture order details</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="grid gap-2">
              <Label>Customer</Label>
              <Select defaultValue="nova">
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="nova">NovaApps</SelectItem>
                  <SelectItem value="bright">BrightLane</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Order No</Label>
              <Input placeholder="SO-7850" />
            </div>
            <div className="grid gap-2">
              <Label>Currency</Label>
              <Select defaultValue="USD">
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="grid gap-2">
              <Label>SKU</Label>
              <Input placeholder="EL-2109" />
            </div>
            <div className="grid gap-2">
              <Label>Qty</Label>
              <Input type="number" defaultValue={2} />
            </div>
            <div className="grid gap-2">
              <Label>Unit Price</Label>
              <Input type="number" defaultValue={25} />
            </div>
          </div>
          <Button className="bg-violet-600 hover:bg-violet-600/90 w-fit">Create Order</Button>
        </CardContent>
      </Card>
    </PageShell>
  )
}
