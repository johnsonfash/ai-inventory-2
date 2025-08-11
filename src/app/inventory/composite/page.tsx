"use client"

import { PageShell } from "@/components/page-shell"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function CompositeItems() {
  const bundles = [{ name: "Remote Work Kit", sku: "KIT-001", components: 3 }]

  return (
    <PageShell title="Inventory — Composite Items" withToolbar={false}>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Composite Items</CardTitle>
          <CardDescription>Build kits from multiple SKUs with auto stock deduction</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="rounded-lg border p-3">
            <div className="grid grid-cols-3 gap-3">
              <div className="grid gap-2">
                <Label>Bundle Name</Label>
                <Input placeholder="Remote Work Kit" />
              </div>
              <div className="grid gap-2">
                <Label>Bundle SKU</Label>
                <Input placeholder="KIT-001" />
              </div>
              <div className="flex items-end">
                <Button className="bg-violet-600 hover:bg-violet-600/90">Add Component</Button>
              </div>
            </div>
          </div>

          <div className="overflow-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Bundle</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead className="text-right">Components</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bundles.map((b) => (
                  <TableRow key={b.sku}>
                    <TableCell>{b.name}</TableCell>
                    <TableCell className="font-mono text-xs">{b.sku}</TableCell>
                    <TableCell className="text-right tabular-nums">{b.components}</TableCell>
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
