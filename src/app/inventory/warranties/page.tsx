"use client"

import Link from "next/link"
import { PageShell } from "@/src/components/page-shell"
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/src/components/ui/table"
import { Button } from "@/src/components/ui/button"

export default function Warranties() {
  const rows = [
    { name: "12 months", terms: "Standard manufacturer coverage" },
    { name: "24 months", terms: "Extended coverage" },
  ]
  return (
    <PageShell title="Inventory — Warranties" withToolbar>
      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle>Warranties</CardTitle>
          <Link href="/inventory/warranties/new">
            <Button className="bg-violet-600 hover:bg-violet-600/90">Add Warranty</Button>
          </Link>
        </CardHeader>
        <CardContent>
          <div className="overflow-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Terms</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r) => (
                  <TableRow key={r.name}>
                    <TableCell>{r.name}</TableCell>
                    <TableCell>{r.terms}</TableCell>
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
