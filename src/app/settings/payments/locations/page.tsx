"use client"

import { PageShell } from "@/src/components/page-shell"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/src/components/ui/card"
import { Button } from "@/src/components/ui/button"

const rows = [
  { location: "Main Store", defaultAccount: "VA-001", cashiers: 4 },
  { location: "Airport Kiosk", defaultAccount: "VA-003", cashiers: 2 },
]

export default function PaymentLocations() {
  return (
    <PageShell title="Payments — Locations" withToolbar={false}>
      <Card>
        <CardHeader className="flex items-center justify-between">
          <div>
            <CardTitle>Location Settings</CardTitle>
            <CardDescription>Default accounts and cashier mappings</CardDescription>
          </div>
          <Button>Sync</Button>
        </CardHeader>
        <CardContent>
          <div className="overflow-auto rounded-lg border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="p-2 text-left">Location</th>
                  <th className="p-2 text-left">Default Account</th>
                  <th className="p-2 text-right">Cashiers</th>
                  <th className="p-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.location} className="border-b">
                    <td className="p-2">{r.location}</td>
                    <td className="p-2">{r.defaultAccount}</td>
                    <td className="p-2 text-right">{r.cashiers}</td>
                    <td className="p-2 text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline">Change Default</Button>
                        <Button variant="outline">Map Cashiers</Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </PageShell>
  )
}
