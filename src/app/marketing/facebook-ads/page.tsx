"use client"
import Link from "next/link"
import { PageShell } from "@/components/page-shell"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
export default function FacebookAds() {
  const rows = [
    { id: "AD-2001", name: "Summer Promo", status: "Active", spend: 240, clicks: 120 },
    { id: "AD-2002", name: "Back to School", status: "Paused", spend: 0, clicks: 0 },
  ]
  return (
    <PageShell title="Marketing — Facebook Ads" withToolbar={false}>
      <Card>
        <CardHeader className="flex items-center justify-between">
          <div>
            <CardTitle>Campaigns</CardTitle>
            <CardDescription>Manage and track performance</CardDescription>
          </div>
          <div className="flex gap-2">
            <Link href="/marketing/facebook-ads/new-campaign">
              <Button>New Campaign</Button>
            </Link>
            <Link href="/marketing/facebook-ads/new-listing">
              <Button variant="outline">New Listing</Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Spend</TableHead>
                  <TableHead className="text-right">Clicks</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-mono text-xs">{r.id}</TableCell>
                    <TableCell>{r.name}</TableCell>
                    <TableCell>{r.status}</TableCell>
                    <TableCell className="text-right tabular-nums">${r.spend.toFixed(2)}</TableCell>
                    <TableCell className="text-right tabular-nums">{r.clicks}</TableCell>
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
