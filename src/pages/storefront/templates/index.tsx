import * as React from "react"
import { Link } from "react-router-dom"
import {
  ArrowRight,
  Check,
  Filter,
  Search,
  Sparkles,
  TrendingUp,
} from "lucide-react"
import { PageShell } from "@/components/page-shell"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { StatusBadge, type StatusTone } from "@/components/lists/status-badge"
import { SummaryStrip } from "@/components/lists/summary-strip"
import { TemplateShowcase } from "@/components/storefront/template-showcase"
import { useRegisterPageRefresh } from "@/hooks/use-pull-to-refresh"
import { TEMPLATES, getStorefrontState } from "@/lib/storefront/data"
import type { StorefrontSector, StorefrontStyle } from "@/lib/storefront/types"
import { cn } from "@/lib/utils"

const SECTOR_LABEL: Record<StorefrontSector, string> = {
  fashion:     "Fashion",
  beauty:      "Beauty",
  food:        "Food & dining",
  electronics: "Electronics",
  home:        "Home & lifestyle",
  auto:        "Auto",
  wholesale:   "Wholesale B2B",
  services:    "Services",
}

const STYLE_LABEL: Record<StorefrontStyle, string> = {
  minimal:   "Minimal",
  bold:      "Bold",
  editorial: "Editorial",
  playful:   "Playful",
  luxe:      "Luxe",
}

const TIER_TONE: Record<"free" | "pro" | "premium", StatusTone> = {
  free:    "success",
  pro:     "info",
  premium: "brand",
}

