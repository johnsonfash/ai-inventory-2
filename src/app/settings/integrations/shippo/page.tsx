"use client"
import { PageShell } from "@/components/page-shell"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
export default function ShippoConfig() {
  return (
    <PageShell title="Integrations — Shippo" withToolbar={false}>
      <Card>
        <CardHeader>
          <CardTitle>Shippo</CardTitle>
          <CardDescription>Shipping rates and labels</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:max-w-xl">
          <div className="grid gap-2">
            <Label>API Key</Label>
            <Input placeholder="shippo_live_..." />
          </div>
          <Button className="w-fit">Save</Button>
        </CardContent>
      </Card>
    </PageShell>
  )
}
