"use client"

import Link from "next/link"
import { PageShell } from "@/src/components/page-shell"
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/src/components/ui/table"
import { Button } from "@/src/components/ui/button"

export default function Vendors() {
  const rows = [
    { name: "Cobalt", email: "sales@cobalt.com", phone: "+1 555 0100" },
    { name: "Delta", email: "orders@delta.com", phone: "+1 555 0101" },
  ]
  return (
    <PageShell title="Purchases — Vendors" withToolbar>
      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle>Vendors</CardTitle>
          <Link href="/purchasing/vendors/new">
            <Button className="bg-violet-600 hover:bg-violet-600/90">Add Vendor</Button>
          </Link>
        </CardHeader>
        <CardContent>
          <div className="overflow-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r) => (
                  <TableRow key={r.email}>
                    <TableCell>{r.name}</TableCell>
                    <TableCell>{r.email}</TableCell>
                    <TableCell>{r.phone}</TableCell>
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