export default function StorefrontTemplates() {
  useRegisterPageRefresh(React.useCallback(async () => { await new Promise((r) => setTimeout(r, 250)) }, []))

  const [query, setQuery] = React.useState("")
  const [sector, setSector] = React.useState<"all" | StorefrontSector>("all")
  const [style, setStyle] = React.useState<"all" | StorefrontStyle>("all")
  const [sort, setSort] = React.useState<"popular" | "newest" | "name">("popular")

  const activeTemplateId = React.useMemo(() => getStorefrontState().templateId, [])

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    const list = TEMPLATES.filter((t) => {
      if (sector !== "all" && t.sector !== sector) return false
      if (style  !== "all" && t.style  !== style)  return false
      if (!q) return true
      return (
        t.name.toLowerCase().includes(q) ||
        t.tagline.toLowerCase().includes(q) ||
        SECTOR_LABEL[t.sector].toLowerCase().includes(q)
      )
    })
    return [...list].sort((a, b) => {
      if (sort === "popular") return b.popularity - a.popularity
      if (sort === "name")    return a.name.localeCompare(b.name)
      return 0 // newest = original order for now
    })
  }, [query, sector, style, sort])

  const free    = TEMPLATES.filter((t) => t.tier === "free").length
  const pro     = TEMPLATES.filter((t) => t.tier === "pro").length
  const premium = TEMPLATES.filter((t) => t.tier === "premium").length

  return (
    <PageShell
      title="Choose a storefront"
      withToolbar={false}
      titleTooltip={
        <>
          Pick a template and Pallio spins up a real, hosted shop at
          <span className="font-mono"> your-subdomain.pallio.shop</span>{" "}
          in under a minute. Every template ships with a working
          checkout, payment + delivery routing, and the essential
          pages (Home, Shop, Product, Cart, Checkout, About, Contact,
          Privacy, Terms). Customise after you pick — none of the
          design decisions are locked.
        </>
      }
    >
      <div className="flex flex-col gap-3">
        {/* Hero */}
        <section className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-brand-soft via-card to-fuchsia-50/40 px-5 py-4 dark:from-primary/10 dark:to-fuchsia-950/15">
          <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-gradient-to-br from-brand/30 via-fuchsia-500/15 to-transparent blur-3xl" aria-hidden />
          <div className="relative flex flex-wrap items-end justify-between gap-4">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand to-fuchsia-500 text-white shadow-sm shadow-brand/30">
                  <Sparkles className="h-4 w-4" />
                </span>
                <h2 className="text-xl font-bold tracking-tight md:text-2xl">Your online shop, designed for you.</h2>
              </div>
              <p className="mt-1.5 text-sm text-muted-foreground md:text-base">
                {TEMPLATES.length} hand-tuned templates across {Object.keys(SECTOR_LABEL).length} sectors. Pick one, swap colours + logo, and Pallio publishes it.
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <Link to="/storefront"><Button size="sm" variant="outline">Already picked one? Manage</Button></Link>
                <Link to="#templates"><Button size="sm">Browse templates <ArrowRight className="h-3.5 w-3.5" /></Button></Link>
              </div>
            </div>
            <ul className="hidden grid-cols-2 gap-1.5 text-xs sm:grid lg:grid-cols-2">
              {[
                { Icon: Check, label: "Hosted at *.pallio.shop" },
                { Icon: Check, label: "Custom domain (CNAME)" },
                { Icon: Check, label: "Stock + price sync from Pallio" },
                { Icon: Check, label: "NDPR-compliant cookies + privacy" },
              ].map((b) => (
                <li key={b.label} className="flex items-center gap-1.5 rounded-full border border-border bg-card px-2.5 py-1">
                  <b.Icon className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                  <span className="font-medium">{b.label}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <SummaryStrip
          tiles={[
            { label: "Templates",  value: String(TEMPLATES.length), tone: "brand",   hint: "across 8 sectors" },
            { label: "Free tier",  value: String(free),             tone: "success", hint: "no upgrade needed" },
            { label: "Pro tier",   value: String(pro),              tone: "info",    hint: "₦1k/month" },
            { label: "Premium",    value: String(premium),          tone: "warning", hint: "₦2k/month" },
          ]}
        />

        {/* Filter strip */}
        <div className="flex flex-col gap-3" id="templates">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="-mx-4 flex gap-1.5 overflow-x-auto px-4 scrollbar-hide sm:mx-0 sm:px-0">
              {(["all", ...Object.keys(SECTOR_LABEL) as StorefrontSector[]] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSector(s as "all" | StorefrontSector)}
                  className={cn(
                    "shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
                    sector === s
                      ? "border-transparent bg-brand text-brand-foreground dark:bg-primary dark:text-primary-foreground"
                      : "border-border bg-card text-muted-foreground hover:bg-accent hover:text-foreground",
                  )}
                >
                  {s === "all" ? "All sectors" : SECTOR_LABEL[s as StorefrontSector]}
                </button>
              ))}
            </div>
            <div className="relative min-w-[200px]">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search templates…"
                className="pl-9"
              />
            </div>
          </div>
          <div className="flex flex-col gap-2 text-xs sm:flex-row sm:items-center sm:justify-between sm:gap-4">
            {/* Style row — single scrolling line, label stays pinned left */}
            <div className="flex min-w-0 items-center gap-2">
              <span className="inline-flex shrink-0 items-center gap-1 pr-1 text-muted-foreground"><Filter className="h-3 w-3" /> Style:</span>
              <div className="flex min-w-0 flex-1 items-center gap-1.5 overflow-x-auto scrollbar-hide">
                {(["all", ...Object.keys(STYLE_LABEL) as StorefrontStyle[]] as const).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setStyle(s as "all" | StorefrontStyle)}
                    className={cn(
                      "shrink-0 rounded-full border px-2.5 py-1 font-medium transition-colors",
                      style === s
                        ? "border-brand/40 bg-brand-soft text-brand dark:border-primary/40 dark:bg-primary/15 dark:text-primary"
                        : "border-border bg-card text-muted-foreground hover:bg-accent hover:text-foreground",
                    )}
                  >
                    {s === "all" ? "Any" : STYLE_LABEL[s as StorefrontStyle]}
                  </button>
                ))}
              </div>
            </div>
            {/* Sort row */}
            <div className="flex shrink-0 items-center gap-1.5">
              <span className="inline-flex items-center gap-1 text-muted-foreground">Sort:</span>
              {(["popular", "name"] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSort(s)}
                  className={cn(
                    "rounded-full border px-2.5 py-1 font-medium transition-colors capitalize",
                    sort === s
                      ? "border-brand/40 bg-brand-soft text-brand dark:border-primary/40 dark:bg-primary/15 dark:text-primary"
                      : "border-border bg-card text-muted-foreground hover:bg-accent hover:text-foreground",
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Template grid */}
        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-muted/30 p-12 text-center text-sm text-muted-foreground">
            No templates match. Try a different sector or style.
          </div>
        ) : (
          <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((t) => {
              const isActive = t.id === activeTemplateId
              return (
                <li key={t.id}>
                  <Link
                    to={`/storefront/templates/${t.id}`}
                    className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-lg"
                  >
                    {/* Cover — ThemeForest-style mini composition:
                        laptop + phone side-by-side on a brand-tinted
                        background, showing the template's actual
                        home-page mockup. No stock photo. */}
                    <div className="relative aspect-[16/10] overflow-hidden">
                      <TemplateShowcase template={t} compact />
                      {/* Top-left badges */}
                      <div className="absolute left-3 top-3 z-10 flex gap-1.5">
                        <StatusBadge tone={TIER_TONE[t.tier]}>{t.tier}</StatusBadge>
                        {isActive && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm">
                            <Check className="h-2.5 w-2.5" /> active
                          </span>
                        )}
                      </div>
                      {/* Bottom-right palette swatches */}
                      <div className="absolute bottom-3 right-3 z-10 flex gap-1">
                        <span
                          className="h-5 w-5 rounded-full border-2 border-white shadow-sm"
                          style={{ background: t.colors.primary }}
                          aria-label="Primary colour"
                        />
                        <span
                          className="h-5 w-5 rounded-full border-2 border-white shadow-sm"
                          style={{ background: t.colors.accent }}
                          aria-label="Accent colour"
                        />
                      </div>
                    </div>

                    {/* Body */}
                    <div className="flex flex-1 flex-col gap-2 p-4">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-base font-bold tracking-tight">{t.name}</h3>
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold tabular-nums text-emerald-700 dark:text-emerald-300">
                          <TrendingUp className="h-3 w-3" /> {t.popularity}
                        </span>
                      </div>
                      <p className="line-clamp-2 min-h-[2.5rem] text-xs leading-relaxed text-muted-foreground">{t.tagline}</p>
                      <div className="mt-auto flex flex-wrap items-center gap-1.5">
                        <span className="rounded-full bg-brand-soft px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-brand dark:bg-primary/15 dark:text-primary">
                          {SECTOR_LABEL[t.sector]}
                        </span>
                        <span className="rounded-full border border-border px-2 py-0.5 text-[10px] font-semibold capitalize text-muted-foreground">
                          {STYLE_LABEL[t.style]}
                        </span>
                        <span className="ml-auto text-[10px] text-muted-foreground">{t.pages.length} pages</span>
                      </div>
                    </div>
                  </Link>
                </li>
              )
            })}
          </ul>
        )}

        {/* Footer help */}
        <div className="flex items-start gap-2 rounded-2xl border border-dashed border-border bg-muted/30 p-3 text-xs text-muted-foreground">
          <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand dark:text-primary" />
          <p>
            Don't see your sector or vibe? <Link to="/contact" className="font-semibold text-brand hover:underline dark:text-primary">Tell us</Link> what you'd build — we ship a fresh template every fortnight.
          </p>
        </div>
      </div>
    </PageShell>
  )
}
