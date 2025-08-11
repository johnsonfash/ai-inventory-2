"use client"
import { PageShell } from "@/src/components/page-shell"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/src/components/ui/card"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/src/components/ui/table"
export default function RegisterReport() {
  const rows = [{ id: "REG-1201", openedBy: "A. Larson", openedAt: "08:00", closedAt: "17:00", cash: 1240 }]
  return (
    <PageShell title="Reporting — Register" withToolbar={false}>
      <Card>
        <CardHeader>
          <CardTitle>Registers</CardTitle>
          <CardDescription>Open/close sessions and cash totals</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Register</TableHead>
                  <TableHead>Opened By</TableHead>
                  <TableHead>Opened</TableHead>
                  <TableHead>Closed</TableHead>
                  <TableHead className="text-right">Cash Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-mono text-xs">{r.id}</TableCell>
                    <TableCell>{r.openedBy}</TableCell>
                    <TableCell>{r.openedAt}</TableCell>
                    <TableCell>{r.closedAt}</TableCell>
                    <TableCell className="text-right tabular-nums">${r.cash.toLocaleString()}</TableCell>
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
