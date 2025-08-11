"use client"

import { PageShell } from "@/src/components/page-shell"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/src/components/ui/card"
import { Label } from "@/src/components/ui/label"
import { Input } from "@/src/components/ui/input"
import { Button } from "@/src/components/ui/button"

export default function NewPaymentAccount() {
  return (
    <PageShell title="Payments — New Account" withToolbar={false}>
      <Card>
        <CardHeader>
          <CardTitle>Create Virtual Account</CardTitle>
          <CardDescription>Assign to a location and cashier</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:max-w-xl">
          <div className="grid gap-2">
            <Label>Location</Label>
            <Input placeholder="Main Store" />
          </div>
          <div className="grid gap-2">
            <Label>Cashier</Label>
            <Input placeholder="John Doe" />
          </div>
          <div className="grid gap-2">
            <Label>Bank</Label>
            <Input placeholder="Acme Bank" />
          </div>
          <div className="grid gap-2">
            <Label>Account Number</Label>
            <Input placeholder="Generated on save" />
          </div>
          <Button className="w-fit">Create</Button>
        </CardContent>
      </Card>
    </PageShell>
  )
}
