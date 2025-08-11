"use client"

import * as React from "react"
import { PageShell } from "@/components/page-shell"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { listInvoices } from "@/lib/pos/storage"
import { useRouter } from "next/navigation"
import { Printer, ReceiptText, Search } from "lucide-react"

export default function InvoicesListPage() {
  const router = useRouter()
  const [q, setQ] = React.useState("")
  const invoices = listInvoices()
  const filtered = invoices.filter((inv) => {
    const s = q.toLowerCase()
    if (!s) return true
    return (
      inv.number.toLowerCase().includes(s) ||
      (inv.customer?.name || "").toLowerCase().includes(s) ||
      inv.payment.method.toLowerCase().includes(s)
    )
  })

  return (
    <PageShell title="Invoices">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Invoices</CardTitle>
          <CardDescription>Search, view, and print invoices</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                placeholder="Search number, customer, method..."
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className="h-9 w-72 rounded-md border bg-background pl-8 pr-3 text-sm"
              />
            </div>
          </div>
          <div className="overflow-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>No.</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                      No invoices yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((i) => (
                    <TableRow key={i.id}>
                      <TableCell className="font-mono text-xs">{i.number}</TableCell>
                      <TableCell>{new Date(i.createdAt).toLocaleString()}</TableCell>
                      <TableCell>{i.customer?.name || "Walk-in"}</TableCell>
                      <TableCell className="text-right tabular-nums">${i.total.toFixed(2)}</TableCell>
                      <TableCell className="capitalize">{i.payment.method}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button size="sm" onClick={() => router.push(`/pos/invoices/${i.id}`)}>
                            <ReceiptText className="mr-2 h-4 w-4" /> View
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="bg-transparent"
                            onClick={() => router.push(`/pos/invoices/${i.id}?print=1`)}
                          >
                            <Printer className="mr-2 h-4 w-4" /> Print
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </PageShell>
  )
}
