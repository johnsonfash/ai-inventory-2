import * as React from "react"
import { Link } from "react-router-dom"
import {
  ArrowRight,
  ArrowUpRight,
  ExternalLink,
  Eye,
  Globe,
  ShoppingBag,
  Smartphone,
  TrendingUp,
  Users,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { StatusBadge, type StatusTone } from "@/components/lists/status-badge"
import { InfoTooltip } from "@/components/info-tooltip"
import { getStorefrontState, TEMPLATES_BY_ID } from "@/lib/storefront/data"
import { useCurrency } from "@/contexts/currency"
import { cn } from "@/lib/utils"

// Snapshot of the hosted storefront, surfaced on the main dashboard
// so the owner sees their online shop's pulse without leaving home.
// Falls back to a "set me up" CTA if no template is active.

const MOCK_STATS = {
  revenue24h:   142_500,
  visitors24h:    420,
  orders24h:        8,
  pendingOrders:   12,
  conversionPct:   4.2,
  topProductName: "Hydrating Serum",
  topProductRev:  68_400,
}

export function StorefrontSnapshot() {
  const { formatPrice } = useCurrency()
  const state = React.useMemo(() => getStorefrontState(), [])
  const template = state.templateId ? TEMPLATES_BY_ID[state.templateId] : null

  // ---------- not set up ----------
  if (!template) {
    return (
      <Card>
        <CardContent className="relative overflow-hidden p-4 md:p-5">
          <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-gradient-to-br from-brand/25 via-fuchsia-500/15 to-transparent blur-3xl" aria-hidden />
          <div className="relative flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand to-fuchsia-500 text-white shadow-sm shadow-brand/30">
                <Globe className="h-4 w-4" />
              </span>
              <div>
                <p className="text-sm font-semibold md:text-base">Launch your online shop</p>
                <p className="mt-0.5 text-[11px] text-muted-foreground md:text-xs">
                  Pick from our gallery of hand-tuned templates and Pallio publishes a real, hosted storefront at <span className="font-mono">your-name.pallio.shop</span> in under a minute.
                </p>
              </div>
            </div>
            <Link to="/storefront/templates">
              <Button size="sm">Browse templates <ArrowRight className="h-3.5 w-3.5" /></Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    )
  }

  // ---------- active ----------
  const liveUrl = state.customDomain ?? `${state.subdomain}.pallio.shop`

  return (
    <Card>
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white shadow-sm"
              style={{ background: template.colors.primary }}
            >
              <Globe className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <div className="flex items-baseline gap-1.5">
                <h3 className="text-sm font-semibold md:text-base">Storefront</h3>
                <InfoTooltip label="Storefront snapshot" size="xs">
                  Live 24-hour view of your hosted shop — revenue,
                  visitors, conversion. Tap any tile to drill in.
                </InfoTooltip>
              </div>
              <a
                href={`https://${liveUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-mono text-[11px] text-muted-foreground hover:text-brand dark:hover:text-primary"
              >
                {liveUrl}
                <ExternalLink className="h-2.5 w-2.5" />
              </a>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge tone={state.published ? "success" : "neutral"} withDot>
              {state.published ? "live" : "paused"}
            </StatusBadge>
            <Link to="/storefront">
              <Button size="sm" variant="ghost">
                Manage <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </div>

        {/* 4-tile snapshot */}
        <div className="mt-4 grid grid-cols-2 gap-2 md:grid-cols-4">
          {([
            { Icon: TrendingUp,  label: "Revenue (24h)", value: formatPrice(MOCK_STATS.revenue24h), delta: "+18%", tone: "success" as const, href: "/storefront/analytics" },
            { Icon: Eye,         label: "Visitors",      value: MOCK_STATS.visitors24h.toLocaleString(), delta: "+12%", tone: "info"    as const, href: "/storefront/analytics" },
            { Icon: ShoppingBag, label: "Orders",        value: String(MOCK_STATS.orders24h), delta: `${MOCK_STATS.pendingOrders} pending`, tone: "warning" as const, href: "/storefront/orders" },
            { Icon: Users,       label: "Conversion",    value: `${MOCK_STATS.conversionPct}%`, delta: "+0.4pp", tone: "brand" as const, href: "/storefront/analytics" },
          ] as const).map((s) => (
            <Link
              key={s.label}
              to={s.href}
              className="group flex flex-col gap-1 rounded-xl border border-border bg-background p-2.5 transition-colors hover:border-brand/40 hover:bg-accent/40"
            >
              <div className="flex items-center justify-between">
                <span className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-lg",
                  s.tone === "brand"   && "bg-brand-soft text-brand dark:bg-primary/15 dark:text-primary",
                  s.tone === "success" && "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
                  s.tone === "info"    && "bg-sky-500/15 text-sky-700 dark:text-sky-300",
                  s.tone === "warning" && "bg-amber-500/15 text-amber-700 dark:text-amber-300",
                )}>
                  <s.Icon className="h-3.5 w-3.5" />
                </span>
                <ArrowUpRight className="h-3 w-3 text-muted-foreground/70 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{s.label}</p>
              <p className="text-base font-bold tabular-nums leading-tight">{s.value}</p>
              <p className={cn(
                "text-[10px] tabular-nums",
                s.delta.startsWith("+") && "text-emerald-700 dark:text-emerald-300",
                s.delta.startsWith("-") && "text-rose-700 dark:text-rose-300",
                !s.delta.match(/^[+-]/) && "text-muted-foreground",
              )}>
                {s.delta}
              </p>
            </Link>
          ))}
        </div>

        {/* Top product line */}
        <div className="mt-3 flex items-center justify-between gap-2 rounded-xl border border-dashed border-border bg-muted/20 p-2.5 text-xs">
          <div className="flex items-center gap-2">
            <Smartphone className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-muted-foreground">Top seller today:</span>
            <span className="font-semibold">{MOCK_STATS.topProductName}</span>
            <span className="font-bold tabular-nums">· {formatPrice(MOCK_STATS.topProductRev)}</span>
          </div>
          <Link to="/storefront/products" className="text-[11px] font-semibold text-brand hover:underline dark:text-primary">
            All products →
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
