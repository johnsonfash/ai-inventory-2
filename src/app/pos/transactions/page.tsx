"use client"
import { PageShell } from "@/src/components/page-shell"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/src/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/src/components/ui/table"
import { listInvoices, listReturns } from "@/src/lib/pos/storage"
import { Badge } from "@/src/components/ui/badge"

export default function TransactionsPage() {
  const invoices = listInvoices()
  const returns = listReturns()
  const rows = [
    ...invoices.map((i) => ({
      type: "invoice" as const,
      date: i.createdAt,
      id: i.id,
      number: i.number,
      total: i.total,
    })),
    ...returns.map((r) => ({
      type: "return" as const,
      date: r.createdAt,
      id: r.id,
      number: r.number,
      total: -r.totalRefund,
    })),
  ].sort((a, b) => b.date - a.date)

  return (
    <PageShell title="Transactions">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Sales & Returns</CardTitle>
          <CardDescription>Chronological list of invoices and returns</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>No.</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">
                      No transactions yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  rows.map((r) => (
                    <TableRow key={`${r.type}-${r.id}`}>
                      <TableCell>{new Date(r.date).toLocaleString()}</TableCell>
                      <TableCell>
                        {r.type === "invoice" ? <Badge>Invoice</Badge> : <Badge variant="secondary">Return</Badge>}
                      </TableCell>
                      <TableCell className="font-mono text-xs">{r.number}</TableCell>
                      <TableCell className="text-right tabular-nums">${r.total.toFixed(2)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </PageShell>
  )
}
