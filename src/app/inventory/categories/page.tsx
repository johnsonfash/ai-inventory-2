"use client"

import Link from "next/link"
import { PageShell } from "@/src/components/page-shell"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Button } from "@/src/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/src/components/ui/table"

export default function Categories() {
  const rows = [
    { name: "Electronics", items: 412 },
    { name: "Apparel", items: 286 },
    { name: "Home", items: 158 },
    { name: "Beauty", items: 94 },
  ]
  return (
    <PageShell title="Inventory — Categories" withToolbar>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Categories</CardTitle>
              <CardDescription>Group items for reporting and navigation</CardDescription>
            </div>
            <Link href="/inventory/categories/new">
              <Button className="bg-violet-600 hover:bg-violet-600/90">Add Category</Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead className="text-right">Items</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r) => (
                  <TableRow key={r.name}>
                    <TableCell>{r.name}</TableCell>
                    <TableCell className="text-right tabular-nums">{r.items}</TableCell>
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
