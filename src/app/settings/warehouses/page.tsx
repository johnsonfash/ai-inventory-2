"use client"

import { PageShell } from "@/src/components/page-shell"
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/src/components/ui/table"
import { Button } from "@/src/components/ui/button"
import Link from "next/link"

export default function Warehouses() {
  const rows = [
    { code: "WH-A", name: "Main Warehouse", location: "Austin, TX" },
    { code: "WH-B", name: "East DC", location: "Atlanta, GA" },
  ]
  return (
    <PageShell title="Settings — Warehouses" withToolbar={false}>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Warehouses</CardTitle>
          <Link href="/settings/warehouses/new">
            <Button className="bg-violet-600 hover:bg-violet-600/90">Add Warehouse</Button>
          </Link>
        </CardHeader>
        <CardContent>
          <div className="overflow-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r) => (
                  <TableRow key={r.code}>
                    <TableCell className="font-mono text-xs">{r.code}</TableCell>
                    <TableCell>{r.name}</TableCell>
                    <TableCell>{r.location}</TableCell>
                    <TableCell className="text-right">
                      <Link href={`/settings/warehouses/${r.code}/edit`}>
                        <Button size="sm" variant="outline" className="bg-transparent">
                          Edit
                        </Button>
                      </Link>
                    </TableCell>
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
