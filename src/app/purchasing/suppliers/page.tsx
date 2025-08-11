"use client"

import { PageShell } from "@/src/components/page-shell"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/src/components/ui/table"
import { Button } from "@/src/components/ui/button"

export default function Suppliers() {
  const rows = [
    { name: "Cobalt", email: "sales@cobalt.com", phone: "+1 555-1000" },
    { name: "Delta", email: "orders@delta.com", phone: "+1 555-1001" },
    { name: "Acme", email: "hello@acme.io", phone: "+1 555-1002" },
  ]
  return (
    <PageShell title="Purchasing — Suppliers" withToolbar>
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Suppliers</CardTitle>
              <CardDescription>Manage vendor relationships</CardDescription>
            </div>
            <Button className="bg-violet-600 hover:bg-violet-600/90">Add Supplier</Button>
          </div>
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
                  <TableRow key={r.name}>
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
