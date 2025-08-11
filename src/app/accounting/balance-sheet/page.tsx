"use client"

import { PageShell } from "@/src/components/page-shell"
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/src/components/ui/table"

export default function BalanceSheet() {
  const assets = [
    { name: "Cash", amount: 120000 },
    { name: "Inventory", amount: 86000 },
  ]
  const liabilities = [
    { name: "Accounts Payable", amount: 42000 },
    { name: "Credit Line", amount: 15000 },
  ]
  return (
    <PageShell title="Accounting — Balance Sheet" withToolbar={false}>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Assets</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Account</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assets.map((a) => (
                  <TableRow key={a.name}>
                    <TableCell>{a.name}</TableCell>
                    <TableCell className="text-right tabular-nums">${a.amount.toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Liabilities</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Account</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {liabilities.map((l) => (
                  <TableRow key={l.name}>
                    <TableCell>{l.name}</TableCell>
                    <TableCell className="text-right tabular-nums">${l.amount.toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </PageShell>
  )
}
