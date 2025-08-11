"use client"
import { PageShell } from "@/components/page-shell"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"

export default function TaxReport() {
  const rows = [
    { period: "Q1 2025", collected: 4120, paid: 2860 },
    { period: "Q2 2025", collected: 4580, paid: 3100 },
  ]
  return (
    <PageShell title="Reporting — Tax" withToolbar={false}>
      <Card>
        <CardHeader>
          <CardTitle>Tax Report</CardTitle>
          <CardDescription>Collected vs paid</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Period</TableHead>
                  <TableHead className="text-right">Collected</TableHead>
                  <TableHead className="text-right">Paid</TableHead>
                  <TableHead className="text-right">Balance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r) => (
                  <TableRow key={r.period}>
                    <TableCell>{r.period}</TableCell>
                    <TableCell className="text-right tabular-nums">${r.collected.toLocaleString()}</TableCell>
                    <TableCell className="text-right tabular-nums">${r.paid.toLocaleString()}</TableCell>
                    <TableCell className="text-right tabular-nums">
                      ${(r.collected - r.paid).toLocaleString()}
                    </TableCell>
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
