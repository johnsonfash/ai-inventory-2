import { kvJson } from "@/lib/storage/kv"
import type { ModifierGroup, SelectedModifier, Variant, VariantAxis } from "@/lib/pos/variants"

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
  /** Variant structure (Size/Colour/etc). When present the POS shows a
   *  variant picker before adding. POS-2. */
  variantAxes?: VariantAxis[]
  variants?: Variant[]
  /** Add-on / substitution groups (extra shot, no onions, add toner). POS-2. */
  modifierGroups?: ModifierGroup[]
}

export type CartItem = {
  id: string
  sku: string
  name: string
  price: number
  qty: number
  taxRate?: number
  /** Per-line discount, expressed as flat currency OR a percent of the
   *  line gross, switched by `lineDiscountType`. POS-1. Order-level
   *  discount still lives on the Draft/Invoice; this is the per-row one
   *  Square calls a "line discount". */
  lineDiscount?: number
  lineDiscountType?: "flat" | "percent"
  /** Open/custom item rung in manually (price typed at the till). Not in
   *  the catalog and never adjusts stock. POS-1. */
  custom?: boolean
  /** Free-text note shown on the line + receipt (special requests). */
  note?: string
  /** Chosen variant leaf SKU + its human label ("M / Black"). POS-2.
   *  `price` already bakes in the variant + modifier deltas; these are
   *  kept for display, receipts, and the eventual backend. */
  variantSku?: string
  variantLabel?: string
  modifiers?: SelectedModifier[]
  /** This line sells a gift card for `price`; on sale a card is issued.
   *  Non-taxable, doesn't touch stock. POS-2. */
  giftCard?: boolean
  /** Pre-tier unit price (variant + modifiers, before the price-tier
   *  multiplier). Kept so switching tier can reprice the line. POS-2. */
  listPrice?: number
}

// Per-line stamp for the cashier audit trail (POS-2): who did what, when.
export type AuditEntry = {
  at: number
  by: string
  action: "add" | "discount" | "void" | "tier" | "partial" | "recall"
  detail?: string
}

// Two cart lines merge only when they're the same product AND the same
// variant AND the same set of modifiers. Otherwise they stay separate
// (a latte with extra shot is not the same line as a plain latte). POS-2.
export function cartLineKey(
  sku: string,
  variantSku?: string,
  modifiers?: SelectedModifier[],
): string {
  const mods = (modifiers ?? [])
    .map((m) => `${m.groupId}:${m.name}`)
    .sort()
    .join(",")
  return `${variantSku || sku}|${mods}`
}

// ---- Per-line money math (POS-1) -------------------------------------
// One source of truth so the cart, checkout, invoice, and receipt all
// agree. `lineNet` is the line AFTER its own discount but BEFORE tax.
export function lineGross(i: CartItem): number {
  return i.qty * i.price
}
export function lineDiscountValue(i: CartItem): number {
  if (!i.lineDiscount || i.lineDiscount <= 0) return 0
  const gross = lineGross(i)
  const raw = i.lineDiscountType === "percent" ? (gross * i.lineDiscount) / 100 : i.lineDiscount
  // Never discount below zero.
  return Math.min(gross, Math.max(0, Math.round(raw * 100) / 100))
}
export function lineNet(i: CartItem): number {
  return Math.max(0, lineGross(i) - lineDiscountValue(i))
}

export type PaymentLine = {
  // gift-card + store-credit added in POS-2. Loyalty points are redeemed
  // into store credit rather than being a tender of their own.
  method: "cash" | "card" | "paypal" | "stripe" | "gift-card" | "store-credit" | "other"
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
  /** Gratuity added at checkout. Stored as its own line so reporting can
   *  pool tips separately from revenue. POS-1. */
  tip?: number
  total: number
  payments: PaymentLine[]
  /** Settlement state. Layaway/partial sales open as `partial` with a
   *  balance owed. POS-2. */
  status?: "paid" | "partial" | "refunded" | "void"
  /** Amount paid so far + balance still owed (for `partial`). POS-2. */
  paid?: number
  balance?: number
  /** Price tier applied to this sale (e.g. "Wholesale"). POS-2. */
  tierName?: string
  /** Cashier audit trail — who added/discounted/voided. POS-2. */
  audit?: AuditEntry[]
  meta?: {
    location?: string
    salesperson?: string
    channel?: string
  }
}

