import { kvJson } from "@/lib/storage/kv"

// Customer-segment pricing (POS-2). Attaching a tier at the till flips
// every catalog price by the tier's adjustment — member, wholesale,
// employee, B2B. Generic across industries: a salon "VIP" rate, a shop
// "trade" price, a cafe "staff" discount are all the same primitive.
//
// Kept as a percentage adjustment for now (negative = cheaper). The
// backend can later store per-SKU tier overrides; the UI reads the
// resolved price either way.
export type PriceTier = {
  id: string
  name: string
  /** Percent applied to list price. -10 = 10% off, +5 = 5% surcharge. */
  adjustPercent: number
}

const KEY = "pos:price-tiers:v1"

export const DEFAULT_TIERS: PriceTier[] = [
  { id: "retail", name: "Retail", adjustPercent: 0 },
  { id: "member", name: "Member", adjustPercent: -10 },
  { id: "wholesale", name: "Wholesale", adjustPercent: -20 },
  { id: "employee", name: "Employee", adjustPercent: -25 },
]

export function loadTiers(): PriceTier[] {
  const stored = kvJson.get<PriceTier[]>(KEY)
  return stored && stored.length ? stored : DEFAULT_TIERS
}

export function saveTiers(tiers: PriceTier[]) {
  void kvJson.set(KEY, tiers)
}

export function tierMultiplier(tier?: PriceTier): number {
  if (!tier) return 1
  return 1 + tier.adjustPercent / 100
}
