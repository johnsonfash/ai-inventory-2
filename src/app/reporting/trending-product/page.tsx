"use client"
import { PageShell } from "@/src/components/page-shell"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/src/components/ui/card"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/src/components/ui/table"
export default function TrendingProduct() {
  const rows = [
    { sku: "EL-2109", name: "USB‑C Hub 6‑in‑1", sales: 320 },
    { sku: "AP-4012", name: "Cotton Tee - Black", sales: 280 },
  ]
  return (
    <PageShell title="Reporting — Trending Product" withToolbar={false}>
      <Card>
        <CardHeader>
          <CardTitle>Trending Products</CardTitle>
          <CardDescription>Top sellers in the period</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>SKU</TableHead>
                  <TableHead>Item</TableHead>
                  <TableHead className="text-right">Units Sold</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r) => (
                  <TableRow key={r.sku}>
                    <TableCell className="font-mono text-xs">{r.sku}</TableCell>
                    <TableCell>{r.name}</TableCell>
                    <TableCell className="text-right tabular-nums">{r.sales}</TableCell>
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
