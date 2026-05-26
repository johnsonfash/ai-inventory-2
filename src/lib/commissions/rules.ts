import { kvJson } from "@/lib/storage/kv"

// Commission rule engine (config). Defines how a commission RATE is
// chosen for a sale or an affiliate order, so rates aren't hand-typed
// per payout. Persisted to kv; backend will own this + apply it when it
// computes commissions. The frontend uses `resolveSaleRate` to show the
// effective rate in the rules editor's live preview.

export type Tier = { threshold: number; rate: number } // period revenue >= threshold ⇒ rate (%)
export type RepOverride = { name: string; rate: number }

export type CommissionRules = {
  defaultSaleRate: number       // % for sales reps with no tier/override match
  defaultAffiliateRate: number  // % for affiliate orders
  tiers: Tier[]                 // performance tiers (sales); highest matching threshold wins
  repOverrides: RepOverride[]   // a specific person's rate, beats tiers + default
}

export const DEFAULT_RULES: CommissionRules = {
  defaultSaleRate: 5,
  defaultAffiliateRate: 10,
  tiers: [
    { threshold: 1_000_000, rate: 6 },
    { threshold: 2_000_000, rate: 7 },
  ],
  repOverrides: [],
}

const KEY = "pallio:commission-rules:v1"
export const RULES_CHANGED = "pallio:commission-rules-changed"

export function loadCommissionRules(): CommissionRules {
  return kvJson.get<CommissionRules>(KEY) ?? DEFAULT_RULES
}

export function saveCommissionRules(rules: CommissionRules): void {
  void kvJson.set(KEY, rules)
  window.dispatchEvent(new CustomEvent(RULES_CHANGED))
}

// Effective sales-rep rate for a given period revenue: a per-rep override
// wins; otherwise the highest tier whose threshold is met; otherwise the
// default. Affiliates use the flat affiliate rate.
export function resolveSaleRate(rules: CommissionRules, periodRevenue: number, repName?: string): number {
  const override = repName ? rules.repOverrides.find((r) => r.name.trim().toLowerCase() === repName.trim().toLowerCase()) : undefined
  if (override) return override.rate
  const tier = [...rules.tiers]
    .filter((t) => periodRevenue >= t.threshold)
    .sort((a, b) => b.threshold - a.threshold)[0]
  return tier?.rate ?? rules.defaultSaleRate
}
