import * as React from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { toast } from "sonner"
import {
  ArrowLeft,
  Check,
  ExternalLink,
  FileText,
  Globe,
  ShieldCheck,
  Sparkles,
  TrendingUp,
} from "lucide-react"
import { PageShell } from "@/components/page-shell"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { StatusBadge, type StatusTone } from "@/components/lists/status-badge"
import { EmptyState } from "@/components/lists/empty-state"
import { TemplateShowcase } from "@/components/storefront/template-showcase"
import { useRegisterPageRefresh } from "@/hooks/use-pull-to-refresh"
import {
  TEMPLATES_BY_ID,
  activateTemplate,
  getStorefrontState,
} from "@/lib/storefront/data"
import { cn } from "@/lib/utils"

const TIER_TONE: Record<"free" | "pro" | "premium", StatusTone> = {
  free:    "success",
  pro:     "info",
  premium: "brand",
}

const TIER_PRICE: Record<"free" | "pro" | "premium", string> = {
  free:    "Free",
  pro:     "₦1,000 / month",
  premium: "₦2,000 / month",
}

export default function StorefrontTemplateDetail() {
  const params = useParams<{ id: string }>()
  const navigate = useNavigate()
  const template = TEMPLATES_BY_ID[params.id ?? ""]
  useRegisterPageRefresh(React.useCallback(async () => { await new Promise((r) => setTimeout(r, 250)) }, []))

  const [activating, setActivating] = React.useState(false)
  const isActive = getStorefrontState().templateId === template?.id

  if (!template) {
    return (
      <PageShell title="Template not found" withToolbar={false}>
        <Card>
          <CardContent className="p-0">
            <EmptyState
              Icon={Sparkles}
              title="That template doesn't exist"
              description="It may have been renamed or removed. Browse the full catalog."
              action={<Link to="/storefront/templates"><Button>Back to templates</Button></Link>}
            />
          </CardContent>
        </Card>
      </PageShell>
    )
  }

  const activate = async () => {
    setActivating(true)
    await activateTemplate(template.id)
    setActivating(false)
    toast.success(`${template.name} is now your storefront. Set up your subdomain next.`)
    navigate("/storefront")
  }

  return (
    <PageShell
      title={template.name}
      withToolbar={false}
      titleTooltip={
        <>
          Full preview + spec sheet for the {template.name} template.
          The pages list is what your shoppers will actually see once
          you publish; the highlights are the features that make this
          template unique. Tap "Use this template" to activate it.
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <Link to="/storefront/templates" className="inline-flex w-fit items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-3.5 w-3.5" /> All templates
        </Link>

        {/* Name + tagline + CTAs strip — sits above the showcase
            poster so the buyer reads the pitch before they look at
            the visuals. */}
        <section className="flex flex-wrap items-end justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge tone={TIER_TONE[template.tier]}>{template.tier}</StatusBadge>
              {isActive && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm">
                  <Check className="h-2.5 w-2.5" /> your active template
                </span>
              )}
              <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                <TrendingUp className="h-3 w-3" /> popularity {template.popularity}/100
              </span>
            </div>
            <h2 className="mt-1 text-2xl font-bold tracking-tight md:text-3xl">{template.name}</h2>
            <p className="mt-0.5 max-w-2xl text-sm text-muted-foreground">{template.tagline}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {!isActive ? (
              <Button onClick={activate} disabled={activating} size="lg" className="shadow-md">
                {activating ? "Activating…" : "Use this template"}
                <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Link to="/storefront">
                <Button size="lg" variant="outline">
                  Manage storefront <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            )}
          </div>
        </section>

        {/* CodeCanyon-style preview — laptop + phone side-by-side,
            prev/next arrows, page labels at the bottom. One unified
            visual; no duplicate slider underneath. */}
        <TemplateShowcase template={template} />

        {/* Two-column layout: highlights + pages on left, palette + meta + price on right */}
        <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
          <div className="flex flex-col gap-4">
            {/* Highlights */}
            <section className="rounded-2xl border border-border bg-card p-4">
              <h3 className="text-sm font-semibold md:text-base">What makes this template special</h3>
              <p className="mt-0.5 text-xs text-muted-foreground">Features tuned for the {template.sector} sector — built in, no plugins.</p>
              <ul className="mt-3 space-y-2.5">
                {template.highlights.map((h, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-soft text-brand dark:bg-primary/15 dark:text-primary">
                      <Check className="h-3 w-3" strokeWidth={3} />
                    </span>
                    <p className="text-sm leading-relaxed">{h}</p>
                  </li>
                ))}
              </ul>
            </section>

            {/* Pages included */}
            <section className="rounded-2xl border border-border bg-card p-4">
              <div className="flex items-baseline justify-between gap-2">
                <h3 className="text-sm font-semibold md:text-base">Pages included</h3>
                <span className="text-[11px] text-muted-foreground">{template.pages.length} pages</span>
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground">Every essential checkout, account, and policy page is built in. Optional pages can be disabled after activation.</p>
              <ul className="mt-3 divide-y divide-border">
                {template.pages.map((p) => (
                  <li key={p.path} className="flex items-start gap-3 py-2.5">
                    <span className={cn(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                      p.essential ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300" : "bg-brand-soft text-brand dark:bg-primary/15 dark:text-primary",
                    )}>
                      <FileText className="h-4 w-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-baseline gap-2">
                        <p className="truncate text-sm font-semibold">{p.name}</p>
                        <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">{p.path}</code>
                        {p.essential ? (
                          <StatusBadge tone="success">essential</StatusBadge>
                        ) : (
                          <StatusBadge tone="info">optional</StatusBadge>
                        )}
                      </div>
                      <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{p.description}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          </div>

          <aside className="flex flex-col gap-4">
            {/* Palette + sector */}
            <section className="rounded-2xl border border-border bg-card p-4">
              <h3 className="text-sm font-semibold md:text-base">Design profile</h3>
              <div className="mt-3 flex items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl shadow-sm" style={{ background: template.colors.primary }}>
                  <span className="text-[10px] font-bold text-white">Primary</span>
                </div>
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl shadow-sm" style={{ background: template.colors.accent }}>
                  <span className="text-[10px] font-bold text-white drop-shadow">Accent</span>
                </div>
                <div className="min-w-0 flex-1 text-xs">
                  <p className="font-mono">{template.colors.primary}</p>
                  <p className="font-mono text-muted-foreground">{template.colors.accent}</p>
                </div>
              </div>
              <dl className="mt-4 space-y-2 text-xs">
                <div className="flex items-baseline justify-between gap-2">
                  <dt className="text-muted-foreground">Sector</dt>
                  <dd className="font-semibold capitalize">{template.sector}</dd>
                </div>
                <div className="flex items-baseline justify-between gap-2">
                  <dt className="text-muted-foreground">Style</dt>
                  <dd className="font-semibold capitalize">{template.style}</dd>
                </div>
                <div className="flex items-baseline justify-between gap-2">
                  <dt className="text-muted-foreground">Popularity</dt>
                  <dd className="font-semibold">{template.popularity}/100</dd>
                </div>
              </dl>
            </section>

            {/* Pricing tile */}
            <section className="rounded-2xl border border-border bg-card p-4">
              <div className="flex items-baseline justify-between gap-2">
                <h3 className="text-sm font-semibold md:text-base">Pricing</h3>
                <StatusBadge tone={TIER_TONE[template.tier]}>{template.tier}</StatusBadge>
              </div>
              <p className="mt-1 text-2xl font-bold tabular-nums">{TIER_PRICE[template.tier]}</p>
              <ul className="mt-3 space-y-1.5 text-xs text-muted-foreground">
                <li className="flex items-start gap-1.5"><Check className="mt-0.5 h-3 w-3 shrink-0 text-emerald-600 dark:text-emerald-400" /> Hosted at <span className="font-mono">*.pallio.shop</span></li>
                <li className="flex items-start gap-1.5"><Check className="mt-0.5 h-3 w-3 shrink-0 text-emerald-600 dark:text-emerald-400" /> Custom domain (CNAME)</li>
                <li className="flex items-start gap-1.5"><Check className="mt-0.5 h-3 w-3 shrink-0 text-emerald-600 dark:text-emerald-400" /> Auto SSL + DDoS protection</li>
                <li className="flex items-start gap-1.5"><Check className="mt-0.5 h-3 w-3 shrink-0 text-emerald-600 dark:text-emerald-400" /> Stock + price sync from Pallio</li>
                <li className="flex items-start gap-1.5"><Check className="mt-0.5 h-3 w-3 shrink-0 text-emerald-600 dark:text-emerald-400" /> NDPR-compliant defaults</li>
              </ul>
              {!isActive && (
                <Button onClick={activate} disabled={activating} className="mt-4 w-full">
                  {activating ? "Activating…" : "Use this template"}
                </Button>
              )}
            </section>

            {/* Trust */}
            <section className="rounded-2xl border border-dashed border-border bg-muted/30 p-3 text-xs text-muted-foreground">
              <div className="flex items-start gap-2">
                <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                <p>
                  Changing templates later doesn't lose your data — products, customers, orders all carry over. Pallio just swaps the design.
                </p>
              </div>
              <div className="mt-2 flex items-start gap-2">
                <Globe className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand dark:text-primary" />
                <p>
                  Works on every device — phones, tablets, desktops, even WhatsApp in-app browser.
                </p>
              </div>
            </section>

            {/* External preview teaser */}
            <a
              href={`https://demo-${template.id}.pallio.shop`}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-2 rounded-2xl border border-border bg-card p-3 text-xs transition-colors hover:border-brand/40 hover:bg-accent/40"
            >
              <Globe className="h-3.5 w-3.5 text-brand dark:text-primary" />
              <span className="min-w-0 flex-1">
                <span className="font-semibold">See it live</span>
                <span className="block truncate font-mono text-[11px] text-muted-foreground">demo-{template.id}.pallio.shop</span>
              </span>
              <ExternalLink className="h-3 w-3 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
            </a>
          </aside>
        </div>
      </div>
    </PageShell>
  )
}

// Used by the hero CTA above the fold.
function ArrowRight({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  )
}
