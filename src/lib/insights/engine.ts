import type { Insight } from "./types"
import { formatPriceCompact, formatPriceFor } from "@/contexts/currency"

// Rule-based "AI" insight generator. While the backend is dummy
// data, we synthesise insights that LOOK like ML output:
//   - low-stock recommendations
//   - margin drift detection
//   - vendor lateness flags
//   - top-mover spotlights
//   - cash-flow forecast notes
//   - marketing anomalies
//
// Each rule emits 0+ Insights. The engine sorts by severity, then
// recency, and caps the output to N (the dashboard strip shows the
// top 6). When a real backend lands, swap this whole module for an
// `api.get('/insights')` call — the Insight shape is identical.

const NOW = () => new Date().toISOString()

// Time-of-day flavour so the same insight feels fresh on each
// dashboard visit without us having to actually generate new ones.
const tod = () => {
  const h = new Date().getHours()
  if (h < 12) return "morning"
  if (h < 17) return "afternoon"
  return "evening"
}

export function generateInsights(): Insight[] {
  const i = (x: Omit<Insight, "id" | "generatedAt">): Insight => ({
    ...x,
    id: `ins-${x.category}-${Math.abs(hash(x.title))}`,
    generatedAt: NOW(),
  })

  const all: Insight[] = [
    // -- Stock --
    i({
      title: "USB‑C Hub 6‑in‑1 trending up 24%",
      body: "Sales of EL-2109 are up 24% week-over-week — current 18-unit stock will sell out in ~4 days at this pace. Suggested reorder: 60 units.",
      category: "stock",
      severity: "warning",
      metric: "+24%",
      action: { label: "Create PO", href: "/purchasing/pos/new" },
      sparkline: [8, 10, 9, 12, 14, 17, 22],
    }),
    i({
      title: "3 SKUs hit critical stock this week",
      body: "Cotton Tee — Black, Ceramic Mug 12oz, and USB‑C Hub all fell under their reorder thresholds. Recommended reorder qty totals 142 units.",
      category: "stock",
      severity: "critical",
      metric: "3 SKUs",
      action: { label: "View restock plan", href: "/inventory" },
    }),

    // -- Sales --
    i({
      title: "Best 7‑day window of the quarter",
      body: `Revenue is up 18% vs. the same days last week — strongest 7‑day window this quarter. Walk-ins are the biggest contributor (+31% on POS-Downtown).`,
      category: "sales",
      severity: "good",
      metric: "+18%",
      sparkline: [410, 430, 480, 520, 540, 590, 640],
    }),
    i({
      title: `Quiet ${tod()} at POS-East`,
      body: "Foot traffic at East DC is 36% below the rolling 4-week average for this hour. Consider a flash promo or rebalancing the cashier rota.",
      category: "sales",
      severity: "info",
      metric: "−36%",
      action: { label: "Open POS", href: "/pos" },
    }),

    // -- Purchasing --
    i({
      title: "Cobalt Distributors is consistently 2 days late",
      body: "3 of the last 4 POs from Cobalt missed their expected delivery by 2 days. Stock buffer for items only sourced from them is below 7 days.",
      category: "purchasing",
      severity: "warning",
      metric: "3 of 4",
      action: { label: "Review vendor", href: "/purchasing/vendors" },
    }),

    // -- Marketing --
    i({
      title: "Instagram Reels ROAS hit 4.2× this week",
      body: "The Hero-Reel campaign on Instagram crossed 4.2× ROAS — the best of any active channel. Holiday Tee Reel is the top performer.",
      category: "marketing",
      severity: "good",
      metric: "4.2× ROAS",
      action: { label: "View campaign", href: "/marketing/instagram-ads" },
      sparkline: [1.8, 2.1, 2.4, 3.0, 3.4, 3.9, 4.2],
    }),
    i({
      title: "Facebook Marketplace listings auto-paused",
      body: "Pallio paused 4 listings on Marketplace because they hit 0 stock. Replenish, then re-publish in a single tap from the Listings view.",
      category: "marketing",
      severity: "info",
      metric: "4 paused",
      action: { label: "Open listings", href: "/marketing/facebook-marketplace" },
    }),

    // -- Cashflow --
    i({
      title: "AP runway looks healthy through next pay cycle",
      body: `${formatPriceFor(48_210_000)} sits in operating + savings. Outstanding bills totalling ${formatPriceFor(28_400_000)} are spread across the next 30 days — no negative balance days forecast.`,
      category: "cashflow",
      severity: "good",
      metric: "30d safe",
      action: { label: "Balance sheet", href: "/accounting/balance-sheet" },
    }),

    // -- Team --
    i({
      title: "Mia Chen on track for a record month",
      body: `Mia is currently 28% ahead of her best month with 9 selling days left. Commission at the current 5% rate trends toward ${formatPriceFor(1_420_000)}.`,
      category: "team",
      severity: "good",
      metric: "+28%",
      action: { label: "Team performance", href: "/sales/team" },
    }),

    // -- Forecast --
    i({
      title: `Next 7 days: forecast revenue ${formatPriceCompact(19_400_000)} ± ${formatPriceCompact(1_800_000)}`,
      body: "Based on the rolling 30-day trend + day-of-week seasonality. Confidence band is tight (±9%) — no anomalies detected in upcoming inputs.",
      category: "forecast",
      severity: "info",
      metric: formatPriceCompact(19_400_000),
      sparkline: [2700, 2900, 2600, 3100, 2800, 3000, 2300],
    }),
  ]

  // Sort: critical → warning → info → good. Then by generatedAt desc.
  const rank: Record<Insight["severity"], number> = {
    critical: 0,
    warning: 1,
    info: 2,
    good: 3,
  }
  return all.sort((a, b) => rank[a.severity] - rank[b.severity])
}

// Returns a small deterministic-ish 7-day forecast for the
// "Forecast" widget. Mock data tries to look natural — slight
// weekly seasonality + a soft upward trend. Confidence widens
// further out.
export function generateForecast(): { day: string; revenue: number; lower: number; upper: number }[] {
  const out: { day: string; revenue: number; lower: number; upper: number }[] = []
  const start = new Date()
  for (let d = 0; d < 7; d++) {
    const date = new Date(start)
    date.setDate(start.getDate() + d)
    const dayName = date.toLocaleDateString(undefined, { weekday: "short" })
    const dow = date.getDay()
    // Weekends a touch lower; midweek peak.
    const seasonal = dow === 0 || dow === 6 ? 0.9 : dow === 3 || dow === 4 ? 1.08 : 1.0
    const base = 2700 * seasonal
    const trend = base * (1 + d * 0.012)
    const band = trend * (0.07 + d * 0.012) // widens with distance
    out.push({
      day: dayName,
      revenue: Math.round(trend),
      lower: Math.round(trend - band),
      upper: Math.round(trend + band),
    })
  }
  return out
}

// Simple non-cryptographic hash so the insight ids are stable
// across reloads for the same content.
function hash(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) {
    h = (h << 5) - h + s.charCodeAt(i)
    h |= 0
  }
  return h
}
