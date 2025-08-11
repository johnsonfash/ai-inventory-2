"use client"
import { PageShell } from "@/src/components/page-shell"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/src/components/ui/card"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/src/components/ui/table"
export default function ProductSell() {
  const rows = [{ sku: "AP-4012", qty: 280, amount: 3360 }]
  return (
    <PageShell title="Reporting — Product Sell" withToolbar={false}>
      <Card>
        <CardHeader>
          <CardTitle>Product Sales</CardTitle>
          <CardDescription>Qty and revenue by SKU</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>SKU</TableHead>
                  <TableHead className="text-right">Qty</TableHead>
                  <TableHead className="text-right">Revenue</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r) => (
                  <TableRow key={r.sku}>
                    <TableCell className="font-mono text-xs">{r.sku}</TableCell>
                    <TableCell className="text-right tabular-nums">{r.qty}</TableCell>
                    <TableCell className="text-right tabular-nums">${r.amount.toLocaleString()}</TableCell>
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