// Why a return happened. Industry-agnostic — "sizing" suits apparel,
// "defective" suits electronics, "quality" suits food/services, and
// "other" with a note covers the rest. Feeds the returns-by-reason
// report in a later wave. POS-1.
export type ReturnReason =
  | "damaged"
  | "defective"
  | "wrong-item"
  | "changed-mind"
  | "sizing"
  | "quality"
  | "other"

export const RETURN_REASONS: { value: ReturnReason; label: string }[] = [
  { value: "damaged", label: "Arrived damaged" },
  { value: "defective", label: "Faulty / defective" },
  { value: "wrong-item", label: "Wrong item" },
  { value: "changed-mind", label: "Changed mind" },
  { value: "sizing", label: "Size / fit" },
  { value: "quality", label: "Not as expected" },
  { value: "other", label: "Other" },
]

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
  /** Why the customer brought it back. Required at the till from POS-1. */
  reason?: ReturnReason
  /** Free-text detail, especially for `reason === "other"`. */
  reasonNote?: string
}

const DRAFTS_KEY = "pos:drafts"
const INVOICES_KEY = "pos:invoices"
const RETURNS_KEY = "pos:returns"
// Bumped to v2 when product images switched from
// /placeholder.svg to real Unsplash photos. The key suffix forces a
// re-seed for users whose localStorage still holds the placeholder
// catalog from a previous session.
const CATALOG_KEY = "pos:catalog:mode:v6"

