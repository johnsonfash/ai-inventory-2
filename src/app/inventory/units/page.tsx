"use client"

import Link from "next/link"
import { PageShell } from "@/src/components/page-shell"
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/src/components/ui/table"
import { Button } from "@/src/components/ui/button"

export default function Units() {
  const rows = [
    { code: "pcs", name: "Pieces" },
    { code: "box", name: "Box" },
  ]
  return (
    <PageShell title="Inventory — Units" withToolbar>
      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle>Units</CardTitle>
          <Link href="/inventory/units/new">
            <Button className="bg-violet-600 hover:bg-violet-600/90">Add Unit</Button>
          </Link>
        </CardHeader>
        <CardContent>
          <div className="overflow-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Name</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r) => (
                  <TableRow key={r.code}>
                    <TableCell className="font-mono text-xs">{r.code}</TableCell>
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
