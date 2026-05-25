import { kvJson } from "@/lib/storage/kv"

// First-run business profile (App Wave 3). One light question — "what do
// you sell, and in what kind of business" — lets Pallio tailor the
// onboarding order and a few smart defaults WITHOUT hiding anything. The
// whole app stays available; the profile only changes emphasis. Never
// use this to gate features (see memory: no-hard-modules).

export type IndustryKey = "retail" | "food" | "services" | "auto" | "manufacturing" | "other"
export type SellsKind = "products" | "services" | "both"

export type BusinessProfile = {
  industry: IndustryKey
  sells: SellsKind
  setAt: number
}

export type IndustryDef = {
  key: IndustryKey
  label: string
  /** lucide icon name handled by the UI; kept as a hint string here. */
  blurb: string
  /** Default POS business mode for this industry. */
  posMode: "retail" | "restaurant" | "services" | "auto"
  /** Personal onboarding step keys most relevant first, highest priority first. */
  prioritySteps: string[]
  /** Sensible starter categories (used as smart defaults / hints). */
  sampleCategories: string[]
}

export const INDUSTRIES: IndustryDef[] = [
  {
    key: "retail",
    label: "Shop / Retail",
    blurb: "Clothing, electronics, gifts, groceries.",
    posMode: "retail",
    prioritySteps: ["first-item", "first-sale", "first-po", "launch-storefront", "first-campaign", "talk-to-ai", "first-withdrawal"],
    sampleCategories: ["Apparel", "Electronics", "Home", "Gifts"],
  },
  {
    key: "food",
    label: "Food & Drink",
    blurb: "Restaurant, café, bar, bakery, kitchen.",
    posMode: "restaurant",
    prioritySteps: ["first-item", "first-sale", "first-po", "talk-to-ai", "launch-storefront", "first-campaign", "first-withdrawal"],
    sampleCategories: ["Main course", "Drinks", "Sides", "Desserts"],
  },
  {
    key: "services",
    label: "Services / Salon",
    blurb: "Salon, spa, repair, consulting, bookings.",
    posMode: "services",
    prioritySteps: ["first-item", "first-sale", "talk-to-ai", "first-campaign", "launch-storefront", "first-po", "first-withdrawal"],
    sampleCategories: ["Services", "Add-ons", "Products"],
  },
  {
    key: "auto",
    label: "Auto / Parts",
    blurb: "Mechanic, parts shop, workshop.",
    posMode: "auto",
    prioritySteps: ["first-item", "first-po", "first-sale", "talk-to-ai", "launch-storefront", "first-campaign", "first-withdrawal"],
    sampleCategories: ["Auto Parts", "Fluids", "Service"],
  },
  {
    key: "manufacturing",
    label: "Maker / Manufacturer",
    blurb: "Bakery, cosmetics, assembly, production.",
    posMode: "retail",
    prioritySteps: ["first-item", "first-po", "first-sale", "talk-to-ai", "launch-storefront", "first-campaign", "first-withdrawal"],
    sampleCategories: ["Raw materials", "Finished goods", "Packaging"],
  },
  {
    key: "other",
    label: "Something else",
    blurb: "A mix, or none of the above.",
    posMode: "retail",
    prioritySteps: ["first-item", "first-sale", "first-po", "launch-storefront", "first-campaign", "talk-to-ai", "first-withdrawal"],
    sampleCategories: [],
  },
]

const KEY = "pallio:business-profile:v1"

export function loadBusinessProfile(): BusinessProfile | null {
  return kvJson.get<BusinessProfile>(KEY) ?? null
}

export function saveBusinessProfile(p: Omit<BusinessProfile, "setAt">) {
  void kvJson.set(KEY, { ...p, setAt: Date.now() })
  window.dispatchEvent(new CustomEvent("pallio:business-profile-changed"))
}

export function industryDef(key?: IndustryKey): IndustryDef {
  return INDUSTRIES.find((i) => i.key === key) ?? INDUSTRIES[INDUSTRIES.length - 1]!
}

// Reorder a set of step keys so the profile's priorities come first,
// preserving any not listed. App Wave 3.
export function orderStepsForProfile(stepKeys: string[], profile: BusinessProfile | null): string[] {
  if (!profile) return stepKeys
  const priority = industryDef(profile.industry).prioritySteps
  const rank = (k: string) => {
    const i = priority.indexOf(k)
    return i === -1 ? priority.length + stepKeys.indexOf(k) : i
  }
  return [...stepKeys].sort((a, b) => rank(a) - rank(b))
}
