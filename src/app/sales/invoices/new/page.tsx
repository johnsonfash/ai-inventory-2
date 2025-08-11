"use client"
import { PageShell } from "@/src/components/page-shell"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Label } from "@/src/components/ui/label"
import { Input } from "@/src/components/ui/input"
import { Button } from "@/src/components/ui/button"

export default function NewInvoice() {
  return (
    <PageShell title="Sales — New Invoice" withToolbar={false}>
      <Card>
        <CardHeader>
          <CardTitle>Create Invoice</CardTitle>
          <CardDescription>Bill your customer</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="grid gap-2">
              <Label>Invoice No</Label>
              <Input placeholder="INV-3310" />
            </div>
            <div className="grid gap-2">
              <Label>Order No</Label>
              <Input placeholder="SO-7850" />
            </div>
            <div className="grid gap-2">
              <Label>Amount</Label>
              <Input type="number" placeholder="0.00" />
            </div>
          </div>
          <Button className="bg-violet-600 hover:bg-violet-600/90 w-fit">Create Invoice</Button>
        </CardContent>
      </Card>
    </PageShell>
  )
}
