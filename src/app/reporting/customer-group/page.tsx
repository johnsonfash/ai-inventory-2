"use client"
import { PageShell } from "@/src/components/page-shell"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/src/components/ui/card"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/src/components/ui/table"

export default function CustomerGroup() {
  const rows = [
    { group: "Retail", customers: 120, sales: 42000 },
    { group: "Wholesale", customers: 48, sales: 68000 },
  ]
  return (
    <PageShell title="Reporting — Customer Group" withToolbar={false}>
      <Card>
        <CardHeader>
          <CardTitle>Customer Group</CardTitle>
          <CardDescription>Sales by group</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Group</TableHead>
                  <TableHead className="text-right">Customers</TableHead>
                  <TableHead className="text-right">Sales</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r) => (
                  <TableRow key={r.group}>
                    <TableCell>{r.group}</TableCell>
                    <TableCell className="text-right tabular-nums">{r.customers}</TableCell>
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
