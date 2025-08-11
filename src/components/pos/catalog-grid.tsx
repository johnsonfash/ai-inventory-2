"use client"

import * as React from "react"
import Image from "next/image"
import type { CatalogItem } from "@/src/lib/pos/storage"
import { Input } from "@/src/components/ui/input"
import { Button } from "@/src/components/ui/button"
import { Badge } from "@/src/components/ui/badge"

type Props = {
  catalog: CatalogItem[]
  onAdd: (item: CatalogItem) => void
  businessMode: "retail" | "restaurant" | "services" | "auto"
}

export function CatalogGrid({ catalog, onAdd }: Props) {
  const [q, setQ] = React.useState("")
  const [category, setCategory] = React.useState<string>("All")
  const [brand, setBrand] = React.useState<string>("All")

  const categories = React.useMemo(
    () => ["All", ...Array.from(new Set(catalog.map((c) => c.category).filter(Boolean) as string[]))],
    [catalog],
  )
  const brands = React.useMemo(
    () => ["All", ...Array.from(new Set(catalog.map((c) => c.brand).filter(Boolean) as string[]))],
    [catalog],
  )

  const filtered = React.useMemo(() => {
    const s = q.trim().toLowerCase()
    return catalog
      .filter((c) => (category === "All" ? true : c.category === category))
      .filter((c) => (brand === "All" ? true : c.brand === brand))
      .filter((c) => (s ? c.name.toLowerCase().includes(s) || c.sku.toLowerCase().includes(s) : true))
  }, [q, category, brand, catalog])

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <Input placeholder="Search products..." value={q} onChange={(e) => setQ(e.target.value)} className="max-w-xs" />
        <select
          className="h-9 rounded-md border bg-background px-2 text-sm"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          {categories.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <select
          className="h-9 rounded-md border bg-background px-2 text-sm"
          value={brand}
          onChange={(e) => setBrand(e.target.value)}
        >
          {brands.map((b) => (
            <option key={b}>{b}</option>
          ))}
        </select>
        <div className="ml-auto flex items-center gap-2">
          <Badge variant="secondary">{filtered.length} items</Badge>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
        {filtered.map((p) => (
          <div key={p.id} className="rounded-lg border p-3 transition-colors hover:bg-accent">
            <div className="relative mb-2 aspect-square overflow-hidden rounded-md border">
              <Image
                src={p.image || "/placeholder.svg?height=160&width=160&query=product"}
                alt={p.name}
                fill
                sizes="(min-width: 1280px) 20vw, (min-width: 768px) 25vw, 50vw"
                className="object-cover"
              />
            </div>
            <div className="line-clamp-1 text-sm font-medium">{p.name}</div>
            <div className="text-xs text-muted-foreground">{p.category}</div>
            <div className="mt-1 font-semibold tabular-nums">${p.price.toFixed(2)}</div>
            <Button className="mt-2 w-full" onClick={() => onAdd(p)}>
              Add
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}
