// Variants + modifiers — the product-structure spine for POS-2.
//
// Deliberately generic so one model serves every industry (see
// CLAUDE.md "industry-agnostic"):
//   - Apparel: axes Size + Colour; variants are the sellable SKUs.
//   - Food:    a "Pizza" with a Size axis + modifier groups (extra
//              cheese, no onions).
//   - Salon:   a "Colour treatment" with add-on modifiers (toner, gloss).
//   - Auto:    a part with a "Fitment" axis.
// The visible product is the parent; variant SKUs are the leaves.

export type VariantAxis = {
  /** e.g. "Size", "Colour", "Fitment", "Region". */
  name: string
  values: string[]
}

export type Variant = {
  /** The sellable leaf SKU. */
  sku: string
  /** One value per axis, keyed by axis name: { Size: "M", Colour: "Black" }. */
  axisValues: Record<string, string>
  /** Absolute price; when set it overrides the parent price entirely. */
  price?: number
  /** Added to the parent price when `price` is not set (e.g. +₦500 for XL). */
  priceDelta?: number
  stock?: number
  barcode?: string
}

export type ModifierOption = {
  name: string
  /** Added to the line price. Can be 0 (e.g. "no onions") or negative. */
  priceDelta: number
}

export type ModifierGroup = {
  id: string
  /** e.g. "Extras", "Milk", "Add-ons". */
  name: string
  /** Must the cashier choose at least one before adding to cart? */
  required: boolean
  /** Allow more than one option from this group. */
  multiSelect: boolean
  options: ModifierOption[]
}

/** A modifier choice carried on a cart line. */
export type SelectedModifier = {
  groupId: string
  name: string
  priceDelta: number
}

export function variantLabel(v: Variant, axes?: VariantAxis[]): string {
  const order = axes?.map((a) => a.name) ?? Object.keys(v.axisValues)
  return order.map((name) => v.axisValues[name]).filter(Boolean).join(" / ")
}

export function variantUnitPrice(basePrice: number, v?: Variant): number {
  if (!v) return basePrice
  if (typeof v.price === "number") return v.price
  return basePrice + (v.priceDelta ?? 0)
}

export function modifiersTotal(mods?: SelectedModifier[]): number {
  if (!mods?.length) return 0
  return mods.reduce((s, m) => s + m.priceDelta, 0)
}

export function modifiersLabel(mods?: SelectedModifier[]): string {
  if (!mods?.length) return ""
  return mods.map((m) => m.name).join(", ")
}
