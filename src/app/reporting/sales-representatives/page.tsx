"use client"
import { PageShell } from "@/components/page-shell"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
export default function SalesRepresentatives() {
  const rows = [
    { rep: "Mia Chen", orders: 42, revenue: 12400 },
    { rep: "Alex Larson", orders: 38, revenue: 11680 },
  ]
  return (
    <PageShell title="Reporting — Sales Representatives" withToolbar={false}>
      <Card>
        <CardHeader>
          <CardTitle>Sales Representatives</CardTitle>
          <CardDescription>Performance overview</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Representative</TableHead>
                  <TableHead className="text-right">Orders</TableHead>
                  <TableHead className="text-right">Revenue</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r) => (
                  <TableRow key={r.rep}>
                    <TableCell>{r.rep}</TableCell>
                    <TableCell className="text-right tabular-nums">{r.orders}</TableCell>
                    <TableCell className="text-right tabular-nums">${r.revenue.toLocaleString()}</TableCell>
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
