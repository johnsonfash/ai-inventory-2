"use client"

import Link from "next/link"
import { PageShell } from "@/components/page-shell"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"

export default function Receipts() {
  const rows = [{ id: "PR-5001", po: "PO-1043", items: 3, status: "Received", date: "2025-08-06" }]
  return (
    <PageShell title="Purchases — Receipts" withToolbar>
      <Card>
        <CardHeader className="flex items-center justify-between">
          <div>
            <CardTitle>Purchase Receipts</CardTitle>
            <CardDescription>What was actually delivered</CardDescription>
          </div>
          <Link href="/purchasing/receipts/new">
            <Button className="bg-violet-600 hover:bg-violet-600/90">New Receipt</Button>
          </Link>
        </CardHeader>
        <CardContent>
          <div className="overflow-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Receipt</TableHead>
                  <TableHead>Purchase Order</TableHead>
                  <TableHead className="text-right">Items</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-mono text-xs">{r.id}</TableCell>
                    <TableCell className="font-mono text-xs">{r.po}</TableCell>
                    <TableCell className="text-right tabular-nums">{r.items}</TableCell>
                    <TableCell>{r.status}</TableCell>
                    <TableCell>{r.date}</TableCell>
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
