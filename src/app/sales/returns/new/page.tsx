"use client"
import { PageShell } from "@/src/components/page-shell"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Label } from "@/src/components/ui/label"
import { Input } from "@/src/components/ui/input"
import { Button } from "@/src/components/ui/button"

export default function NewReturn() {
  return (
    <PageShell title="Sales — New Return" withToolbar={false}>
      <Card>
        <CardHeader>
          <CardTitle>Create Sales Return</CardTitle>
          <CardDescription>RMA and disposition</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid grid-cols-4 gap-3">
            <div className="grid gap-2">
              <Label>RMA</Label>
              <Input placeholder="RT-121" />
            </div>
            <div className="grid gap-2">
              <Label>Order</Label>
              <Input placeholder="SO-7850" />
            </div>
            <div className="grid gap-2">
              <Label>SKU</Label>
              <Input placeholder="AP-4012" />
            </div>
            <div className="grid gap-2">
              <Label>Qty</Label>
              <Input type="number" defaultValue={1} />
            </div>
          </div>
          <Button className="bg-violet-600 hover:bg-violet-600/90 w-fit">Create Return</Button>
        </CardContent>
      </Card>
    </PageShell>
  )
}
