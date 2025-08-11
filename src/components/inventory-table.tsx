"use client"

import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"

type Item = {
  sku: string
  name: string
  category: string
  stock: number
  reorder: number
  supplier: string
}

const items: Item[] = [
  { sku: "EL-1001", name: "Wireless Mouse", category: "Electronics", stock: 24, reorder: 30, supplier: "Acme" },
  { sku: "AP-4012", name: "Cotton Tee - Black", category: "Apparel", stock: 8, reorder: 20, supplier: "Delta" },
  { sku: "HM-2205", name: "Ceramic Mug 12oz", category: "Home", stock: 54, reorder: 40, supplier: "Porcel" },
  { sku: "EL-2109", name: "USB-C Hub 6-in-1", category: "Electronics", stock: 12, reorder: 25, supplier: "Cobalt" },
  { sku: "BT-9091", name: "Hydrating Serum", category: "Beauty", stock: 5, reorder: 15, supplier: "Glow Co" },
]

export function InventoryTable({ onRestock }: { onRestock?: (sku: string) => void }) {
  return (
    <div className="w-full overflow-auto rounded-lg border">
      <Table aria-label="Inventory low stock table" className="[&_tbody_tr:nth-child(odd)]:bg-muted/30">
        <TableCaption>Low stock items prioritized for restock.</TableCaption>
        <TableHeader className="sticky top-0 z-10 bg-background/95 backdrop-blur">
          <TableRow>
            <TableHead className="w-[110px]">SKU</TableHead>
            <TableHead>Product</TableHead>
            <TableHead>Category</TableHead>
            <TableHead className="text-right">In Stock</TableHead>
            <TableHead className="text-right">Reorder Pt.</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Supplier</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((it) => {
            const low = it.stock < it.reorder
            return (
              <TableRow key={it.sku} className="hover:bg-muted/60">
                <TableCell className="font-mono text-xs">{it.sku}</TableCell>
                <TableCell className="font-medium">{it.name}</TableCell>
                <TableCell className="text-muted-foreground">{it.category}</TableCell>
                <TableCell className="text-right tabular-nums">{it.stock}</TableCell>
                <TableCell className="text-right tabular-nums">{it.reorder}</TableCell>
                <TableCell>
                  {low ? (
                    <Badge className="bg-red-600 hover:bg-red-600/90">Low</Badge>
                  ) : (
                    <Badge className="bg-emerald-600 hover:bg-emerald-600/90">OK</Badge>
                  )}
                </TableCell>
                <TableCell>{it.supplier}</TableCell>
                <TableCell className="text-right">
                  <Button size="sm" variant="outline" className="bg-transparent" onClick={() => onRestock?.(it.sku)}>
                    Restock
                  </Button>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
