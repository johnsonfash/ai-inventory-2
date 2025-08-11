"use client"
import { PageShell } from "@/src/components/page-shell"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/src/components/ui/card"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/src/components/ui/table"

export default function SupplierCustomer() {
  const rows = [
    { name: "Cobalt (Vendor)", purchase: 8200, payments: 8200 },
    { name: "NovaApps (Customer)", sales: 4200, payments: 4200 },
  ]
  return (
    <PageShell title="Reporting — Supplier & Customer" withToolbar={false}>
      <Card>
        <CardHeader>
          <CardTitle>Supplier & Customer</CardTitle>
          <CardDescription>Balances and activity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead className="text-right">Purchases</TableHead>
                  <TableHead className="text-right">Sales</TableHead>
                  <TableHead className="text-right">Payments</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r) => (
                  <TableRow key={r.name}>
                    <TableCell>{r.name}</TableCell>
                    <TableCell className="text-right tabular-nums">
                      ${(r as any).purchase?.toLocaleString?.() ?? "-"}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      ${(r as any).sales?.toLocaleString?.() ?? "-"}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">${r.payments.toLocaleString()}</TableCell>
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
