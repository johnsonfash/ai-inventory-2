"use client"

import { PageShell } from "@/src/components/page-shell"
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/src/components/ui/table"
import { Button } from "@/src/components/ui/button"
import { Badge } from "@/src/components/ui/badge"
import Link from "next/link"

export default function Users() {
  const rows = [
    { name: "Alex Larson", email: "alex@acme.com", role: "Admin" },
    { name: "Mia Chen", email: "mia@acme.com", role: "Viewer" },
  ]
  return (
    <PageShell title="Settings — Users & Roles" withToolbar={false}>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Users & Roles</CardTitle>
          <Link href="/settings/users/new">
            <Button className="bg-violet-600 hover:bg-violet-600/90">Invite User</Button>
          </Link>
        </CardHeader>
        <CardContent>
          <div className="overflow-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r) => (
                  <TableRow key={r.email}>
                    <TableCell>{r.name}</TableCell>
                    <TableCell>{r.email}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{r.role}</Badge>
                    </TableCell>
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
