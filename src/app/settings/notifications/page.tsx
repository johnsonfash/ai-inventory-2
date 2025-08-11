"use client"

import { PageShell } from "@/components/page-shell"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

export default function NotificationSettings() {
  return (
    <PageShell title="Settings — Notification Settings" withToolbar={false}>
      <Card>
        <CardHeader>
          <CardTitle>Notification Settings</CardTitle>
          <CardDescription>Choose which alerts you receive and where.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:max-w-xl">
          <div className="flex items-center justify-between">
            <Label>Email alerts</Label>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <Label>SMS alerts</Label>
            <Switch />
          </div>
          <div className="flex items-center justify-between">
            <Label>Low stock notifications</Label>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <Label>Payment issues</Label>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>
    </PageShell>
  )
}
