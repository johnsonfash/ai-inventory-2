"use client"

import Link from "next/link"
import { PageShell } from "@/components/page-shell"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"

export default function Customers() {
  const rows = [
    { name: "NovaApps", email: "ops@novaapps.io", orders: 58 },
    { name: "BrightLane", email: "team@brightlane.com", orders: 24 },
  ]
  return (
    <PageShell title="Sales — Customers" withToolbar>
      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle>Customers</CardTitle>
          <Link href="/sales/customers/new">
            <Button className="bg-violet-600 hover:bg-violet-600/90">Add Customer</Button>
          </Link>
        </CardHeader>
        <CardContent>
          <div className="overflow-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead className="text-right">Orders</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r) => (
                  <TableRow key={r.email}>
                    <TableCell>{r.name}</TableCell>
                    <TableCell>{r.email}</TableCell>
                    <TableCell className="text-right tabular-nums">{r.orders}</TableCell>
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
