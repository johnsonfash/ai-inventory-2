import * as React from "react"
import { Link } from "react-router-dom"
import { toast } from "sonner"
import {
  ArrowRight,
  Banknote,
  BarChart3 as BarChartIcon,
  Check,
  Copy,
  ExternalLink,
  Eye,
  FileText as FileTextIcon,
  Globe,
  Globe as GlobeIcon,
  Image as ImageIcon,
  Layers,
  Layout,
  LinkIcon,
  Package as PackageIcon,
  Pause,
  Play,
  Settings,
  Settings as SettingsIcon,
  ShieldCheck,
  ShoppingBag as ShoppingBagIcon,
  Sparkles,
  Ticket as TicketIcon,
  Truck,
  Upload,
  Users as UsersIcon,
} from "lucide-react"
import { PageShell } from "@/components/page-shell"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { StatusBadge, type StatusTone } from "@/components/lists/status-badge"
import { SummaryStrip } from "@/components/lists/summary-strip"
import { EmptyState } from "@/components/lists/empty-state"
import { Card, CardContent } from "@/components/ui/card"
import { useRegisterPageRefresh } from "@/hooks/use-pull-to-refresh"
import {
  TEMPLATES_BY_ID,
  getStorefrontState,
  setStorefrontState,
} from "@/lib/storefront/data"
import type { StorefrontState } from "@/lib/storefront/types"
import { PROVIDERS as INTEGRATION_PROVIDERS } from "@/lib/integrations/data"
import { ConnectionChip } from "@/components/integrations/connection-chip"
import { cn } from "@/lib/utils"

// Integration providers this hosted-storefront feature depends on —
// payment rails, couriers, comms, analytics. Order matches the
// shopper's journey so the strip reads checkout → ship → notify →
// measure.
const STOREFRONT_RELEVANT_PROVIDERS = [
  "paystack", "flutterwave", "opay", "stripe",
  "gig-logistics", "sendbox", "kwik",
  "mailgun", "whatsapp-cloud",
  "meta-pixel", "ga4",
]

const TIER_TONE: Record<"free" | "pro" | "premium", StatusTone> = {
  free:    "success",
  pro:     "info",
  premium: "brand",
}

// Storefront control room. Three layouts based on state:
//   - No template picked → CTA to /storefront/templates
//   - Template picked but not published → "Finish setup" stepper
//   - Published → live status + management tabs (Domain / Branding /
//     Payments / Delivery / Pages / Pause)

