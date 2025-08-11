"use client"

import { useParams } from "next/navigation"
import { PageShell } from "@/src/components/page-shell"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/src/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/src/components/ui/table"
import { RoleGuard } from "@/src/components/auth/role-guard"
import { salesForMember } from "@/src/lib/pos/storage"

export default function MemberDetailPage() {
  const params = useParams<{ member: string }>()
  const member = decodeURIComponent(params.member)
  const data = salesForMember(member)

  return (
    <RoleGuard permission="view:team:detail">
      <PageShell title={`Team — ${member}`} withToolbar>
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Sales</CardTitle>
              <CardDescription>Total invoices</CardDescription>
            </CardHeader>
            <CardContent className="text-2xl font-semibold tabular-nums">{data.count}</CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Revenue</CardTitle>
              <CardDescription>Total revenue</CardDescription>
            </CardHeader>
            <CardContent className="text-2xl font-semibold tabular-nums">${data.revenue.toFixed(2)}</CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Avg. Order</CardTitle>
              <CardDescription>Revenue / sale</CardDescription>
            </CardHeader>
            <CardContent className="text-2xl font-semibold tabular-nums">
              ${data.count ? (data.revenue / data.count).toFixed(2) : "0.00"}
            </CardContent>
          </Card>
        </div>

        <Card className="mt-4">
          <CardHeader className="pb-2">
            <CardTitle>Recent Invoices</CardTitle>
            <CardDescription>Last 25 invoices</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-auto rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Number</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead>Channel</TableHead>
                    <TableHead>Location</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.list.slice(0, 25).map((i) => (
                    <TableRow key={i.id}>
                      <TableCell className="font-mono text-xs">{i.number}</TableCell>
                      <TableCell>{new Date(i.createdAt).toLocaleString()}</TableCell>
                      <TableCell className="text-right tabular-nums">${i.total.toFixed(2)}</TableCell>
                      <TableCell>{i.meta?.channel}</TableCell>
                      <TableCell>{i.meta?.location}</TableCell>
                    </TableRow>
                  ))}
                  {data.list.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground">
                        No invoices yet.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </PageShell>
    </RoleGuard>
  )
}
