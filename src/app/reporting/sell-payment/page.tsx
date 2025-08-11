"use client"
import { PageShell } from "@/components/page-shell"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
export default function SellPaymentReport() {
  const rows = [{ id: "PAY-5001", customer: "NovaApps", amount: 420, date: "2025-08-05" }]
  return (
    <PageShell title="Reporting — Sell Payment" withToolbar={false}>
      <Card>
        <CardHeader>
          <CardTitle>Sales Payments</CardTitle>
          <CardDescription>Customer payment history</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Payment</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-mono text-xs">{r.id}</TableCell>
                    <TableCell>{r.customer}</TableCell>
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
