import { BarChart3, Bell, CreditCard, Layers, MoreHorizontal, Package2, ShoppingCart, Sparkles } from "lucide-react"

// Inline Pallio app mock that renders INSIDE the phone frame on
// the landing page. Looks like a tiny dashboard — KPI strip + AI
// insight card + sparkline. Purely visual, no real data.
export function PhoneDashboardMock() {
  return (
    <div className="flex h-full w-full flex-col bg-background text-foreground">
      {/* Top bar */}
      <div className="flex items-center justify-between border-b border-border px-3 py-2">
        <span className="flex items-center gap-1.5">
          <span className="flex h-5 w-5 items-center justify-center rounded-md bg-gradient-to-br from-brand to-fuchsia-500 text-[9px] font-bold text-white">P</span>
          <span className="text-[11px] font-bold tracking-tight">Pallio</span>
        </span>
        <span className="text-[9px] uppercase tracking-wider text-muted-foreground">Dashboard</span>
        <Bell className="h-3.5 w-3.5 text-muted-foreground" />
      </div>

      {/* Hero strip */}
      <div className="m-2 rounded-xl border border-border bg-gradient-to-br from-brand-soft via-card to-emerald-50/40 p-2.5 dark:from-primary/10 dark:to-emerald-950/15">
        <p className="flex items-center gap-1 text-[8px] font-semibold uppercase tracking-wider text-brand dark:text-primary">
          <Sparkles className="h-2.5 w-2.5" /> Today
        </p>
        <p className="mt-0.5 text-[11px] font-bold leading-tight">
          Sales <span className="text-brand dark:text-primary">+12%</span> · ₦4.2M
        </p>
        <p className="text-[9px] text-muted-foreground">36 orders so far</p>
      </div>

      {/* KPI mini-tiles */}
      <div className="grid grid-cols-2 gap-1.5 px-2">
        {[
          { v: "₦18.4M", l: "Revenue 7d", t: "violet" },
          { v: "15,940", l: "Units", t: "emerald" },
          { v: "87", l: "Orders", t: "sky" },
          { v: "12", l: "Out of stock", t: "rose" },
        ].map((k) => (
          <div key={k.l} className="rounded-lg border border-border bg-card p-1.5">
            <p className="text-[8px] uppercase tracking-wider text-muted-foreground">{k.l}</p>
            <p className="text-[11px] font-bold tabular-nums">{k.v}</p>
          </div>
        ))}
      </div>

      {/* AI insight card */}
      <div className="mx-2 mt-2 flex items-start gap-1.5 rounded-lg border border-border bg-card p-2">
        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-amber-500/15 text-amber-700 dark:text-amber-300">
          <Layers className="h-2.5 w-2.5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[8px] font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-300">Stock</p>
          <p className="text-[10px] font-semibold leading-tight">Earbuds selling 24% faster</p>
          <p className="mt-0.5 text-[8px] leading-tight text-muted-foreground line-clamp-1">
            About 4 days of stock left — reorder soon.
          </p>
        </div>
      </div>

      {/* Sparkline */}
      <div className="mx-2 mt-2 rounded-lg border border-border bg-card p-2">
        <p className="text-[8px] uppercase tracking-wider text-muted-foreground">7‑day forecast</p>
        <Spark className="mt-1 h-9 w-full" />
      </div>

      {/* Bottom nav — mirrors BOTTOM_NAV_PRIMARY (Home · POS · Stock ·
          Sales) + More, with Home active since this screen is the
          dashboard. */}
      <div className="mt-auto flex items-center justify-around border-t border-border bg-background/95 px-3 py-2 backdrop-blur">
        {[BarChart3, CreditCard, Package2, ShoppingCart, MoreHorizontal].map((Icon, i) => (
          <Icon
            key={i}
            className={
              i === 0
                ? "h-4 w-4 text-brand dark:text-primary"
                : "h-4 w-4 text-muted-foreground"
            }
          />
        ))}
      </div>
    </div>
  )
}

function Spark({ className }: { className?: string }) {
  const pts = [4, 8, 6, 14, 12, 20, 24, 22, 28, 26, 32, 38, 34, 40]
  const W = 100, H = 32
  const step = W / (pts.length - 1)
  const max = Math.max(...pts)
  const min = Math.min(...pts)
  const path = pts
    .map((v, i) => {
      const x = i * step
      const y = H - ((v - min) / (max - min)) * (H - 4) - 2
      return `${i === 0 ? "M" : "L"}${x},${y}`
    })
    .join(" ")
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className={className} preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id="spark-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--chart-1)" stopOpacity="0.4" />
          <stop offset="100%" stopColor="var(--chart-1)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`${path} L${W},${H} L0,${H} Z`} fill="url(#spark-fill)" />
      <path d={path} fill="none" stroke="var(--chart-1)" strokeWidth={1.5} strokeLinecap="round" />
    </svg>
  )
}
