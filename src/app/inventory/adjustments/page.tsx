"use client"

import { PageShell } from "@/components/page-shell"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"

export default function Adjustments() {
  const rows = [
    { id: "ADJ-104", sku: "EL-2109", qty: -8, reason: "Damaged", by: "M. Lopez", date: "2025-08-02" },
    { id: "ADJ-105", sku: "BT-9091", qty: +20, reason: "Count Correction", by: "A. Patel", date: "2025-08-05" },
  ]
  return (
    <PageShell title="Inventory — Adjustments" withToolbar>
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Stock Adjustments</CardTitle>
              <CardDescription>Fix counts, scrap, and corrections</CardDescription>
            </div>
            <Button variant="outline" className="bg-transparent">
              New Adjustment
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead className="text-right">Qty</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>By</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell>{r.id}</TableCell>
                    <TableCell className="font-mono text-xs">{r.sku}</TableCell>
                    <TableCell className={`text-right tabular-nums ${r.qty < 0 ? "text-red-600" : "text-emerald-600"}`}>
                      {r.qty}
                    </TableCell>
                    <TableCell>{r.reason}</TableCell>
                    <TableCell>{r.by}</TableCell>
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
