"use client"

import { PageShell } from "@/src/components/page-shell"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/src/components/ui/table"

export default function Shipments() {
  const rows = [
    { id: "SH-4430", carrier: "UPS", order: "SO-7842", status: "Delivered", date: "2025-08-06" },
    { id: "SH-4431", carrier: "DHL", order: "SO-7849", status: "In Transit", date: "2025-08-07" },
  ]
  return (
    <PageShell title="Sales — Shipments" withToolbar>
      <Card>
        <CardHeader>
          <CardTitle>Shipments</CardTitle>
          <CardDescription>Fulfillment tracking</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Shipment</TableHead>
                  <TableHead>Carrier</TableHead>
                  <TableHead>Order</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-mono text-xs">{r.id}</TableCell>
                    <TableCell>{r.carrier}</TableCell>
                    <TableCell className="font-mono text-xs">{r.order}</TableCell>
                    <TableCell>{r.status}</TableCell>
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
