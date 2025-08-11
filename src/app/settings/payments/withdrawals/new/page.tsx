"use client"

import { PageShell } from "@/components/page-shell"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export default function NewWithdrawal() {
  return (
    <PageShell title="Payments — New Withdrawal" withToolbar={false}>
      <Card>
        <CardHeader>
          <CardTitle>Request Withdrawal</CardTitle>
          <CardDescription>Select source account and amount</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:max-w-xl">
          <div className="grid gap-2">
            <Label>Source Account</Label>
            <Input placeholder="VA-001" />
          </div>
          <div className="grid gap-2">
            <Label>Amount ($)</Label>
            <Input type="number" placeholder="100.00" />
          </div>
          <div className="grid gap-2">
            <Label>Destination Bank</Label>
            <Input placeholder="Acme Bank • **** 1023" />
          </div>
          <Button className="w-fit">Submit</Button>
        </CardContent>
      </Card>
    </PageShell>
  )
}
