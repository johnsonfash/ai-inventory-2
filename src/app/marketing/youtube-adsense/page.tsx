"use client"
import Link from "next/link"
import { PageShell } from "@/src/components/page-shell"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/src/components/ui/card"
import { Button } from "@/src/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/src/components/ui/table"
export default function YouTubeAdSense() {
  const rows = [{ id: "YT-4001", name: "Accessories Promo", status: "Active", spend: 320, impressions: 12000 }]
  return (
    <PageShell title="Marketing — YouTube & AdSense" withToolbar={false}>
      <Card>
        <CardHeader className="flex items-center justify-between">
          <div>
            <CardTitle>Campaigns</CardTitle>
            <CardDescription>Manage and track performance</CardDescription>
          </div>
          <div className="flex gap-2">
            <Link href="/marketing/youtube-adsense/new-campaign">
              <Button>New Campaign</Button>
            </Link>
            <Link href="/marketing/youtube-adsense/new-listing">
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
                  <TableHead className="text-right">Impressions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-mono text-xs">{r.id}</TableCell>
                    <TableCell>{r.name}</TableCell>
                    <TableCell>{r.status}</TableCell>
                    <TableCell className="text-right tabular-nums">${r.spend.toFixed(2)}</TableCell>
                    <TableCell className="text-right tabular-nums">{r.impressions.toLocaleString()}</TableCell>
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
