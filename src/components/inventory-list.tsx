"use client"

import Image from "next/image"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/src/components/ui/table"
import { Badge } from "@/src/components/ui/badge"
import { Button } from "@/src/components/ui/button"

type Item = {
  sku: string
  name: string
  image: string
  category: string
  brand: string
  unit: string
  warranty: string
  location: string
  stock: number
  reorder: number
}

const items: Item[] = [
  {
    sku: "EL-2109",
    name: "USB‑C Hub 6‑in‑1",
    image: "/placeholder.svg?height=40&width=40",
    category: "Electronics",
    brand: "Cobalt",
    unit: "pcs",
    warranty: "12 mo",
    location: "WH-A",
    stock: 12,
    reorder: 25,
  },
  {
    sku: "AP-4012",
    name: "Cotton Tee - Black",
    image: "/placeholder.svg?height=40&width=40",
    category: "Apparel",
    brand: "Delta",
    unit: "pcs",
    warranty: "N/A",
    location: "WH-B",
    stock: 48,
    reorder: 20,
  },
  {
    sku: "HM-2205",
    name: "Ceramic Mug 12oz",
    image: "/placeholder.svg?height=40&width=40",
    category: "Home",
    brand: "Porcel",
    unit: "pcs",
    warranty: "6 mo",
    location: "WH-C",
    stock: 54,
    reorder: 40,
  },
]

export function InventoryList() {
  return (
    <div className="w-full overflow-auto rounded-lg border">
      <Table>
        <TableHeader className="sticky top-0 z-10 bg-background/95 backdrop-blur">
          <TableRow>
            <TableHead>Item</TableHead>
            <TableHead>SKU</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Brand</TableHead>
            <TableHead>Unit</TableHead>
            <TableHead>Warranty</TableHead>
            <TableHead>Location</TableHead>
            <TableHead className="text-right">Stock</TableHead>
            <TableHead className="text-right">Reorder</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((it) => {
            const low = it.stock < it.reorder
            return (
              <TableRow key={it.sku} className="hover:bg-muted/50">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Image
                      src={it.image || "/placeholder.svg"}
                      alt=""
                      width={40}
                      height={40}
                      className="rounded-md border"
                    />
                    <span className="font-medium">{it.name}</span>
                  </div>
                </TableCell>
                <TableCell className="font-mono text-xs">{it.sku}</TableCell>
                <TableCell>{it.category}</TableCell>
                <TableCell>{it.brand}</TableCell>
                <TableCell>{it.unit}</TableCell>
                <TableCell>{it.warranty}</TableCell>
                <TableCell>{it.location}</TableCell>
                <TableCell className="text-right tabular-nums">{it.stock}</TableCell>
                <TableCell className="text-right tabular-nums">{it.reorder}</TableCell>
                <TableCell>
                  {low ? <Badge className="bg-red-600">Low</Badge> : <Badge className="bg-emerald-600">OK</Badge>}
                </TableCell>
                <TableCell className="text-right">
                  <Button size="sm" variant="outline" className="bg-transparent">
                    View
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
