"use client"
import { PageShell } from "@/src/components/page-shell"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/src/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/src/components/ui/table"

export default function PurchaseSale() {
  const rows = [
    { period: "2025‑06", purchases: 12400, sales: 15400 },
    { period: "2025‑07", purchases: 13900, sales: 16100 },
    { period: "2025‑08", purchases: 14200, sales: 16800 },
  ]
  return (
    <PageShell title="Reporting — Purchase & Sale" withToolbar={false}>
      <Card>
        <CardHeader>
          <CardTitle>Purchase & Sale</CardTitle>
          <CardDescription>Monthly totals</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Period</TableHead>
                  <TableHead className="text-right">Purchases</TableHead>
                  <TableHead className="text-right">Sales</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r) => (
                  <TableRow key={r.period}>
                    <TableCell>{r.period}</TableCell>
                    <TableCell className="text-right tabular-nums">${r.purchases.toLocaleString()}</TableCell>
                    <TableCell className="text-right tabular-nums">${r.sales.toLocaleString()}</TableCell>
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
