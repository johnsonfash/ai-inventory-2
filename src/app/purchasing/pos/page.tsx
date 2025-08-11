"use client"

import { PageShell } from "@/src/components/page-shell"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/src/components/ui/table"
import { Badge } from "@/src/components/ui/badge"

export default function PurchaseOrders() {
  const rows = [
    { id: "PO-1043", supplier: "Cobalt", items: 3, total: 820.0, status: "Received", date: "2025-08-06" },
    { id: "PO-1044", supplier: "Delta", items: 1, total: 120.0, status: "Open", date: "2025-08-07" },
  ]
  return (
    <PageShell title="Purchasing — POs" withToolbar>
      <Card>
        <CardHeader>
          <CardTitle>Purchase Orders</CardTitle>
          <CardDescription>Track incoming stock</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Purchase Order</TableHead>
                  <TableHead>Supplier</TableHead>
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
                    <TableCell>{r.supplier}</TableCell>
                    <TableCell className="text-right tabular-nums">{r.items}</TableCell>
                    <TableCell className="text-right tabular-nums">${r.total.toFixed(2)}</TableCell>
                    <TableCell>
                      {r.status === "Received" ? (
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
