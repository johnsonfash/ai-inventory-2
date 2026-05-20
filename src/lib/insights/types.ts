// Shape of a single AI-style insight surfaced to the user. The
// dummy generator in ./engine.ts produces these from rule-based
// heuristics over the existing mock data; the same shape will land
// from a real backend once one exists (server-side ML, anomaly
// detection, etc.) so the UI doesn't have to change.

export type InsightSeverity =
  | "good"     // positive signal (top mover, healthy ROAS) — emerald
  | "info"     // neutral notice (forecast update) — sky / brand
  | "warning"  // soft action needed (low stock, margin drift) — amber
  | "critical" // urgent (out of stock for a top seller, vendor late) — rose

export type InsightCategory =
  | "stock"
  | "sales"
  | "purchasing"
  | "marketing"
  | "cashflow"
  | "team"
  | "forecast"
  | "system"

export type Insight = {
  /** Stable id so the UI can key on it. */
  id: string
  /** Short headline, max ~60 chars. Renders as the card title. */
  title: string
  /** One-sentence body explaining the why + impact. */
  body: string
  /** Category drives the icon. */
  category: InsightCategory
  /** Severity drives the colour + sort priority. */
  severity: InsightSeverity
  /** ISO timestamp the insight was generated. */
  generatedAt: string
  /** Optional metric chip on the card (e.g. "+24%", "$1,840", "3 days late"). */
  metric?: string
  /** Optional CTA — route to navigate to + label. */
  action?: { label: string; href: string }
  /** Optional tiny inline sparkline data for trend lines. 4-10 points. */
  sparkline?: number[]
}
