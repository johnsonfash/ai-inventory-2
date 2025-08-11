"use client"
import { PageShell } from "@/src/components/page-shell"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/src/components/ui/card"
import { Label } from "@/src/components/ui/label"
import { Input } from "@/src/components/ui/input"
import { Button } from "@/src/components/ui/button"

export default function NewReceipt() {
  return (
    <PageShell title="Purchases — New Receipt" withToolbar={false}>
      <Card>
        <CardHeader>
          <CardTitle>Create Purchase Receipt</CardTitle>
          <CardDescription>Record delivered items</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="grid gap-2">
              <Label>PO</Label>
              <Input placeholder="PO-1045" />
            </div>
            <div className="grid gap-2">
              <Label>SKU</Label>
              <Input placeholder="EL-2109" />
            </div>
            <div className="grid gap-2">
              <Label>Qty</Label>
              <Input type="number" defaultValue={20} />
            </div>
          </div>
          <Button className="bg-violet-600 hover:bg-violet-600/90 w-fit">Create Receipt</Button>
        </CardContent>
      </Card>
    </PageShell>
  )
}
