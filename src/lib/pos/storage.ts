"use client"

export type CatalogItem = {
  id: string
  barcode?: string
  sku: string
  name: string
  price: number
  taxRate?: number
  image?: string
  category?: string
  brand?: string
  stock?: number
  tags?: string[]
}

export type CartItem = {
  id: string
  sku: string
  name: string
  price: number
  qty: number
  taxRate?: number
}

export type PaymentLine = {
  method: "cash" | "card" | "paypal" | "stripe" | "other"
  amount: number
  reference?: string
}

export type Draft = {
  id: string
  createdAt: number
  note?: string
  customer?: { name?: string; email?: string; phone?: string } | null
  items: CartItem[]
  discount?: number
  discountType?: "flat" | "percent"
  orderTaxPercent?: number
  shipping?: number
  serviceFee?: number
  meta?: {
    location?: string
    salesperson?: string
    channel?: string
  }
}

export type Invoice = {
  id: string
  number: string
  createdAt: number
  customer?: { name?: string; email?: string; phone?: string } | null
  items: CartItem[]
  subtotal: number
  discount?: number
  discountType?: "flat" | "percent"
  orderTaxPercent?: number
  itemTax: number
  orderTax: number
  shipping?: number
  serviceFee?: number
  total: number
  payments: PaymentLine[]
  meta?: {
    location?: string
    salesperson?: string
    channel?: string
  }
}

export type ReturnRecord = {
  id: string
  number: string
  createdAt: number
  invoiceId: string
  invoiceNumber: string
  customer?: { name?: string; email?: string; phone?: string } | null
  items: { sku: string; name: string; price: number; qty: number }[]
  subtotal: number
  tax: number
  totalRefund: number
  method: "cash" | "card" | "paypal" | "stripe" | "other"
  reference?: string
}

const DRAFTS_KEY = "pos:drafts"
const INVOICES_KEY = "pos:invoices"
const RETURNS_KEY = "pos:returns"
const CATALOG_KEY = "pos:catalog:mode"

// -------------- LS Helpers --------------
function getLS<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}
function setLS<T>(key: string, value: T) {
  if (typeof window === "undefined") return
  localStorage.setItem(key, JSON.stringify(value))
}

