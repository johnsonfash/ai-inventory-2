"use client"
import { PageShell } from "@/src/components/page-shell"
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/src/components/ui/card"
import { Label } from "@/src/components/ui/label"
import { Input } from "@/src/components/ui/input"
import { Button } from "@/src/components/ui/button"

export default function PayPalConfig() {
  return (
    <PageShell title="Integrations — PayPal" withToolbar={false}>
      <Card>
        <CardHeader>
          <CardTitle>PayPal Configuration</CardTitle>
          <CardDescription>Connect PayPal payments</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:max-w-xl">
          <div className="grid gap-2">
            <Label>Client ID</Label>
            <Input placeholder="AQE..." />
          </div>
          <div className="grid gap-2">
            <Label>Client Secret</Label>
            <Input placeholder="EJ8..." />
          </div>
          <div className="grid gap-2">
            <Label>Webhook ID</Label>
            <Input placeholder="WH-..." />
          </div>
          <Button className="w-fit">Save</Button>
        </CardContent>
      </Card>
    </PageShell>
  )
}