export default function StorefrontManage() {
  useRegisterPageRefresh(React.useCallback(async () => { await new Promise((r) => setTimeout(r, 250)) }, []))

  // Local state mirror of the kv store so toggles re-render instantly.
  const [state, setStateLocal] = React.useState<StorefrontState>(() => getStorefrontState())

  const template = state.templateId ? TEMPLATES_BY_ID[state.templateId] : null

  const update = async (patch: Partial<StorefrontState>) => {
    const next = { ...state, ...patch }
    setStateLocal(next)
    await setStorefrontState(next)
  }
  const updateBrand = async (patch: Partial<StorefrontState["brand"]>) => {
    const next = { ...state, brand: { ...state.brand, ...patch } }
    setStateLocal(next)
    await setStorefrontState(next)
  }

  const togglePublished = async () => {
    if (!template) return
    await update({ published: !state.published })
    toast.success(state.published ? "Storefront paused." : "Storefront is live.")
  }

  const liveUrl = state.customDomain
    ? `https://${state.customDomain}`
    : `https://${state.subdomain}.pallio.shop`

  // ---------- empty state ----------
  if (!template) {
    return (
      <PageShell
        title="Storefront"
        withToolbar={false}
        titleTooltip={
          <>
            Pallio can host your online shop at
            <span className="font-mono"> {state.subdomain || "your-name"}.pallio.shop</span>
            {" "}— customers browse, buy, and track delivery there
            while Pallio handles inventory + accounting in the
            background. Pick a template to get started.
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <section className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-brand-soft via-card to-fuchsia-50/40 p-6 dark:from-primary/10 dark:to-fuchsia-950/15">
            <div className="pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full bg-gradient-to-br from-brand/30 via-fuchsia-500/15 to-transparent blur-3xl" aria-hidden />
            <div className="relative grid gap-6 md:grid-cols-[1.4fr_1fr] md:items-center">
              <div>
                <div className="flex items-center gap-2">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand to-fuchsia-500 text-white shadow-sm shadow-brand/30">
                    <Sparkles className="h-4 w-4" />
                  </span>
                  <h2 className="text-xl font-bold tracking-tight md:text-2xl">Launch your shop in minutes.</h2>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground md:text-base">
                  Pallio hosts a beautiful online storefront for your business — every product, price, and stock level synced from this dashboard. Pick from a gallery of hand-tuned templates across every sector, plug in your colours, and you're live.
                </p>
                <ul className="mt-3 flex flex-wrap gap-1.5 text-[11px]">
                  {["Hosted at *.pallio.shop", "Custom domain CNAME", "Auto SSL + CDN", "Mobile + desktop", "Built-in checkout"].map((s) => (
                    <li key={s} className="flex items-center gap-1 rounded-full border border-border bg-card px-2 py-1">
                      <Check className="h-3 w-3 text-emerald-600 dark:text-emerald-400" /> {s}
                    </li>
                  ))}
                </ul>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Link to="/storefront/templates">
                    <Button size="lg">Browse templates <ArrowRight className="h-4 w-4" /></Button>
                  </Link>
                  <Link to="/help/glossary#term-pos">
                    <Button size="lg" variant="outline">How does it work?</Button>
                  </Link>
                </div>
              </div>
              <div className="hidden md:block">
                <div className="relative aspect-[3/4] overflow-hidden rounded-2xl border border-border bg-card shadow-xl">
                  <img
                    src="https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&h=800&fit=crop&auto=format&q=80"
                    alt="Storefront preview"
                    loading="lazy"
                    referrerPolicy="no-referrer"
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3 text-xs text-white">
                    <p className="font-bold">Lekki Luxe</p>
                    <p className="text-white/80">Editorial · Fashion</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <Card>
            <CardContent className="p-0">
              <EmptyState
                Icon={Layout}
                title="No storefront yet"
                description="Pick a template to spin up a hosted shop with checkout + delivery already wired."
                action={<Link to="/storefront/templates"><Button>Pick a template <ArrowRight className="h-3.5 w-3.5" /></Button></Link>}
              />
            </CardContent>
          </Card>
        </div>
      </PageShell>
    )
  }

  // ---------- template active ----------
  const paymentProviders = INTEGRATION_PROVIDERS.filter((p) => p.category === "payments")
  const deliveryProviders = INTEGRATION_PROVIDERS.filter((p) => p.category === "delivery")
  const subdomainValid = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/.test(state.subdomain)

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(liveUrl)
      toast.success("Live URL copied")
    } catch {
      toast.error("Couldn't copy")
    }
  }

  return (
    <PageShell
      title="Storefront"
      withToolbar={false}
      titleTooltip={
        <>
          Manage your live shop — subdomain + custom domain, brand
          palette, which payment + delivery integrations route the
          checkout, pause/resume, swap to a different template. Visit
          the live site any time at {liveUrl}.
        </>
      }
    >
      <div className="flex flex-col gap-4">
        {/* Status hero */}
        <section
          className="relative overflow-hidden rounded-2xl border border-border p-5"
          style={{ background: `linear-gradient(135deg, ${template.colors.primary}22, ${template.colors.accent}11 60%, transparent)` }}
        >
          <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full blur-3xl" style={{ background: `${template.colors.primary}55` }} aria-hidden />
          <div className="relative flex flex-wrap items-end justify-between gap-4">
            <div className="flex items-start gap-3">
              <div
                className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-lg font-bold text-white shadow-md"
                style={{ background: template.colors.primary }}
              >
                {template.name[0]}
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-xl font-bold tracking-tight md:text-2xl">{state.brand.businessName}</h2>
                  <StatusBadge tone={state.published ? "success" : "neutral"} withDot>
                    {state.published ? "live" : "paused"}
                  </StatusBadge>
                  <StatusBadge tone={TIER_TONE[template.tier]}>{template.tier}</StatusBadge>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {template.name} · {template.pages.length} pages · {state.publishedProducts} products published
                </p>
                <a
                  href={liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1.5 inline-flex items-center gap-1 font-mono text-[11px] text-brand hover:underline dark:text-primary"
                >
                  {liveUrl} <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="outline" size="sm" onClick={copyLink}>
                <Copy className="h-3.5 w-3.5" /> Copy link
              </Button>
              <a href={liveUrl} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="sm">
                  <Eye className="h-3.5 w-3.5" /> View live
                </Button>
              </a>
              <Button onClick={togglePublished} size="sm">
                {state.published ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                {state.published ? "Pause" : "Publish"}
              </Button>
            </div>
          </div>
        </section>

        <SummaryStrip
          tiles={[
            { label: "Status",      value: state.published ? "Live" : "Paused", tone: state.published ? "success" : "neutral", hint: state.published ? "accepting orders" : "behind closed doors" },
            { label: "Pages",       value: String(template.pages.length),         tone: "brand",   hint: "active" },
            { label: "Products",    value: String(state.publishedProducts || "—"), tone: "info",    hint: "on storefront" },
            { label: "Domain",      value: state.customDomain ? "Custom" : "Pallio", tone: state.customDomain ? "warning" : "info", hint: state.customDomain ?? `${state.subdomain}.pallio.shop` },
          ]}
        />

        {/* Connected integrations strip — show which payment +
            delivery + comms + analytics integrations are wired into
            this hosted shop. Tap any chip to jump to its
            connect / config page. */}
        <section>
          <div className="flex items-baseline justify-between">
            <h3 className="text-sm font-semibold md:text-base">Connected integrations</h3>
            <Link to="/settings/integrations" className="text-[11px] font-semibold text-brand hover:underline dark:text-primary">Browse all →</Link>
          </div>
          <p className="text-[11px] text-muted-foreground">Payment + delivery + comms providers powering this storefront.</p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {STOREFRONT_RELEVANT_PROVIDERS.map((id) => (
              <ConnectionChip key={id} providerId={id} />
            ))}
          </div>
        </section>

        {/* Storefront sections — quick-jump cards into every area
            (Orders, Customers, Products, Discounts, Pages, Analytics,
            Domain, Settings). Mobile-first: 2-col grid that becomes
            4-col on desktop. Each card has the live stat that
            matters most for that section. */}
        <section>
          <div className="flex items-baseline gap-1.5">
            <h3 className="text-sm font-semibold md:text-base">Manage your shop</h3>
            <span className="text-[11px] text-muted-foreground">Every Shopify-style area you'd expect.</span>
          </div>
          <ul className="mt-3 grid grid-cols-2 gap-2.5 md:grid-cols-4">
            {[
              { Icon: ShoppingBagIcon, label: "Orders",          stat: "8 today",            tone: "brand"   as const, href: "/storefront/orders"    },
              { Icon: UsersIcon,       label: "Customers",       stat: "12 buyers",          tone: "info"    as const, href: "/storefront/customers" },
              { Icon: PackageIcon,     label: "Products",        stat: "10 live",            tone: "success" as const, href: "/storefront/products"  },
              { Icon: TicketIcon,      label: "Discounts",       stat: "6 active",           tone: "fuchsia" as const, href: "/storefront/discounts" },
              { Icon: FileTextIcon,    label: "Pages + content", stat: "15 pages",           tone: "warning" as const, href: "/storefront/pages"     },
              { Icon: BarChartIcon,    label: "Analytics",       stat: state.published ? "Live data" : "Paused", tone: "emerald" as const, href: "/storefront/analytics" },
              { Icon: GlobeIcon,       label: "Domain + DNS",    stat: state.customDomain ? "Custom" : "Pallio", tone: "sky" as const, href: "/storefront/domain" },
              { Icon: SettingsIcon,    label: "Settings",        stat: "Shipping, SEO, returns", tone: "neutral" as const, href: "/storefront/settings"  },
            ].map((s) => (
              <li key={s.label}>
                <Link
                  to={s.href}
                  className="group flex h-full flex-col gap-2 rounded-2xl border border-border bg-card p-3 transition-all hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <span className={cn(
                      "flex h-9 w-9 items-center justify-center rounded-xl",
                      s.tone === "brand"   && "bg-brand-soft text-brand dark:bg-primary/15 dark:text-primary",
                      s.tone === "success" && "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
                      s.tone === "info"    && "bg-sky-500/15 text-sky-700 dark:text-sky-300",
                      s.tone === "warning" && "bg-amber-500/15 text-amber-700 dark:text-amber-300",
                      s.tone === "fuchsia" && "bg-fuchsia-500/15 text-fuchsia-700 dark:text-fuchsia-300",
                      s.tone === "emerald" && "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
                      s.tone === "sky"     && "bg-sky-500/15 text-sky-700 dark:text-sky-300",
                      s.tone === "neutral" && "bg-muted text-muted-foreground",
                    )}>
                      <s.Icon className="h-4 w-4" />
                    </span>
                    <ArrowRight className="h-3.5 w-3.5 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{s.label}</p>
                    <p className="text-[11px] text-muted-foreground">{s.stat}</p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {/* Settings grid — Domain, Branding, Payments, Delivery, Pages */}
        <div className="grid gap-4 lg:grid-cols-2">
          {/* Subdomain + custom domain */}
          <section className="rounded-2xl border border-border bg-card p-4">
            <div className="flex items-baseline justify-between gap-2">
              <h3 className="text-sm font-semibold md:text-base">Web address</h3>
              <Globe className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="mt-0.5 text-xs text-muted-foreground">Pick a Pallio subdomain, or point your own domain at Pallio via CNAME.</p>

            <div className="mt-4 space-y-3">
              <label className="flex flex-col gap-1.5 text-xs">
                <span className="font-semibold">Pallio subdomain</span>
                <div className="flex items-stretch overflow-hidden rounded-lg border border-input bg-background">
                  <input
                    type="text"
                    value={state.subdomain}
                    onChange={(e) => update({ subdomain: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "") })}
                    className="flex-1 bg-transparent px-3 py-2 text-sm outline-none"
                    placeholder="your-shop"
                  />
                  <span className="flex items-center bg-muted/40 px-3 text-xs font-mono text-muted-foreground">.pallio.shop</span>
                </div>
                <span className={cn("text-[11px]", subdomainValid ? "text-muted-foreground" : "text-rose-600 dark:text-rose-400")}>
                  {subdomainValid
                    ? <>Lowercase letters, numbers, hyphens. Live at <span className="font-mono">{state.subdomain}.pallio.shop</span>.</>
                    : "Must be lowercase letters, numbers, or hyphens — and start/end with a letter or number."}
                </span>
              </label>

              <label className="flex flex-col gap-1.5 text-xs">
                <span className="font-semibold">Custom domain (optional)</span>
                <div className="flex gap-2">
                  <Input
                    value={state.customDomain ?? ""}
                    onChange={(e) => update({ customDomain: e.target.value.trim() || null })}
                    placeholder="shop.funkeapparel.com"
                    className="flex-1 font-mono"
                  />
                  {state.customDomain && (
                    <Button variant="outline" size="sm" onClick={() => update({ customDomain: null })}>
                      Remove
                    </Button>
                  )}
                </div>
                {state.customDomain && (
                  <div className="mt-2 rounded-xl border border-dashed border-border bg-muted/30 p-3 text-[11px] leading-relaxed">
                    <p className="font-semibold text-foreground">DNS setup</p>
                    <p className="mt-1 text-muted-foreground">In your domain registrar, add a CNAME record:</p>
                    <ul className="mt-1.5 space-y-0.5 font-mono text-[11px]">
                      <li><span className="text-muted-foreground">Type</span> CNAME</li>
                      <li><span className="text-muted-foreground">Host</span> {state.customDomain.split(".")[0]}</li>
                      <li><span className="text-muted-foreground">Value</span> {state.subdomain}.pallio.shop</li>
                      <li><span className="text-muted-foreground">TTL</span> 300</li>
                    </ul>
                    <p className="mt-1.5 text-muted-foreground">DNS can take up to 48h. SSL provisions automatically once the record resolves.</p>
                  </div>
                )}
              </label>
            </div>
          </section>

          {/* Branding */}
          <section className="rounded-2xl border border-border bg-card p-4">
            <div className="flex items-baseline justify-between gap-2">
              <h3 className="text-sm font-semibold md:text-base">Brand</h3>
              <Sparkles className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="mt-0.5 text-xs text-muted-foreground">Override the template defaults with your own look.</p>

            <div className="mt-4 space-y-3">
              <label className="flex flex-col gap-1.5 text-xs">
                <span className="font-semibold">Business name</span>
                <Input
                  value={state.brand.businessName}
                  onChange={(e) => updateBrand({ businessName: e.target.value })}
                  placeholder="Funke Apparel"
                />
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="flex flex-col gap-1.5 text-xs">
                  <span className="font-semibold">Primary colour</span>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={state.brand.primaryColor}
                      onChange={(e) => updateBrand({ primaryColor: e.target.value })}
                      className="h-9 w-12 cursor-pointer rounded-md border border-input bg-background"
                    />
                    <Input
                      value={state.brand.primaryColor}
                      onChange={(e) => updateBrand({ primaryColor: e.target.value })}
                      className="font-mono"
                    />
                  </div>
                </label>
                <label className="flex flex-col gap-1.5 text-xs">
                  <span className="font-semibold">Accent colour</span>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={state.brand.accentColor}
                      onChange={(e) => updateBrand({ accentColor: e.target.value })}
                      className="h-9 w-12 cursor-pointer rounded-md border border-input bg-background"
                    />
                    <Input
                      value={state.brand.accentColor}
                      onChange={(e) => updateBrand({ accentColor: e.target.value })}
                      className="font-mono"
                    />
                  </div>
                </label>
              </div>
              <label className="flex flex-col gap-1.5 text-xs">
                <span className="font-semibold">Logo</span>
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-border bg-muted text-muted-foreground">
                    {state.brand.logoUrl ? (
                      <img src={state.brand.logoUrl} alt="Logo" className="h-full w-full rounded-lg object-cover" />
                    ) : (
                      <ImageIcon className="h-5 w-5" />
                    )}
                  </div>
                  <Button variant="outline" size="sm" onClick={() => toast("Logo upload arrives with the backend.")}>
                    <Upload className="h-3.5 w-3.5" /> {state.brand.logoUrl ? "Replace" : "Upload"}
                  </Button>
                </div>
                <span className="text-[11px] text-muted-foreground">Square PNG, 512×512 recommended.</span>
              </label>
            </div>
          </section>

          {/* Payments */}
          <section className="rounded-2xl border border-border bg-card p-4">
            <div className="flex items-baseline justify-between gap-2">
              <h3 className="text-sm font-semibold md:text-base">Checkout payment methods</h3>
              <Banknote className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="mt-0.5 text-xs text-muted-foreground">Which payment rails shoppers see at checkout. Connect more in <Link to="/settings/integrations" className="font-semibold text-brand hover:underline dark:text-primary">Integrations</Link>.</p>

            <ul className="mt-3 grid gap-2 sm:grid-cols-2">
              {paymentProviders.map((p) => {
                const enabled = state.paymentProviderIds.includes(p.id)
                return (
                  <li key={p.id}>
                    <button
                      type="button"
                      onClick={() => {
                        const next = enabled
                          ? state.paymentProviderIds.filter((id) => id !== p.id)
                          : [...state.paymentProviderIds, p.id]
                        void update({ paymentProviderIds: next })
                      }}
                      className={cn(
                        "flex w-full items-center gap-2.5 rounded-xl border p-2.5 text-left transition-colors",
                        enabled
                          ? "border-emerald-500/40 bg-emerald-500/5"
                          : "border-border bg-background hover:border-brand/40",
                      )}
                    >
                      <span
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-bold text-white shadow-sm"
                        style={{ background: p.brand }}
                      >
                        {p.letter}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold">{p.name}</span>
                        <span className="block truncate text-[11px] text-muted-foreground">{p.tagline}</span>
                      </span>
                      <span className={cn("inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full", enabled ? "bg-emerald-500 text-white" : "border border-border")}>
                        {enabled && <Check className="h-3 w-3" />}
                      </span>
                    </button>
                  </li>
                )
              })}
            </ul>
          </section>

          {/* Delivery */}
          <section className="rounded-2xl border border-border bg-card p-4">
            <div className="flex items-baseline justify-between gap-2">
              <h3 className="text-sm font-semibold md:text-base">Delivery options</h3>
              <Truck className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="mt-0.5 text-xs text-muted-foreground">Which couriers Pallio shows at checkout. The cheapest live rate wins by default.</p>

            <ul className="mt-3 grid gap-2 sm:grid-cols-2">
              {deliveryProviders.map((p) => {
                const enabled = state.deliveryProviderIds.includes(p.id)
                return (
                  <li key={p.id}>
                    <button
                      type="button"
                      onClick={() => {
                        const next = enabled
                          ? state.deliveryProviderIds.filter((id) => id !== p.id)
                          : [...state.deliveryProviderIds, p.id]
                        void update({ deliveryProviderIds: next })
                      }}
                      className={cn(
                        "flex w-full items-center gap-2.5 rounded-xl border p-2.5 text-left transition-colors",
                        enabled
                          ? "border-emerald-500/40 bg-emerald-500/5"
                          : "border-border bg-background hover:border-brand/40",
                      )}
                    >
                      <span
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-bold text-white shadow-sm"
                        style={{ background: p.brand }}
                      >
                        {p.letter}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold">{p.name}</span>
                        <span className="block truncate text-[11px] text-muted-foreground">{p.tagline}</span>
                      </span>
                      <span className={cn("inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full", enabled ? "bg-emerald-500 text-white" : "border border-border")}>
                        {enabled && <Check className="h-3 w-3" />}
                      </span>
                    </button>
                  </li>
                )
              })}
            </ul>
            {deliveryProviders.length === 0 && (
              <p className="mt-3 text-xs text-muted-foreground">
                No delivery providers connected yet. <Link to="/settings/integrations" className="font-semibold text-brand hover:underline dark:text-primary">Connect a courier →</Link>
              </p>
            )}
          </section>
        </div>

        {/* Pages overview + template swap */}
        <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
          <section className="rounded-2xl border border-border bg-card p-4">
            <div className="flex items-baseline justify-between gap-2">
              <h3 className="text-sm font-semibold md:text-base">Pages on your storefront</h3>
              <Layers className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="mt-0.5 text-xs text-muted-foreground">Every page that's live for shoppers right now. Customise content per page in the editor.</p>
            <ul className="mt-3 divide-y divide-border">
              {template.pages.map((p) => (
                <li key={p.path} className="flex items-center justify-between gap-3 py-2.5">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-semibold">{p.name}</p>
                      <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">{p.path}</code>
                    </div>
                    <p className="truncate text-[11px] text-muted-foreground">{p.description}</p>
                  </div>
                  <a
                    href={`${liveUrl}${p.path.replace(":id", "preview").replace(":slug", "demo")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex shrink-0 items-center gap-1 text-[11px] font-semibold text-brand hover:underline dark:text-primary"
                  >
                    Open <ExternalLink className="h-3 w-3" />
                  </a>
                </li>
              ))}
            </ul>
          </section>

          <aside className="flex flex-col gap-4">
            {/* Template swap */}
            <section className="rounded-2xl border border-border bg-card p-4">
              <h3 className="text-sm font-semibold md:text-base">Template</h3>
              <p className="mt-0.5 text-xs text-muted-foreground">Swap to a different design — your products + orders carry over, only the look changes.</p>
              <div className="mt-3 flex items-center gap-3 rounded-xl border border-border bg-background p-2.5">
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-sm font-bold text-white"
                  style={{ background: template.colors.primary }}
                >
                  {template.name[0]}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{template.name}</p>
                  <p className="truncate text-[11px] text-muted-foreground">{template.tagline}</p>
                </div>
              </div>
              <div className="mt-3 flex gap-2">
                <Link to={`/storefront/templates/${template.id}`} className="flex-1">
                  <Button variant="outline" size="sm" className="w-full">Preview</Button>
                </Link>
                <Link to="/storefront/templates" className="flex-1">
                  <Button size="sm" className="w-full">Browse all <ArrowRight className="h-3 w-3" /></Button>
                </Link>
              </div>
            </section>

            {/* Trust + danger zone */}
            <section className="rounded-2xl border border-border bg-card p-4">
              <h3 className="text-sm font-semibold md:text-base">Other settings</h3>
              <ul className="mt-3 space-y-2 text-sm">
                <li>
                  <Link to="/settings/business" className="flex items-center gap-2 rounded-lg p-2 transition-colors hover:bg-accent/40">
                    <Settings className="h-4 w-4 text-muted-foreground" />
                    <span className="flex-1">Business info on receipts</span>
                    <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                  </Link>
                </li>
                <li>
                  <Link to="/settings/taxes" className="flex items-center gap-2 rounded-lg p-2 transition-colors hover:bg-accent/40">
                    <Settings className="h-4 w-4 text-muted-foreground" />
                    <span className="flex-1">Tax rates shown at checkout</span>
                    <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                  </Link>
                </li>
                <li>
                  <Link to="/settings/notifications" className="flex items-center gap-2 rounded-lg p-2 transition-colors hover:bg-accent/40">
                    <Settings className="h-4 w-4 text-muted-foreground" />
                    <span className="flex-1">Email customers automatically</span>
                    <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                  </Link>
                </li>
              </ul>
            </section>

            <section className="rounded-2xl border border-dashed border-border bg-muted/30 p-3 text-xs text-muted-foreground">
              <div className="flex items-start gap-2">
                <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                <p>
                  SSL + DDoS protection are managed for you. Pallio also runs daily backups of the storefront content.
                </p>
              </div>
            </section>
          </aside>
        </div>
      </div>
    </PageShell>
  )
}

// Sentinel — `LinkIcon` is reserved for the upcoming "shareable
// link" rail; void-ref keeps the import in place without tripping
// `noUnusedLocals`.
void LinkIcon
