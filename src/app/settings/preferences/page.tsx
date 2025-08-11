"use client"

import { PageShell } from "@/components/page-shell"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"

export default function Preferences() {
  return (
    <PageShell title="Settings — Preferences" withToolbar={false}>
      <Card>
        <CardHeader>
          <CardTitle>Preferences</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6 sm:grid-cols-2">
          <div className="flex items-center justify-between rounded-lg border p-3">
            <Label htmlFor="low-stock">Low stock email alerts</Label>
            <Switch id="low-stock" defaultChecked />
          </div>
          <div className="rounded-lg border p-3">
            <Label htmlFor="currency">Default currency</Label>
            <Input id="currency" className="mt-2" defaultValue="USD" />
          </div>
        </CardContent>
      </Card>
    </PageShell>
  )
}
