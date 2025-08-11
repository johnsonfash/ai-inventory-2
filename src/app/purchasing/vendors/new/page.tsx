"use client"
import { PageShell } from "@/components/page-shell"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"

export default function NewVendor() {
  return (
    <PageShell title="Purchases — Add Vendor" withToolbar={false}>
      <Card>
        <CardHeader>
          <CardTitle>New Vendor</CardTitle>
          <CardDescription>Contact and payment details</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="grid gap-2">
              <Label>Name</Label>
              <Input placeholder="Cobalt" />
            </div>
            <div className="grid gap-2">
              <Label>Email</Label>
              <Input type="email" placeholder="sales@cobalt.com" />
            </div>
            <div className="grid gap-2">
              <Label>Phone</Label>
              <Input placeholder="+1 555 0100" />
            </div>
          </div>
          <div className="grid gap-2">
            <Label>Billing Address</Label>
            <Textarea placeholder="Street, City, State, ZIP, Country" />
          </div>
          <Button className="bg-violet-600 hover:bg-violet-600/90 w-fit">Create Vendor</Button>
        </CardContent>
      </Card>
    </PageShell>
  )
}
