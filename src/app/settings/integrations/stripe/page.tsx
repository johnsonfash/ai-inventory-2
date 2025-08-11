"use client"
import { PageShell } from "@/components/page-shell"
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export default function StripeConfig() {
  return (
    <PageShell title="Integrations — Stripe" withToolbar={false}>
      <Card>
        <CardHeader>
          <CardTitle>Stripe Configuration</CardTitle>
          <CardDescription>Connect Stripe to accept card payments</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:max-w-xl">
          <div className="grid gap-2">
            <Label>Publishable Key</Label>
            <Input placeholder="pk_live_..." />
          </div>
          <div className="grid gap-2">
            <Label>Secret Key</Label>
            <Input placeholder="sk_live_..." />
          </div>
          <div className="grid gap-2">
            <Label>Webhook Secret</Label>
            <Input placeholder="whsec_..." />
          </div>
          <Button className="w-fit">Save</Button>
        </CardContent>
      </Card>
    </PageShell>
  )
}