// -------------- KV Helpers --------------
// Backed by src/lib/storage/kv.ts — reads are sync (localStorage),
// writes mirror to @tauri-apps/plugin-store on native so drafts /
// invoices / returns survive app reinstalls + WebView eviction.
function getLS<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback
  const v = kvJson.get<T>(key)
  return v ?? fallback
}
function setLS<T>(key: string, value: T) {
  if (typeof window === "undefined") return
  // Fire-and-forget. localStorage is updated synchronously inside
  // kv.set; the Preferences mirror happens in the background.
  void kvJson.set(key, value)
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
  // Product photography pulled from Unsplash via their CDN. Each URL
  // pins a specific photo id so the catalog tile shows the same image
  // every time (no random "Source.unsplash" lottery). `w=320&q=80` is
  // a sweet spot for crisp tiles + 4G-friendly bytes.
  const items: CatalogItem[] = [
    {
      id: "p1",
      barcode: "0123456789012",
      sku: "AP-4012",
      name: "Cotton Tee - Black",
      price: 12.5,
      taxRate: commonTax,
      image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=320&h=320&fit=crop&auto=format&q=80",
      category: "Apparel",
      brand: "BasicCo",
      stock: 120,
      tags: ["clothing", "retail"],
      // POS-2 demo: a sized garment. XL costs a touch more.
      variantAxes: [{ name: "Size", values: ["S", "M", "L", "XL"] }],
      variants: [
        { sku: "AP-4012-S", axisValues: { Size: "S" }, stock: 30 },
        { sku: "AP-4012-M", axisValues: { Size: "M" }, stock: 42 },
        { sku: "AP-4012-L", axisValues: { Size: "L" }, stock: 33 },
        { sku: "AP-4012-XL", axisValues: { Size: "XL" }, priceDelta: 1.5, stock: 15 },
      ],
    },
    {
      id: "p2",
      barcode: "0123456789016",
      sku: "EL-1001",
      name: "Wireless Mouse",
      price: 19.99,
      taxRate: commonTax,
      image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=320&h=320&fit=crop&auto=format&q=80",
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
      image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=320&h=320&fit=crop&auto=format&q=80",
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
      image: "https://images.unsplash.com/photo-1580959375944-abd7e991f971?w=320&h=320&fit=crop&auto=format&q=80",
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
      image: "https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=320&h=320&fit=crop&auto=format&q=80",
      category: "Drinks",
      brand: "Kitchen",
      stock: 9999,
      tags: ["food", "restaurant"],
      // POS-2 demo: pick a milk (required), add extras (optional).
      modifierGroups: [
        {
          id: "milk",
          name: "Milk",
          required: true,
          multiSelect: false,
          options: [
            { name: "Whole", priceDelta: 0 },
            { name: "Oat", priceDelta: 0.5 },
            { name: "Almond", priceDelta: 0.5 },
          ],
        },
        {
          id: "extras",
          name: "Extras",
          required: false,
          multiSelect: true,
          options: [
            { name: "Extra shot", priceDelta: 0.8 },
            { name: "Vanilla syrup", priceDelta: 0.5 },
            { name: "Decaf", priceDelta: 0 },
          ],
        },
      ],
    },
    {
      id: "p6",
      sku: "APRT-8820",
      name: "Brake Pads Set",
      price: 65.0,
      taxRate: commonTax,
      image: "https://images.unsplash.com/photo-1607860108855-64acf2078ed9?w=320&h=320&fit=crop&auto=format&q=80",
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
      image: "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=320&h=320&fit=crop&auto=format&q=80",
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
      image: "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=320&h=320&fit=crop&auto=format&q=80",
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
      image: "https://images.unsplash.com/photo-1625948515291-69613efd103f?w=320&h=320&fit=crop&auto=format&q=80",
      category: "Electronics",
      brand: "Gizmo",
      stock: 48,
      tags: ["electronics", "retail"],
    },

    // ---- Extended catalog (added in v3) ----
    // Apparel
    { id: "p10", sku: "AP-4115", name: "Linen Shirt", price: 28, taxRate: commonTax,
      image: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=320&h=320&fit=crop&auto=format&q=80",
      category: "Apparel", brand: "BasicCo", stock: 48, tags: ["clothing", "retail"] },
    { id: "p11", sku: "AP-4220", name: "Denim Jacket", price: 55, taxRate: commonTax,
      image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=320&h=320&fit=crop&auto=format&q=80",
      category: "Apparel", brand: "BasicCo", stock: 26, tags: ["clothing", "retail"] },
    { id: "p12", sku: "AP-5001", name: "Sneakers · White", price: 65, taxRate: commonTax,
      image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=320&h=320&fit=crop&auto=format&q=80",
      category: "Apparel", brand: "Stride", stock: 32, tags: ["clothing", "retail"] },
    { id: "p13", sku: "AP-5012", name: "Baseball Cap", price: 14, taxRate: commonTax,
      image: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=320&h=320&fit=crop&auto=format&q=80",
      category: "Apparel", brand: "BasicCo", stock: 78, tags: ["clothing", "retail"] },

    // Electronics
    { id: "p14", sku: "EL-1102", name: "Bluetooth Speaker", price: 42, taxRate: commonTax,
      image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=320&h=320&fit=crop&auto=format&q=80",
      category: "Electronics", brand: "Gizmo", stock: 38, tags: ["electronics", "retail"] },
    { id: "p15", sku: "EL-1305", name: "Phone Charger 20W", price: 18, taxRate: commonTax,
      image: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=320&h=320&fit=crop&auto=format&q=80",
      category: "Electronics", brand: "Volt", stock: 102, tags: ["electronics", "retail"] },
    { id: "p16", sku: "EL-2402", name: "Laptop Stand", price: 35, taxRate: commonTax,
      image: "https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=320&h=320&fit=crop&auto=format&q=80",
      category: "Electronics", brand: "Gizmo", stock: 24, tags: ["electronics", "retail"] },
    { id: "p17", sku: "EL-2500", name: "Power Bank 20k", price: 32, taxRate: commonTax,
      image: "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=320&h=320&fit=crop&auto=format&q=80",
      category: "Electronics", brand: "Volt", stock: 60, tags: ["electronics", "retail"] },
    { id: "p18", sku: "EL-2811", name: "HDMI Cable 2m", price: 9, taxRate: commonTax,
      image: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=320&h=320&fit=crop&auto=format&q=80",
      category: "Electronics", brand: "Volt", stock: 140, tags: ["electronics", "retail"] },

    // Beauty
    { id: "p19", sku: "BT-9205", name: "Lip Balm Trio", price: 12, taxRate: commonTax,
      image: "https://images.unsplash.com/photo-1607779097040-26e80aa78e66?w=320&h=320&fit=crop&auto=format&q=80",
      category: "Beauty", brand: "Glow", stock: 88, tags: ["beauty", "retail"] },
    { id: "p20", sku: "BT-9410", name: "Body Lotion 250ml", price: 16, taxRate: commonTax,
      image: "https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=320&h=320&fit=crop&auto=format&q=80",
      category: "Beauty", brand: "Glow", stock: 52, tags: ["beauty", "retail"] },
    { id: "p21", sku: "BT-9606", name: "Clay Face Mask", price: 14, taxRate: commonTax,
      image: "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=320&h=320&fit=crop&auto=format&q=80",
      category: "Beauty", brand: "Glow", stock: 41, tags: ["beauty", "retail"] },

    // Main course / restaurant
    { id: "p22", sku: "FO-201", name: "Jollof Rice Plate", price: 6, taxRate: 0.1,
      image: "https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?w=320&h=320&fit=crop&auto=format&q=80",
      category: "Main course", brand: "Kitchen", stock: 9999, tags: ["food", "restaurant"] },
    { id: "p23", sku: "FO-220", name: "Suya Plate", price: 8.5, taxRate: 0.1,
      image: "https://images.unsplash.com/photo-1633237308525-cd587cf71926?w=320&h=320&fit=crop&auto=format&q=80",
      category: "Main course", brand: "Kitchen", stock: 9999, tags: ["food", "restaurant"] },
    { id: "p24", sku: "FO-310", name: "Pizza Margherita", price: 11, taxRate: 0.1,
      image: "https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?w=320&h=320&fit=crop&auto=format&q=80",
      category: "Main course", brand: "Kitchen", stock: 9999, tags: ["food", "restaurant"] },
    { id: "p25", sku: "FO-420", name: "Chicken Sandwich", price: 7, taxRate: 0.1,
      image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=320&h=320&fit=crop&auto=format&q=80",
      category: "Main course", brand: "Kitchen", stock: 9999, tags: ["food", "restaurant"] },

    // Drinks
    { id: "p26", sku: "DR-308", name: "Mango Smoothie", price: 5, taxRate: 0.1,
      image: "https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?w=320&h=320&fit=crop&auto=format&q=80",
      category: "Drinks", brand: "Kitchen", stock: 9999, tags: ["food", "restaurant"] },
    { id: "p27", sku: "DR-412", name: "Cappuccino", price: 3.8, taxRate: 0.1,
      image: "https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=320&h=320&fit=crop&auto=format&q=80",
      category: "Drinks", brand: "Kitchen", stock: 9999, tags: ["food", "restaurant"] },
    { id: "p28", sku: "DR-520", name: "Bottled Water 500ml", price: 1.5, taxRate: 0.1,
      image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=320&h=320&fit=crop&auto=format&q=80",
      category: "Drinks", brand: "Kitchen", stock: 9999, tags: ["food", "restaurant"] },
    { id: "p29", sku: "DR-611", name: "Fresh Orange Juice", price: 4.5, taxRate: 0.1,
      image: "https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=320&h=320&fit=crop&auto=format&q=80",
      category: "Drinks", brand: "Kitchen", stock: 9999, tags: ["food", "restaurant"] },

    // Auto Parts
    { id: "p30", sku: "APRT-9000", name: "Engine Oil 5L", price: 35, taxRate: commonTax,
      image: "https://images.unsplash.com/photo-1623874514711-0f321325f318?w=320&h=320&fit=crop&auto=format&q=80",
      category: "Auto Parts", brand: "AutoMax", stock: 44, tags: ["auto", "mechanic"] },
    { id: "p31", sku: "APRT-9120", name: "Spark Plug · 4 pack", price: 22, taxRate: commonTax,
      image: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=320&h=320&fit=crop&auto=format&q=80",
      category: "Auto Parts", brand: "AutoMax", stock: 36, tags: ["auto", "mechanic"] },
    { id: "p32", sku: "APRT-9230", name: "Cabin Air Filter", price: 18, taxRate: commonTax,
      image: "https://images.unsplash.com/photo-1486006920555-c77dcf18193c?w=320&h=320&fit=crop&auto=format&q=80",
      category: "Auto Parts", brand: "AutoMax", stock: 50, tags: ["auto", "mechanic"] },

    // Services
    { id: "p33", sku: "HS-305", name: "Manicure", price: 18, taxRate: commonTax,
      image: "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=320&h=320&fit=crop&auto=format&q=80",
      category: "Services", brand: "Salon", stock: 9999, tags: ["salon", "services"] },
    { id: "p34", sku: "HS-410", name: "Pedicure", price: 22, taxRate: commonTax,
      image: "https://images.unsplash.com/photo-1601412436009-d964bd02edbc?w=320&h=320&fit=crop&auto=format&q=80",
      category: "Services", brand: "Salon", stock: 9999, tags: ["salon", "services"] },
    { id: "p35", sku: "HS-520", name: "Men's Haircut", price: 15, taxRate: commonTax,
      image: "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=320&h=320&fit=crop&auto=format&q=80",
      category: "Services", brand: "Salon", stock: 9999, tags: ["salon", "services"] },

    // Gifts / Home
    { id: "p36", sku: "HM-2310", name: "Scented Candle", price: 18, taxRate: commonTax,
      image: "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=320&h=320&fit=crop&auto=format&q=80",
      category: "Gifts", brand: "Homey", stock: 64, tags: ["gifts", "retail"] },
    { id: "p37", sku: "HM-2412", name: "Notebook A5", price: 9, taxRate: commonTax,
      image: "https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=320&h=320&fit=crop&auto=format&q=80",
      category: "Gifts", brand: "Homey", stock: 120, tags: ["gifts", "retail"] },
    { id: "p38", sku: "HM-2511", name: "Canvas Tote Bag", price: 12, taxRate: commonTax,
      image: "https://images.unsplash.com/photo-1597481499750-3e6b22637e12?w=320&h=320&fit=crop&auto=format&q=80",
      category: "Gifts", brand: "Homey", stock: 88, tags: ["gifts", "retail"] },
  ]
  const key = `${CATALOG_KEY}:${mode}`
  const ls = getLS<CatalogItem[] | null>(key, null)
  // Reseed when nothing is cached OR when the cached catalog is
  // shorter than the latest seed (covers the case where a previous
  // version's HMR cached an older items[] under the same versioned
  // key before the bundle finished updating).
  if (!ls || ls.length < items.length) setLS(key, items)
  return getLS<CatalogItem[]>(key, items)
}

