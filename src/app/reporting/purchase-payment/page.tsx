"use client"
import { PageShell } from "@/src/components/page-shell"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/src/components/ui/card"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/src/components/ui/table"
export default function PurchasePaymentReport() {
  const rows = [{ id: "PAY-9001", vendor: "Cobalt", amount: 820, date: "2025-08-07" }]
  return (
    <PageShell title="Reporting — Purchase Payment" withToolbar={false}>
      <Card>
        <CardHeader>
          <CardTitle>Purchase Payments</CardTitle>
          <CardDescription>Vendor payment history</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Payment</TableHead>
                  <TableHead>Vendor</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-mono text-xs">{r.id}</TableCell>
                    <TableCell>{r.vendor}</TableCell>
                    <TableCell className="text-right tabular-nums">${r.amount.toFixed(2)}</TableCell>
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
