"use client"
import { PageShell } from "@/components/page-shell"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
export default function StockExpiry() {
  const rows = [{ sku: "BT-9091", batch: "B-1223", name: "Hydrating Serum", expires: "2026-01-10", stock: 48 }]
  return (
    <PageShell title="Reporting — Stock Expiry" withToolbar={false}>
      <Card>
        <CardHeader>
          <CardTitle>Stock Expiry</CardTitle>
          <CardDescription>Batches nearing expiry</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>SKU</TableHead>
                  <TableHead>Batch</TableHead>
                  <TableHead>Item</TableHead>
                  <TableHead>Expiry</TableHead>
                  <TableHead className="text-right">Stock</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r) => (
                  <TableRow key={r.batch}>
                    <TableCell className="font-mono text-xs">{r.sku}</TableCell>
                    <TableCell>{r.batch}</TableCell>
                    <TableCell>{r.name}</TableCell>
                    <TableCell>{r.expires}</TableCell>
                    <TableCell className="text-right tabular-nums">{r.stock}</TableCell>
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