// Quick-add a new product to the catalog for a given mode. Used by the
// item-not-found dialog ("scanned a barcode we don't know — add it
// now?"). Dedupes by SKU. Returns the stored item. POS-1.
export function addCatalogItem(
  mode: "retail" | "restaurant" | "services" | "auto",
  item: Omit<CatalogItem, "id"> & { id?: string },
): CatalogItem {
  const key = `${CATALOG_KEY}:${mode}`
  const list = loadCatalog(mode)
  const existing = list.find((c) => c.sku.toLowerCase() === item.sku.toLowerCase())
  if (existing) return existing
  const stored: CatalogItem = { id: item.id ?? genId("p"), ...item }
  setLS(key, [stored, ...list])
  return stored
}

// Credit (or debit) on-hand stock for a SKU across every mode's catalog.
// Used when a return is finalised to put returned units back on the
// shelf. Skips the UNLIMITED_STOCK (9999) sentinel — services and menu
// dishes aren't quantity-tracked. POS-5.
export function adjustStock(sku: string, delta: number) {
  const modes = ["retail", "restaurant", "services", "auto"] as const
  for (const mode of modes) {
    const key = `${CATALOG_KEY}:${mode}`
    const list = getLS<CatalogItem[] | null>(key, null)
    if (!list) continue
    let changed = false
    for (const it of list) {
      if (it.sku === sku && typeof it.stock === "number" && it.stock < 9999) {
        it.stock = Math.max(0, it.stock + delta)
        changed = true
      }
    }
    if (changed) setLS(key, list)
  }
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
