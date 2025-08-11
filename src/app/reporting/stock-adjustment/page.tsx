"use client"
import { PageShell } from "@/src/components/page-shell"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/src/components/ui/card"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/src/components/ui/table"
export default function StockAdjustmentReport() {
  const rows = [{ id: "ADJ-104", sku: "EL-2109", qty: -8, reason: "Damaged", date: "2025-08-02" }]
  return (
    <PageShell title="Reporting — Stock Adjustment" withToolbar={false}>
      <Card>
        <CardHeader>
          <CardTitle>Stock Adjustments</CardTitle>
          <CardDescription>Historical changes</CardDescription>
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
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-mono text-xs">{r.id}</TableCell>
                    <TableCell className="font-mono text-xs">{r.sku}</TableCell>
                    <TableCell className={`text-right tabular-nums ${r.qty < 0 ? "text-red-600" : "text-emerald-600"}`}>
                      {r.qty}
                    </TableCell>
                    <TableCell>{r.reason}</TableCell>
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
