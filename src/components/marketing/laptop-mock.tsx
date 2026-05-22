import {
  Bell,
  BarChart3,
  Bot,
  Boxes,
  ChevronRight,
  CreditCard,
  Layers,
  Megaphone,
  Package2,
  Search,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  Users,
  Wallet,
} from "lucide-react"

// Inline desktop dashboard rendered inside the LaptopFrame on the
// landing page. Mirrors the real app shell — sidebar + sticky top
// bar + AI insight strip + KPI tiles + forecast/restock + a chart
// area — but everything is fake markup. Purely visual.
export function DesktopDashboardMock() {
  return (
    <div className="flex h-full w-full bg-background text-foreground">
      {/* Sidebar */}
      <aside className="flex h-full w-[16%] flex-col border-r border-border bg-card/40">
        <div className="flex items-center gap-1.5 border-b border-border px-2 py-2">
          <span className="flex h-4 w-4 items-center justify-center rounded-md bg-gradient-to-br from-brand to-fuchsia-500 text-[7px] font-bold text-white">P</span>
          <span className="text-[9px] font-bold tracking-tight">Pallio</span>
        </div>
        <nav className="flex-1 px-1.5 py-1.5">
          {[
            { Icon: BarChart3,    label: "Dashboard",   active: true },
            { Icon: CreditCard,   label: "POS" },
            { Icon: Package2,     label: "Inventory" },
            { Icon: ShoppingCart, label: "Sales" },
            { Icon: Boxes,        label: "Purchasing" },
            { Icon: BarChart3,    label: "Reporting" },
            { Icon: Megaphone,    label: "Marketing" },
            { Icon: Bot,          label: "AI" },
            { Icon: Users,        label: "Team" },
            { Icon: ShieldCheck,  label: "Settings" },
          ].map((n) => (
            <div
              key={n.label}
              className={`mb-0.5 flex items-center gap-1.5 rounded-md px-1.5 py-1 text-[8px] ${
                n.active ? "bg-brand-soft text-brand dark:bg-primary/15 dark:text-primary" : "text-muted-foreground"
              }`}
            >
              <n.Icon className="h-2.5 w-2.5" />
              <span>{n.label}</span>
            </div>
          ))}
        </nav>
      </aside>

      {/* Main column */}
      <div className="flex h-full flex-1 flex-col">
        {/* Top bar */}
        <header className="flex items-center gap-2 border-b border-border bg-background/80 px-3 py-2 backdrop-blur">
          <span className="text-[9px] font-semibold tracking-tight">Dashboard</span>
          <div className="ml-auto flex items-center gap-1.5">
            <div className="flex h-4 items-center gap-1 rounded-md border border-input bg-background px-1.5 text-[8px] text-muted-foreground">
              <Search className="h-2.5 w-2.5" />
              <span>Search…</span>
            </div>
            <Bell className="h-3 w-3 text-muted-foreground" />
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-gradient-to-br from-brand to-fuchsia-500 text-[7px] font-bold text-white">P</span>
          </div>
        </header>

        {/* Scrollable content */}
        <div className="flex-1 overflow-hidden px-3 py-2">
          {/* Hero */}
          <div className="rounded-lg border border-border bg-gradient-to-br from-brand-soft via-card to-emerald-50/40 px-3 py-2 dark:from-primary/10 dark:to-emerald-950/15">
            <p className="flex items-center gap-1 text-[7px] font-semibold uppercase tracking-wider text-brand dark:text-primary">
              <Sparkles className="h-2 w-2" /> Today
            </p>
            <p className="mt-0.5 text-[11px] font-bold leading-tight">
              Sales <span className="text-brand dark:text-primary">+12%</span> · ₦4.2M
            </p>
          </div>

          {/* AI insights row */}
          <div className="mt-2 grid grid-cols-3 gap-1.5">
            {[
              { Icon: Boxes,    title: "USB‑C Hub trending +24%", body: "Reorder 60 units · ~4d left.",   tone: "bg-amber-500/15 text-amber-700 dark:text-amber-300" },
              { Icon: Wallet,   title: "ROAS 4.2× on IG Reels",   body: "Best of any active channel.",    tone: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300" },
              { Icon: Megaphone,title: "Cobalt 2d late · 3 of 4", body: "Stock buffer thin on EL-2109.",  tone: "bg-rose-500/15 text-rose-700 dark:text-rose-300" },
            ].map((c) => (
              <div key={c.title} className="rounded-md border border-border bg-card p-1.5">
                <div className="flex items-start gap-1">
                  <span className={`flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded ${c.tone}`}>
                    <c.Icon className="h-2 w-2" />
                  </span>
                  <p className="text-[7px] font-semibold leading-tight">{c.title}</p>
                </div>
                <p className="mt-0.5 text-[6px] leading-tight text-muted-foreground line-clamp-1">{c.body}</p>
              </div>
            ))}
          </div>

          {/* KPI row */}
          <div className="mt-2 grid grid-cols-4 gap-1.5">
            {[
              { v: "₦18.4M", l: "Revenue 7d" },
              { v: "15,940", l: "Units" },
              { v: "87",     l: "Orders" },
              { v: "12",     l: "OOS" },
            ].map((k) => (
              <div key={k.l} className="rounded-md border border-border bg-card p-1.5">
                <p className="text-[6px] uppercase tracking-wider text-muted-foreground">{k.l}</p>
                <p className="text-[10px] font-bold tabular-nums">{k.v}</p>
              </div>
            ))}
          </div>

          {/* Forecast + restock */}
          <div className="mt-2 grid grid-cols-2 gap-1.5">
            <div className="rounded-md border border-border bg-card p-1.5">
              <p className="text-[7px] font-semibold">Forecast · next 7d</p>
              <Spark className="mt-1 h-8 w-full" />
            </div>
            <div className="rounded-md border border-border bg-card p-1.5">
              <p className="text-[7px] font-semibold">Suggested restock</p>
              <div className="mt-1 space-y-0.5">
                {["EL-2109 · Hub", "AP-4012 · Tee", "HM-2205 · Mug"].map((s) => (
                  <div key={s} className="flex items-center justify-between rounded-sm bg-background px-1 py-0.5 text-[6px]">
                    <span className="truncate">{s}</span>
                    <span className="font-bold text-brand dark:text-primary">+60</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Chart row */}
          <div className="mt-2 rounded-md border border-border bg-card p-1.5">
            <p className="text-[7px] font-semibold">Stock vs Sold · 6mo</p>
            <BigSpark className="mt-1 h-10 w-full" />
          </div>

          {/* Activity hint */}
          <div className="mt-2 rounded-md border border-border bg-card px-1.5 py-1">
            <p className="flex items-center gap-1 text-[6px] uppercase tracking-wider text-muted-foreground">
              <Layers className="h-2 w-2" /> Activity
            </p>
            <p className="mt-0.5 text-[7px]">Mia closed a ₦86,000 sale · USB‑C Hub crossed reorder threshold · PO‑1042 received in full</p>
          </div>
        </div>
      </div>

      {/* Unused-imports placation: keeps the file robust to future variants */}
      <span className="hidden"><ChevronRight /></span>
    </div>
  )
}

// Small inline sparkline (filled area).
function Spark({ className }: { className?: string }) {
  const pts = [4, 8, 6, 14, 12, 20, 24, 22, 28, 26, 32, 38, 34, 40]
  return renderSpark(pts, className)
}

// Bigger chart for the Stock vs Sold tile.
function BigSpark({ className }: { className?: string }) {
  const pts = [12, 18, 16, 24, 20, 28, 32, 30, 36, 34, 40, 46, 42, 50, 48, 56, 60]
  return renderSpark(pts, className)
}

function renderSpark(pts: number[], className?: string) {
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
    <svg viewBox={`0 0 ${W} ${H}`} className={className} preserveAspectRatio="none" aria-hidden>
      <defs>
        <linearGradient id="laptop-spark-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--chart-1)" stopOpacity="0.4" />
          <stop offset="100%" stopColor="var(--chart-1)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`${path} L${W},${H} L0,${H} Z`} fill="url(#laptop-spark-fill)" />
      <path d={path} fill="none" stroke="var(--chart-1)" strokeWidth={1.5} strokeLinecap="round" />
    </svg>
  )
}
