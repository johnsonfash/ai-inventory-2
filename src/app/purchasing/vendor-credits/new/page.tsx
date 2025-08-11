"use client"
import { PageShell } from "@/src/components/page-shell"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/src/components/ui/card"
import { Label } from "@/src/components/ui/label"
import { Input } from "@/src/components/ui/input"
import { Button } from "@/src/components/ui/button"

export default function NewVendorCredit() {
  return (
    <PageShell title="Purchases — New Vendor Credit" withToolbar={false}>
      <Card>
        <CardHeader>
          <CardTitle>Create Vendor Credit</CardTitle>
          <CardDescription>Apply credits to vendor balance</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:max-w-xl">
          <div className="grid gap-2">
            <Label>Credit No</Label>
            <Input placeholder="VC-2002" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label>Vendor</Label>
              <Input placeholder="Cobalt" />
            </div>
            <div className="grid gap-2">
              <Label>Amount</Label>
              <Input type="number" placeholder="0.00" />
            </div>
          </div>
          <Button className="bg-violet-600 hover:bg-violet-600/90 w-fit">Create Credit</Button>
        </CardContent>
      </Card>
    </PageShell>
  )
}
