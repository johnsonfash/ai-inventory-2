"use client"

import { PageShell } from "@/components/page-shell"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

export default function SalesOrders() {
  const rows = [
    { id: "SO-7842", customer: "NovaApps", items: 4, total: 420.0, status: "Fulfilled", date: "2025-08-05" },
    { id: "SO-7849", customer: "BrightLane", items: 2, total: 120.0, status: "Pending", date: "2025-08-06" },
  ]
  return (
    <PageShell title="Sales — Orders" withToolbar>
      <Card>
        <CardHeader>
          <CardTitle>Sales Orders</CardTitle>
          <CardDescription>Track orders and fulfillment</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead className="text-right">Items</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-mono text-xs">{r.id}</TableCell>
                    <TableCell>{r.customer}</TableCell>
                    <TableCell className="text-right tabular-nums">{r.items}</TableCell>
                    <TableCell className="text-right tabular-nums">${r.total.toFixed(2)}</TableCell>
                    <TableCell>
                      {r.status === "Fulfilled" ? (
                        <Badge className="bg-emerald-600 hover:bg-emerald-600/90">{r.status}</Badge>
                      ) : (
                        <Badge variant="secondary">{r.status}</Badge>
                      )}
                    </TableCell>
                    <TableCell>{r.date}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </PageShell>
  )
}
