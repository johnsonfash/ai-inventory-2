"use client"

import { PageShell } from "@/components/page-shell"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function Expenses() {
  const rows = [
    { id: "EXP-101", category: "Shipping", amount: 220.5, date: "2025-08-05" },
    { id: "EXP-102", category: "Packaging", amount: 84.0, date: "2025-08-06" },
  ]
  return (
    <PageShell title="Expenses" withToolbar={false}>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Log Expense</CardTitle>
          <CardDescription>Track operational costs</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-3 gap-3">
            <div className="grid gap-2">
              <Label>Category</Label>
              <Input placeholder="Shipping" />
            </div>
            <div className="grid gap-2">
              <Label>Amount</Label>
              <Input type="number" placeholder="0.00" />
            </div>
            <div className="grid gap-2">
              <Label>Date</Label>
              <Input type="date" />
            </div>
          </div>
          <Button className="bg-violet-600 hover:bg-violet-600/90 w-fit">Add Expense</Button>
          <div className="overflow-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-mono text-xs">{r.id}</TableCell>
                    <TableCell>{r.category}</TableCell>
                    <TableCell className="text-right tabular-nums">${r.amount.toFixed(2)}</TableCell>
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
