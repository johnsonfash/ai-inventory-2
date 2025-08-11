"use client"

import Link from "next/link"
import { PageShell } from "@/src/components/page-shell"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/src/components/ui/table"
import { Button } from "@/src/components/ui/button"

export default function Discounts() {
  const rows = [
    { code: "WELCOME10", type: "Percent", value: "10%", active: true },
    { code: "BULK50", type: "Amount", value: "$50", active: false },
  ]
  return (
    <PageShell title="Sales — Discounts" withToolbar>
      <Card>
        <CardHeader className="flex items-center justify-between">
          <div>
            <CardTitle>Discounts</CardTitle>
            <CardDescription>Coupons and automatic discounts</CardDescription>
          </div>
          {/* Fix: use Button asChild so navigation works reliably */}
          <Button asChild className="bg-violet-600 hover:bg-violet-600/90">
            <Link href="/sales/discounts/new">New Discount</Link>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="overflow-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r) => (
                  <TableRow key={r.code}>
                    <TableCell className="font-mono text-xs">{r.code}</TableCell>
                    <TableCell>{r.type}</TableCell>
                    <TableCell>{r.value}</TableCell>
                    <TableCell>{r.active ? "Active" : "Disabled"}</TableCell>
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
