"use client"

import { PageShell } from "@/src/components/page-shell"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Switch } from "@/src/components/ui/switch"
import { Label } from "@/src/components/ui/label"
import { NotificationList } from "@/src/components/notification-list"

export default function Notifications() {
  return (
    <PageShell title="Notifications" withToolbar={false}>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Notification Settings</CardTitle>
            <CardDescription>Low stock, orders, purchases and system alerts</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            {[
              "Low stock alerts",
              "Order events",
              "Purchase order updates",
              "Billing reminders",
              "System announcements",
            ].map((l, i) => (
              <div key={i} className="flex items-center justify-between rounded-lg border p-3">
                <Label>{l}</Label>
                <Switch defaultChecked={i < 3} />
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Recent Notifications</CardTitle>
            <CardDescription>Latest alerts and updates</CardDescription>
          </CardHeader>
          <CardContent>
            <NotificationList />
          </CardContent>
        </Card>
      </div>
    </PageShell>
  )
}
