"use client"

import Link from "next/link"
import { PageShell } from "@/src/components/page-shell"
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/src/components/ui/table"
import { Button } from "@/src/components/ui/button"

export default function Brands() {
  const rows = [{ name: "Cobalt" }, { name: "Delta" }, { name: "Porcel" }]
  return (
    <PageShell title="Inventory — Brands" withToolbar>
      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle>Brands</CardTitle>
          <Link href="/inventory/brands/new">
            <Button className="bg-violet-600 hover:bg-violet-600/90">Add Brand</Button>
          </Link>
        </CardHeader>
        <CardContent>
          <div className="overflow-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r) => (
                  <TableRow key={r.name}>
                    <TableCell>{r.name}</TableCell>
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