export function genId(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}_${Date.now().toString(36)}`
}

export function genInvoiceNumber() {
  const now = new Date()
  const yyyy = now.getFullYear()
  const mm = String(now.getMonth() + 1).padStart(2, "0")
  const dd = String(now.getDate()).padStart(2, "0")
  const hh = String(now.getHours()).padStart(2, "0")
  const mi = String(now.getMinutes()).padStart(2, "0")
  const ss = String(now.getSeconds()).padStart(2, "0")
  return `INV-${yyyy}${mm}${dd}-${hh}${mi}${ss}`
}

export function genReturnNumber() {
  const now = new Date()
  const yyyy = now.getFullYear()
  const mm = String(now.getMonth() + 1).padStart(2, "0")
  const dd = String(now.getDate()).padStart(2, "0")
  const hh = String(now.getHours()).padStart(2, "0")
  const mi = String(now.getMinutes()).padStart(2, "0")
  const ss = String(now.getSeconds()).padStart(2, "0")
  return `RET-${yyyy}${mm}${dd}-${hh}${mi}${ss}`
}

// -------------- Catalog --------------
export function loadCatalog(mode: "retail" | "restaurant" | "services" | "auto" = "retail"): CatalogItem[] {
  const commonTax = 0.08
  const items: CatalogItem[] = [
    {
      id: "p1",
      barcode: "0123456789012",
      sku: "AP-4012",
      name: "Cotton Tee - Black",
      price: 12.5,
      taxRate: commonTax,
      image: "/placeholder.svg?height=160&width=160",
      category: "Apparel",
      brand: "BasicCo",
      stock: 120,
      tags: ["clothing", "retail"],
    },
    {
      id: "p2",
      barcode: "0123456789016",
      sku: "EL-1001",
      name: "Wireless Mouse",
      price: 19.99,
      taxRate: commonTax,
      image: "/placeholder.svg?height=160&width=160",
      category: "Electronics",
      brand: "Gizmo",
      stock: 64,
      tags: ["electronics", "retail"],
    },
    {
      id: "p3",
      barcode: "0123456789014",
      sku: "BT-9091",
      name: "Hydrating Serum",
      price: 18.0,
      taxRate: commonTax,
      image: "/placeholder.svg?height=160&width=160",
      category: "Beauty",
      brand: "Glow",
      stock: 34,
      tags: ["beauty", "retail"],
    },
    {
      id: "p4",
      sku: "FO-100",
      name: "Fish and Chips",
      price: 7.5,
      taxRate: 0.1,
      image: "/placeholder.svg?height=160&width=160",
      category: "Main course",
      brand: "Kitchen",
      stock: 9999,
      tags: ["food", "restaurant"],
    },
    {
      id: "p5",
      sku: "DR-210",
      name: "Iced Coffee",
      price: 4.2,
      taxRate: 0.1,
      image: "/placeholder.svg?height=160&width=160",
      category: "Drinks",
      brand: "Kitchen",
      stock: 9999,
      tags: ["food", "restaurant"],
    },
    {
      id: "p6",
      sku: "APRT-8820",
      name: "Brake Pads Set",
      price: 65.0,
      taxRate: commonTax,
      image: "/placeholder.svg?height=160&width=160",
      category: "Auto Parts",
      brand: "AutoMax",
      stock: 22,
      tags: ["auto", "mechanic"],
    },
    {
      id: "p7",
      sku: "HS-200",
      name: "Hair Styling Service",
      price: 30,
      taxRate: commonTax,
      image: "/placeholder.svg?height=160&width=160",
      category: "Services",
      brand: "Salon",
      stock: 9999,
      tags: ["salon", "services"],
    },
    {
      id: "p8",
      sku: "HM-2205",
      name: "Ceramic Mug 12oz",
      price: 8.0,
      taxRate: commonTax,
      image: "/placeholder.svg?height=160&width=160",
      category: "Gifts",
      brand: "Homey",
      stock: 200,
      tags: ["gifts", "retail"],
    },
    {
      id: "p9",
      sku: "EL-2109",
      name: "USB‑C Hub 6‑in‑1",
      price: 25.0,
      taxRate: commonTax,
      image: "/placeholder.svg?height=160&width=160",
      category: "Electronics",
      brand: "Gizmo",
      stock: 48,
      tags: ["electronics", "retail"],
    },
  ]
  const key = `${CATALOG_KEY}:${mode}`
  const ls = getLS<CatalogItem[] | null>(key, null)
  if (!ls) setLS(key, items)
  return getLS<CatalogItem[]>(key, items)
}

// -------------- Drafts --------------
export function saveDraft(draft: Draft) {
  const drafts = listDrafts()
  const idx = drafts.findIndex((d) => d.id === draft.id)
  if (idx === -1) drafts.unshift(draft)
  else drafts[idx] = draft
  setLS(DRAFTS_KEY, drafts)
}
export function listDrafts(): Draft[] {
  return getLS<Draft[]>(DRAFTS_KEY, [])
}
export function getDraft(id: string): Draft | undefined {
  return listDrafts().find((d) => d.id === id)
}
export function deleteDraft(id: string) {
  const drafts = listDrafts().filter((d) => d.id !== id)
  setLS(DRAFTS_KEY, drafts)
}

// -------------- Invoices --------------
export function saveInvoice(inv: Invoice) {
  const invoices = listInvoices()
  invoices.unshift(inv)
  setLS(INVOICES_KEY, invoices)
}
export function listInvoices(): Invoice[] {
  const raw = getLS<any[]>(INVOICES_KEY, [])
  return raw as Invoice[]
}
export function getInvoiceById(id: string): Invoice | undefined {
  return listInvoices().find((i) => i.id === id)
}
export function getInvoiceByNumber(num: string): Invoice | undefined {
  return listInvoices().find((i) => i.number.toLowerCase() === num.toLowerCase())
}

// -------------- Returns --------------
export function saveReturn(r: ReturnRecord) {
  const list = listReturns()
  list.unshift(r)
  setLS(RETURNS_KEY, list)
}
export function listReturns(): ReturnRecord[] {
  return getLS<ReturnRecord[]>(RETURNS_KEY, [])
}
export function getReturnById(id: string): ReturnRecord | undefined {
  return listReturns().find((r) => r.id === id)
}

// -------------- Analytics helpers --------------
export function aggregateSalesBySalesperson() {
  const invoices = listInvoices()
  const map = new Map<string, { salesperson: string; sales: number; revenue: number }>()
  for (const inv of invoices) {
    const sp = inv.meta?.salesperson || "Unassigned"
    const rec = map.get(sp) || { salesperson: sp, sales: 0, revenue: 0 }
    rec.sales += 1
    rec.revenue += inv.total
    map.set(sp, rec)
  }
  return Array.from(map.values()).sort((a, b) => b.revenue - a.revenue)
}
export function aggregateSalesByLocation() {
  const invoices = listInvoices()
  const map = new Map<string, { location: string; sales: number; revenue: number }>()
  for (const inv of invoices) {
    const loc = inv.meta?.location || "Unknown"
    const rec = map.get(loc) || { location: loc, sales: 0, revenue: 0 }
    rec.sales += 1
    rec.revenue += inv.total
    map.set(loc, rec)
  }
  return Array.from(map.values()).sort((a, b) => b.revenue - a.revenue)
}
export function aggregateSalesByChannel() {
  const invoices = listInvoices()
  const map = new Map<string, { channel: string; sales: number; revenue: number }>()
  for (const inv of invoices) {
    const ch = inv.meta?.channel || "Unknown"
    const rec = map.get(ch) || { channel: ch, sales: 0, revenue: 0 }
    rec.sales += 1
    rec.revenue += inv.total
    map.set(ch, rec)
  }
  return Array.from(map.values()).sort((a, b) => b.revenue - a.revenue)
}
export function salesForMember(member: string) {
  const list = listInvoices().filter((i) => (i.meta?.salesperson || "").toLowerCase() === member.toLowerCase())
  const revenue = list.reduce((s, i) => s + i.total, 0)
  return { list, revenue, count: list.length }
}

// -------------- Demo Seeding --------------
export function seedPosDemo() {
  if (listInvoices().length > 0 || listDrafts().length > 0 || listReturns().length > 0) return
  const cat = loadCatalog("retail")
  const cart1: CartItem[] = [
    { id: cat[0].id, sku: cat[0].sku, name: cat[0].name, price: cat[0].price, qty: 2, taxRate: cat[0].taxRate },
    { id: cat[1].id, sku: cat[1].sku, name: cat[1].name, price: cat[1].price, qty: 1, taxRate: cat[1].taxRate },
  ]
  const subtotal = cart1.reduce((s, i) => s + i.qty * i.price, 0)
  const itemTax = cart1.reduce((s, i) => s + (i.taxRate || 0) * i.qty * i.price, 0)
  const total = Math.round((subtotal + itemTax) * 100) / 100

  saveDraft({
    id: genId("draft"),
    createdAt: Date.now() - 1000 * 60 * 60,
    note: "Held sale with 2 items",
    items: cart1,
    customer: { name: "Walk-in" },
    discount: 0,
    discountType: "flat",
    meta: { location: "HQ", salesperson: "Sam Sales", channel: "In-Store" },
  })

  saveInvoice({
    id: genId("inv"),
    number: genInvoiceNumber(),
    createdAt: Date.now() - 1000 * 60 * 30,
    items: cart1,
    customer: { name: "Mary Johnson" },
    subtotal,
    discount: 0,
    discountType: "flat",
    orderTaxPercent: 0,
    itemTax: Math.round(itemTax * 100) / 100,
    orderTax: 0,
    shipping: 0,
    serviceFee: 0,
    total,
    payments: [{ method: "card", amount: total, reference: "AUTH1234" }],
    meta: { location: "HQ", salesperson: "Sam Sales", channel: "In-Store" },
  })

  // Seed a return
  const refund = Math.round(cart1[1].price * cart1[1].qty * (1 + (cart1[1].taxRate || 0)) * 100) / 100
  saveReturn({
    id: genId("ret"),
    number: genReturnNumber(),
    createdAt: Date.now() - 1000 * 60 * 10,
    invoiceId: "seed",
    invoiceNumber: "INV-SEED",
    customer: { name: "Mary Johnson" },
    items: [{ sku: cart1[1].sku, name: cart1[1].name, price: cart1[1].price, qty: cart1[1].qty }],
    subtotal: cart1[1].price * cart1[1].qty,
    tax: Math.round((cart1[1].taxRate || 0) * cart1[1].price * cart1[1].qty * 100) / 100,
    totalRefund: refund,
    method: "card",
    reference: "RET-1001",
  })
}
