"use client"

import { PageShell } from "@/src/components/page-shell"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/src/components/ui/table"

export default function VendorCredits() {
  const rows = [{ id: "VC-2001", vendor: "Cobalt", amount: 120.0, reason: "Overbilling", date: "2025-08-08" }]
  return (
    <PageShell title="Purchases — Vendor Credits" withToolbar={false}>
      <Card>
        <CardHeader>
          <CardTitle>Vendor Credits</CardTitle>
          <CardDescription>Credit notes from vendors</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Credit</TableHead>
                  <TableHead>Vendor</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-mono text-xs">{r.id}</TableCell>
                    <TableCell>{r.vendor}</TableCell>
                    <TableCell className="text-right tabular-nums">${r.amount.toFixed(2)}</TableCell>
                    <TableCell>{r.reason}</TableCell>
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
