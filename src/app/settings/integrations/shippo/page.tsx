"use client"
import { PageShell } from "@/src/components/page-shell"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/src/components/ui/card"
import { Label } from "@/src/components/ui/label"
import { Input } from "@/src/components/ui/input"
import { Button } from "@/src/components/ui/button"
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
