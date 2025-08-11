"use client"

import Link from "next/link"
import { PageShell } from "@/src/components/page-shell"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/src/components/ui/card"
import { Table, TableHeader, TableHead, TableRow, TableBody, TableCell } from "@/src/components/ui/table"
import { Button } from "@/src/components/ui/button"

export default function Roles() {
  const rows = [
    { name: "Admin", permissions: "All" },
    { name: "Manager", permissions: "Inventory, Sales, Purchasing" },
    { name: "Viewer", permissions: "Read-only" },
  ]
  return (
    <PageShell title="Settings — Roles" withToolbar={false}>
      <Card>
        <CardHeader className="flex items-center justify-between">
          <div>
            <CardTitle>Roles</CardTitle>
            <CardDescription>Create and manage user roles</CardDescription>
          </div>
          <Link href="/settings/roles/new">
            <Button className="bg-violet-600 hover:bg-violet-600/90">Add Role</Button>
          </Link>
        </CardHeader>
        <CardContent>
          <div className="overflow-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Permissions</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r) => (
                  <TableRow key={r.name}>
                    <TableCell>{r.name}</TableCell>
                    <TableCell>{r.permissions}</TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="outline" className="bg-transparent">
                        Edit
                      </Button>
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
