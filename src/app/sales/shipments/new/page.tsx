"use client"
import { PageShell } from "@/components/page-shell"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export default function NewShipment() {
  return (
    <PageShell title="Sales — New Shipment" withToolbar={false}>
      <Card>
        <CardHeader>
          <CardTitle>Create Shipment</CardTitle>
          <CardDescription>Carrier and tracking details</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="grid gap-2">
              <Label>Order No</Label>
              <Input placeholder="SO-7850" />
            </div>
            <div className="grid gap-2">
              <Label>Carrier</Label>
              <Input placeholder="UPS" />
            </div>
            <div className="grid gap-2">
              <Label>Tracking</Label>
              <Input placeholder="1Z..." />
            </div>
          </div>
          <Button className="bg-violet-600 hover:bg-violet-600/90 w-fit">Create Shipment</Button>
        </CardContent>
      </Card>
    </PageShell>
  )
}
