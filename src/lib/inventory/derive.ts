import type { CatalogItem } from "@/lib/pos/storage"

// Cue-based, industry-agnostic derivations shared by the inventory pages
// (see memory: industry-agnostic-derivations). Extracted so the main
// inventory list AND its sub-pages (units, warranties) derive the same
// values from the one POS catalog instead of each keeping a mock.

export const UNLIMITED_STOCK = 9999

// Unit of measure from category + tags. Order matters — most specific
// first. Default "pcs" works for anything sold one-at-a-time.
export function deriveUnit(c: CatalogItem): string {
  const sig = `${c.category ?? ""} ${(c.tags ?? []).join(" ")}`.toLowerCase()
  if (/\b(serv|service|consult|hour|hr)\b/.test(sig)) return "hr"
  if (/\b(food|meal|dish|course|side|dessert|menu)\b/.test(sig)) return "serv"
  if (/\b(drink|beverage|coffee|tea|juice|wine|spirit)\b/.test(sig)) return "btl"
  if (/\b(perfume|fragrance|cologne|oil|serum|tonic|lotion)\b/.test(sig)) return "btl"
  if (/\b(flour|sugar|salt|rice|grain|powder|spice|seasoning)\b/.test(sig)) return "kg"
  if (/\b(fabric|textile|cloth|leather|yarn|rope|cable|wire|hose)\b/.test(sig)) return "m"
  if (/\b(paint|fuel|oil|coolant|liquid)\b/.test(sig)) return "l"
  if (/\b(grocer|bag|sack|pack|carton)\b/.test(sig)) return "pkg"
  if (/\b(set|kit|bundle)\b/.test(sig)) return "set"
  if (/\b(dozen)\b/.test(sig)) return "dz"
  return "pcs"
}

// Human label + coarse measure-type for a unit code (used by the units page).
export function unitMeta(code: string): { name: string; type: "discrete" | "weight" | "volume" | "length" | "time" } {
  switch (code) {
    case "kg": return { name: "Kilogram", type: "weight" }
    case "l": return { name: "Litre", type: "volume" }
    case "btl": return { name: "Bottle", type: "volume" }
    case "m": return { name: "Metre", type: "length" }
    case "hr": return { name: "Hour", type: "time" }
    case "serv": return { name: "Serving", type: "discrete" }
    case "pkg": return { name: "Package", type: "discrete" }
    case "set": return { name: "Set", type: "discrete" }
    case "dz": return { name: "Dozen", type: "discrete" }
    default: return { name: "Piece", type: "discrete" }
  }
}

// Warranty default. Most items have none ("—") so the column never lies.
export function deriveWarranty(c: CatalogItem): string {
  const sig = `${c.category ?? ""} ${(c.tags ?? []).join(" ")}`.toLowerCase()
  if (/\b(electronic|appliance|gadget|computer|phone)\b/.test(sig)) return "24 mo"
  if (/\b(auto|car|vehicle|motorcycle|tyre)\b/.test(sig)) return "12 mo"
  if (/\b(home|furniture|kitchen)\b/.test(sig)) return "6 mo"
  if (/\b(sport|fitness|outdoor)\b/.test(sig)) return "6 mo"
  if (/\b(machinery|equipment|tool|power-tool)\b/.test(sig)) return "12 mo"
  return "—"
}
