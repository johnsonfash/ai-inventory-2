"use client"

import { PageShell } from "@/src/components/page-shell"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/src/components/ui/table"

export default function Transfers() {
  const rows = [
    { id: "TR-501", from: "WH-A", to: "WH-B", sku: "AP-4012", qty: 40, date: "2025-08-03" },
    { id: "TR-502", from: "WH-B", to: "WH-C", sku: "EL-2109", qty: 25, date: "2025-08-06" },
  ]
  return (
    <PageShell title="Inventory — Transfers" withToolbar>
      <Card>
        <CardHeader>
          <CardTitle>Transfers</CardTitle>
          <CardDescription>Move stock between warehouses</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>From</TableHead>
                  <TableHead>To</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead className="text-right">Qty</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell>{r.id}</TableCell>
                    <TableCell>{r.from}</TableCell>
                    <TableCell>{r.to}</TableCell>
                    <TableCell className="font-mono text-xs">{r.sku}</TableCell>
                    <TableCell className="text-right tabular-nums">{r.qty}</TableCell>
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
