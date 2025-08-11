"use client"
import { PageShell } from "@/src/components/page-shell"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/src/components/ui/card"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/src/components/ui/table"
export default function ItemReport() {
  const rows = [
    { sku: "EL-2109", purchases: 500, sales: 400 },
    { sku: "AP-4012", purchases: 300, sales: 280 },
  ]
  return (
    <PageShell title="Reporting — Item" withToolbar={false}>
      <Card>
        <CardHeader>
          <CardTitle>Item Report</CardTitle>
          <CardDescription>Purchases and Sales by SKU</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>SKU</TableHead>
                  <TableHead className="text-right">Purchased</TableHead>
                  <TableHead className="text-right">Sold</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r) => (
                  <TableRow key={r.sku}>
                    <TableCell className="font-mono text-xs">{r.sku}</TableCell>
                    <TableCell className="text-right tabular-nums">{r.purchases}</TableCell>
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
