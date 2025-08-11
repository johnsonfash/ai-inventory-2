"use client"
import { PageShell } from "@/components/page-shell"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"

const activities = [
  { msg: "User A. Larson created Purchase Order PO-1045", at: "2025-08-07 10:24" },
  { msg: "Stock received: 20 x EL-2109 to WH-A", at: "2025-08-07 11:10" },
  { msg: "Sales Order SO-7850 fulfilled", at: "2025-08-07 13:50" },
]

export default function ActivityLog() {
  return (
    <PageShell title="Reporting — Activity Log" withToolbar={false}>
      <Card>
        <CardHeader>
          <CardTitle>Activity Log</CardTitle>
          <CardDescription>System-wide events</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {activities.map((a, i) => (
              <li key={i} className="rounded-lg border p-3">
                <div className="text-sm">{a.msg}</div>
                <div className="text-xs text-muted-foreground">{a.at}</div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </PageShell>
  )
}
