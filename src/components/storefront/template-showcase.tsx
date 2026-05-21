import * as React from "react"
import { Box, Check, CheckCircle2, ChevronLeft, ChevronRight, ChevronUp, Clock, CreditCard, Headphones, Heart, Instagram, Mail, MapPin, MessageCircle, Menu, Package, Phone as PhoneIcon, Search, Shield, ShoppingBag, Star, Trash2, Truck, User } from "lucide-react"
import type { StorefrontStyle, StorefrontTemplate } from "@/lib/storefront/types"
import { cn } from "@/lib/utils"

// ====================================================================
// Approach
// --------------------------------------------------------------------
// Render every page mockup at NATURAL device resolution (1440×900 for
// desktop, 390×844 for mobile, like real iPhone + MacBook). Then use
// CSS `transform: scale(...)` to fit it into the device shell. This
// way text sizes (text-3xl, text-6xl, etc.) read like they would on a
// real device — proportional, not crammed.
//
// The device shells are plain rounded rectangles with PROPORTIONAL
// corner radius (width * 0.14 for phone, width * 0.025 for laptop)
// so they don't degrade into pill shapes at thumbnail size.
//
// Each `template.style` (luxe / editorial / bold / minimal / playful)
// gets its own page renderer with distinct typography + layout +
// section choice. Imagery is keyed by `template.sector`.
// ====================================================================

const REF_DESKTOP_W = 1440
const REF_DESKTOP_H = 900
const REF_PHONE_W   = 390
const REF_PHONE_H   = 844

type PageId =
  | "home" | "shop" | "product" | "cart" | "checkout"
  | "about" | "contact" | "faq" | "account" | "track" | "wishlist"
const PAGES: { id: PageId; label: string }[] = [
  { id: "home",     label: "Home" },
  { id: "shop",     label: "Shop" },
  { id: "product",  label: "Product" },
  { id: "cart",     label: "Cart" },
  { id: "checkout", label: "Checkout" },
  { id: "account",  label: "Account" },
  { id: "track",    label: "Track order" },
  { id: "wishlist", label: "Wishlist" },
  { id: "contact",  label: "Contact" },
  { id: "faq",      label: "FAQ" },
  { id: "about",    label: "About" },
]

type Props = {
  template: StorefrontTemplate
  /** Gallery card thumbnail variant — laptop + phone, no controls. */
  compact?: boolean
}

export function TemplateShowcase({ template, compact = false }: Props) {
  const [index, setIndex] = React.useState(0)
  const page = PAGES[index].id

  React.useEffect(() => {
    if (compact) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft")  setIndex((i) => (i - 1 + PAGES.length) % PAGES.length)
      if (e.key === "ArrowRight") setIndex((i) => (i + 1) % PAGES.length)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [compact])

  // ----- compact (gallery card) -----
  if (compact) {
    return (
      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{ background: `linear-gradient(135deg, ${template.colors.primary}1A, ${template.colors.accent}10 60%, transparent)` }}
      >
        <div className="flex items-end gap-2 px-3">
          <Laptop width={320}>
            <ScaledContent natW={REF_DESKTOP_W} natH={REF_DESKTOP_H} screenW={304}>
              <Page template={template} page="home" desktop />
            </ScaledContent>
          </Laptop>
          <Phone width={92}>
            <ScaledContent natW={REF_PHONE_W} natH={REF_PHONE_H} screenW={84}>
              <Page template={template} page="home" desktop={false} />
            </ScaledContent>
          </Phone>
        </div>
      </div>
    )
  }

  // ----- full detail showcase -----
  return (
    <section
      className="relative overflow-hidden rounded-2xl border border-border"
      style={{ background: `linear-gradient(135deg, ${template.colors.primary}15, ${template.colors.accent}10 60%, transparent)` }}
    >
      <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full blur-3xl" style={{ background: `${template.colors.primary}30` }} aria-hidden />

      <div className="relative">
        <div className="flex flex-col items-center gap-4 px-12 py-8 md:flex-row md:items-end md:justify-center md:gap-8 md:py-12">
          {/* Desktop laptop */}
          <div className="hidden md:block">
            <Laptop width={760}>
              <ScaledContent natW={REF_DESKTOP_W} natH={REF_DESKTOP_H} screenW={722}>
                <Page template={template} page={page} desktop />
              </ScaledContent>
            </Laptop>
          </div>
          {/* Mobile laptop */}
          <div className="md:hidden">
            <Laptop width={420}>
              <ScaledContent natW={REF_DESKTOP_W} natH={REF_DESKTOP_H} screenW={400}>
                <Page template={template} page={page} desktop />
              </ScaledContent>
            </Laptop>
          </div>
          {/* Phone — same on both breakpoints */}
          <Phone width={206}>
            <ScaledContent natW={REF_PHONE_W} natH={REF_PHONE_H} screenW={190}>
              <Page template={template} page={page} desktop={false} />
            </ScaledContent>
          </Phone>
        </div>

        <button type="button" onClick={() => setIndex((i) => (i - 1 + PAGES.length) % PAGES.length)} aria-label="Previous page" className="absolute left-2 top-1/2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-background/90 text-foreground shadow-md backdrop-blur-sm transition-colors hover:bg-background md:flex">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button type="button" onClick={() => setIndex((i) => (i + 1) % PAGES.length)} aria-label="Next page" className="absolute right-2 top-1/2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-background/90 text-foreground shadow-md backdrop-blur-sm transition-colors hover:bg-background md:flex">
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      <div className="flex items-center justify-between border-t border-border/60 px-4 py-3 md:justify-center md:gap-4">
        <button type="button" onClick={() => setIndex((i) => (i - 1 + PAGES.length) % PAGES.length)} aria-label="Previous page" className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border bg-background text-muted-foreground transition-colors hover:bg-accent hover:text-foreground md:hidden">
          <ChevronLeft className="h-4 w-4" />
        </button>
        <div className="flex flex-1 justify-center gap-1.5 md:flex-none">
          {PAGES.map((p, i) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setIndex(i)}
              aria-current={i === index ? "true" : undefined}
              className={cn(
                "rounded-full px-3 py-1 text-[11px] font-semibold transition-colors",
                i === index ? "bg-foreground text-background" : "text-muted-foreground hover:bg-accent hover:text-foreground",
              )}
            >
              {p.label}
            </button>
          ))}
        </div>
        <button type="button" onClick={() => setIndex((i) => (i + 1) % PAGES.length)} aria-label="Next page" className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border bg-background text-muted-foreground transition-colors hover:bg-accent hover:text-foreground md:hidden">
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </section>
  )
}

export const StorefrontPreview = TemplateShowcase

// ====================================================================
// Device shells — proportional rounding so they don't degenerate
// into pills at thumbnail size.
// ====================================================================

function Phone({ width, children }: { width: number; children: React.ReactNode }) {
  // Compute height so the INNER screen matches REF_PHONE_H/REF_PHONE_W
  // exactly — eliminates the white gap at the bottom when content
  // is scaled to fit.
  const radius = Math.max(8, width * 0.14)
  const bezel = Math.max(3, width * 0.025)
  const innerW = width - 2 * bezel
  const innerH = innerW * (REF_PHONE_H / REF_PHONE_W)
  const height = innerH + 2 * bezel
  const innerRadius = Math.max(6, radius - bezel)
  const islandW = Math.max(20, width * 0.32)
  const islandH = Math.max(4, width * 0.05)
  return (
    <div
      className="relative shrink-0 shadow-2xl shadow-black/40"
      style={{
        width,
        height,
        borderRadius: radius,
        background: "#0a0a0a",
        padding: bezel,
      }}
    >
      <div
        className="relative h-full w-full overflow-hidden"
        style={{ borderRadius: innerRadius, background: "#0a0a0a" }}
      >
        {children}
        {/* Dynamic Island — visual cue so the top of the screen
            doesn't look like a stray dark band. */}
        <span
          className="absolute left-1/2 -translate-x-1/2 rounded-full bg-black/90"
          style={{ top: Math.max(3, width * 0.025), width: islandW, height: islandH }}
          aria-hidden
        />
      </div>
    </div>
  )
}

function Laptop({ width, children }: { width: number; children: React.ReactNode }) {
  // Inner screen matches content aspect (REF_DESKTOP_H/REF_DESKTOP_W).
  const bezel        = Math.max(4, width * 0.013)
  const innerW       = width - 2 * bezel
  const innerH       = innerW * (REF_DESKTOP_H / REF_DESKTOP_W)
  const screenHeight = innerH + 2 * bezel
  const baseHeight   = Math.max(4, Math.round(screenHeight * 0.05))
  const radius       = Math.max(4, width * 0.018)
  const innerRadius  = Math.max(2, radius - 2)
  return (
    <div className="relative shrink-0" style={{ width }}>
      <div
        className="relative w-full shadow-2xl shadow-black/40"
        style={{ height: screenHeight, background: "#0a0a0a", padding: bezel, borderTopLeftRadius: radius, borderTopRightRadius: radius, borderBottomLeftRadius: 4, borderBottomRightRadius: 4 }}
      >
        <div className="relative h-full w-full overflow-hidden" style={{ borderRadius: innerRadius, background: "#0a0a0a" }}>
          {children}
        </div>
      </div>
      <div
        className="relative mx-auto"
        style={{
          height: baseHeight,
          width: "104%",
          marginLeft: "-2%",
          background: "linear-gradient(180deg, #3f3f46, #18181b)",
          clipPath: "polygon(1.5% 0%, 98.5% 0%, 100% 100%, 0% 100%)",
        }}
      />
      <div className="mx-auto h-2 max-w-[78%] rounded-full bg-black/30 blur-md" aria-hidden />
    </div>
  )
}

function ScaledContent({
  natW, natH, screenW, children,
}: {
  natW: number
  natH: number
  screenW: number
  children: React.ReactNode
}) {
  const scale = screenW / natW
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div
        style={{
          width: natW,
          height: natH,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
        }}
      >
        {children}
      </div>
    </div>
  )
}

// ====================================================================
// Page dispatcher
// ====================================================================

type Ctx = {
  template: StorefrontTemplate
  hero: string
  products: { name: string; price: string; image: string }[]
  desktop: boolean
}

function Page({ template, page, desktop }: { template: StorefrontTemplate; page: PageId; desktop: boolean }) {
  const sector = template.sector
  const ctx: Ctx = {
    template,
    hero: SECTOR_HERO[sector] ?? SECTOR_HERO.fashion,
    products: SECTOR_PRODUCTS[sector] ?? SECTOR_PRODUCTS.fashion,
    desktop,
  }
  const fn = PAGE_RENDERERS[template.style]?.[page] ?? PAGE_RENDERERS.minimal[page]
  return fn(ctx)
}

// ====================================================================
// Per-style HOME dispatcher — picks variant 0 (default) or 1 from
// the template definition so templates within the same style group
// don't look identical.
// ====================================================================

// Array of renderers per style — index `n` is variant `n`. If a
// template requests a variant the style doesn't have, fall back to
// variant 0.
function DispatchHome(style: StorefrontStyle): (ctx: Ctx) => React.ReactNode {
  return (ctx) => {
    const variant = ctx.template.variant ?? 0
    const list = HOME_VARIANTS[style]
    return (list[variant] ?? list[0])(ctx)
  }
}

// Forward-declared so the registry above can reference these. Each
// new variant is added below in this file.
const HOME_VARIANTS: Record<StorefrontStyle, Array<(ctx: Ctx) => React.ReactNode>> = {
  luxe:      [],
  editorial: [],
  bold:      [],
  minimal:   [],
  playful:   [],
}

// ====================================================================
// LUXE — dark, full-bleed photo, serif italic
// ====================================================================

function HomeLuxe({ template, hero, products, desktop }: Ctx) {
  const { accent } = template.colors
  if (!desktop) {
    return (
      <div className="flex h-full flex-col bg-zinc-950 text-zinc-100" style={{ width: REF_PHONE_W, height: REF_PHONE_H }}>
        <header className="flex items-center justify-between px-6 pt-14 pb-4">
          <Menu className="h-6 w-6 text-zinc-300" />
          <span className="font-serif text-xl italic" style={{ color: accent }}>{template.name}</span>
          <ShoppingBag className="h-6 w-6 text-zinc-300" />
        </header>
        <div className="relative flex-1">
          <img src={hero} alt="" loading="lazy" referrerPolicy="no-referrer" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/10" />
          <div className="absolute inset-0 flex flex-col justify-end p-8">
            <span className="font-serif text-xs uppercase tracking-[0.4em]" style={{ color: accent }}>The edit · spring 26</span>
            <h1 className="mt-2 font-serif text-6xl italic leading-[0.95]">{luxeHeadline(template.sector)}</h1>
            <button className="mt-6 self-start border px-6 py-2 text-xs uppercase tracking-[0.4em]" style={{ borderColor: accent, color: accent }}>Enter the world</button>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-px bg-zinc-800 p-px">
          {products.slice(0, 2).map((p, i) => (
            <div key={i} className="relative aspect-[3/4] bg-zinc-950">
              <img src={p.image} alt={p.name} loading="lazy" referrerPolicy="no-referrer" className="h-full w-full object-cover opacity-90" />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-3">
                <p className="font-serif text-sm italic">{p.name}</p>
                <p className="text-sm font-bold tabular-nums" style={{ color: accent }}>{p.price}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }
  return (
    <div className="flex h-full flex-col bg-zinc-950 text-zinc-100" style={{ width: REF_DESKTOP_W, height: REF_DESKTOP_H }}>
      <header className="flex items-center justify-between border-b border-zinc-800/60 px-16 py-6">
        <span className="font-serif text-3xl italic" style={{ color: accent }}>{template.name}</span>
        <nav className="flex gap-10 text-xs uppercase tracking-[0.4em] text-zinc-400">
          <span>Shop</span><span>Lookbook</span><span>Story</span><span>Stockists</span><span>Journal</span>
        </nav>
        <div className="flex items-center gap-5 text-zinc-400">
          <Search className="h-5 w-5" />
          <User className="h-5 w-5" />
          <ShoppingBag className="h-5 w-5" />
        </div>
      </header>
      <div className="relative flex-1">
        <img src={hero} alt="" loading="lazy" referrerPolicy="no-referrer" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/30 to-transparent" />
        <div className="absolute inset-0 flex items-center px-20">
          <div className="max-w-[55%]">
            <span className="font-serif text-sm uppercase tracking-[0.5em]" style={{ color: accent }}>The edit · spring 26</span>
            <h1 className="mt-4 font-serif text-8xl italic leading-[0.92]">{luxeHeadline(template.sector)}</h1>
            <p className="mt-6 max-w-md font-serif text-lg italic text-zinc-300">Hand-finished pieces from our Lagos atelier. Shipped worldwide, returned freely.</p>
            <div className="mt-8 flex gap-4">
              <button className="border px-8 py-3 text-xs uppercase tracking-[0.4em]" style={{ borderColor: accent, color: accent }}>Enter the world</button>
              <button className="text-xs uppercase tracking-[0.4em] text-zinc-400 underline underline-offset-8">View lookbook</button>
            </div>
          </div>
        </div>
      </div>
      <section className="border-t border-zinc-800 px-16 py-10">
        <div className="flex items-baseline justify-between">
          <h2 className="font-serif text-4xl italic">Featured this week</h2>
          <span className="font-serif text-sm uppercase tracking-[0.4em]" style={{ color: accent }}>View all →</span>
        </div>
        <div className="mt-6 grid grid-cols-4 gap-px bg-zinc-800">
          {products.slice(0, 4).map((p, i) => (
            <div key={i} className="relative bg-zinc-950">
              <div className="aspect-[3/4] overflow-hidden">
                <img src={p.image} alt={p.name} loading="lazy" referrerPolicy="no-referrer" className="h-full w-full object-cover opacity-95" />
              </div>
              <div className="p-4">
                <p className="font-serif text-lg italic">{p.name}</p>
                <p className="mt-1 text-base font-bold tabular-nums" style={{ color: accent }}>{p.price}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

// ====================================================================
// EDITORIAL — cream paper, magazine grid, serif + drop caps
// ====================================================================

function HomeEditorial({ template, hero, products, desktop }: Ctx) {
  const { primary } = template.colors
  if (!desktop) {
    return (
      <div className="flex h-full flex-col bg-[#faf8f3] text-zinc-900" style={{ width: REF_PHONE_W, height: REF_PHONE_H }}>
        <header className="flex items-center justify-between border-b-2 border-zinc-900 px-6 pt-14 pb-3">
          <Menu className="h-6 w-6" />
          <span className="font-serif text-2xl font-bold">{template.name}</span>
          <ShoppingBag className="h-6 w-6" />
        </header>
        <div className="px-6 py-6">
          <span className="font-serif text-xs uppercase tracking-[0.4em] text-zinc-600">Issue 14 · Volume 03</span>
          <h1 className="mt-3 font-serif text-5xl italic leading-[0.95]">{editorialHeadline(template.sector)}</h1>
        </div>
        <div className="relative aspect-[4/5] w-full">
          <img src={hero} alt="" loading="lazy" referrerPolicy="no-referrer" className="h-full w-full object-cover" />
        </div>
        <div className="flex-1 px-6 py-5">
          <p className="font-serif text-base leading-relaxed text-zinc-700">
            <span className="float-left mr-1 mt-1 font-serif text-6xl font-bold leading-[0.7]" style={{ color: primary }}>P</span>
            ieces curated for the way you actually live. Crafted in Lagos. Shipped worldwide. Returned freely.
          </p>
        </div>
      </div>
    )
  }
  return (
    <div className="flex h-full flex-col bg-[#faf8f3] text-zinc-900" style={{ width: REF_DESKTOP_W, height: REF_DESKTOP_H }}>
      <header className="flex items-center justify-between border-b-2 border-zinc-900 px-16 py-5">
        <span className="font-serif text-xs uppercase tracking-[0.4em] text-zinc-700">Issue 14 · Volume 03</span>
        <span className="font-serif text-3xl font-bold">{template.name}</span>
        <div className="flex items-center gap-4 text-zinc-700">
          <Search className="h-5 w-5" /><User className="h-5 w-5" /><ShoppingBag className="h-5 w-5" />
        </div>
      </header>
      <div className="grid flex-1 grid-cols-[55%_45%]">
        <div className="relative">
          <img src={hero} alt="" loading="lazy" referrerPolicy="no-referrer" className="h-full w-full object-cover" />
        </div>
        <div className="flex flex-col justify-center px-16 py-12">
          <span className="font-serif text-sm uppercase tracking-[0.5em] text-zinc-600">The cover story</span>
          <h1 className="mt-4 font-serif text-7xl italic leading-[0.95]">{editorialHeadline(template.sector)}</h1>
          <p className="mt-8 font-serif text-lg leading-relaxed text-zinc-700">
            <span className="float-left mr-2 mt-1 font-serif text-7xl font-bold leading-[0.75]" style={{ color: primary }}>P</span>
            ieces curated for the way you actually live. Crafted in Lagos by makers we know by name, shipped worldwide, returned freely. Every piece is one of a small batch.
          </p>
          <button className="mt-8 self-start border-b-2 font-serif text-base italic" style={{ borderColor: primary, color: primary }}>Read the issue →</button>
        </div>
      </div>
      <section className="border-t-2 border-zinc-900 px-16 py-8">
        <h2 className="font-serif text-2xl italic">In this issue</h2>
        <div className="mt-4 grid grid-cols-4 gap-6">
          {products.slice(0, 4).map((p, i) => (
            <div key={i}>
              <div className="aspect-[4/5] overflow-hidden">
                <img src={p.image} alt={p.name} loading="lazy" referrerPolicy="no-referrer" className="h-full w-full object-cover" />
              </div>
              <p className="mt-2 font-serif text-base italic">{p.name}</p>
              <p className="text-sm font-bold tabular-nums">{p.price}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

// ====================================================================
// BOLD — brand-color canvas, huge sans-serif, mixed-blend imagery
// ====================================================================

function HomeBold({ template, hero, products, desktop }: Ctx) {
  const { primary, accent } = template.colors
  if (!desktop) {
    return (
      <div className="flex h-full flex-col" style={{ width: REF_PHONE_W, height: REF_PHONE_H, background: primary }}>
        <header className="flex items-center justify-between px-6 pt-14 pb-4 text-white">
          <Menu className="h-6 w-6" />
          <span className="text-xl font-black uppercase tracking-tight">{template.name}</span>
          <ShoppingBag className="h-6 w-6" />
        </header>
        <div className="px-6 py-4 text-white">
          <h1 className="text-7xl font-black uppercase leading-[0.85] tracking-tight">
            {boldHeadline(template.sector).split(" ").map((w, i, arr) => (
              <span key={i} className="block" style={i === arr.length - 1 ? { color: accent } : undefined}>{w}</span>
            ))}
          </h1>
          <button className="mt-6 inline-flex items-center gap-2 px-6 py-3 text-sm font-black uppercase tracking-widest text-black" style={{ background: accent }}>Shop drop 01 →</button>
        </div>
        <div className="relative aspect-square w-full" style={{ background: accent }}>
          <img src={hero} alt="" loading="lazy" referrerPolicy="no-referrer" className="absolute inset-0 h-full w-full object-cover mix-blend-multiply" />
          <span className="absolute right-4 top-4 border-2 border-black bg-white px-2 py-1 text-xs font-black uppercase text-black">New</span>
        </div>
        <div className="grid grid-cols-2 border-t-4 border-black bg-white">
          {products.slice(0, 2).map((p, i) => (
            <div key={i} className="border-r-4 border-black last:border-r-0">
              <div className="aspect-square overflow-hidden">
                <img src={p.image} alt={p.name} loading="lazy" referrerPolicy="no-referrer" className="h-full w-full object-cover" />
              </div>
              <div className="px-3 py-2">
                <p className="truncate text-sm font-black uppercase">{p.name}</p>
                <p className="text-base font-black tabular-nums" style={{ color: primary }}>{p.price}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }
  return (
    <div className="flex h-full flex-col" style={{ width: REF_DESKTOP_W, height: REF_DESKTOP_H, background: primary }}>
      <header className="flex items-center justify-between px-16 py-6 text-white">
        <span className="text-2xl font-black uppercase tracking-tight">{template.name}</span>
        <nav className="flex gap-8 text-sm font-black uppercase tracking-wider">
          <span>Shop</span><span>Drops</span><span>Lookbook</span><span>Stories</span>
        </nav>
        <div className="flex items-center gap-5">
          <Search className="h-5 w-5" /><User className="h-5 w-5" /><ShoppingBag className="h-5 w-5" />
        </div>
      </header>
      <div className="grid flex-1 grid-cols-2">
        <div className="flex flex-col justify-center px-16 text-white">
          <span className="text-xs font-black uppercase tracking-widest" style={{ color: accent }}>Drop 01 · live now</span>
          <h1 className="mt-4 text-[9rem] font-black uppercase leading-[0.82] tracking-tight">
            {boldHeadline(template.sector).split(" ").map((w, i, arr) => (
              <span key={i} className="block" style={i === arr.length - 1 ? { color: accent } : undefined}>{w}</span>
            ))}
          </h1>
          <div className="mt-10 flex gap-4">
            <button className="px-8 py-4 text-sm font-black uppercase tracking-widest text-black shadow-md" style={{ background: accent }}>Shop drop 01 →</button>
            <button className="border-2 border-white px-8 py-4 text-sm font-black uppercase tracking-widest">Watch film</button>
          </div>
        </div>
        <div className="relative" style={{ background: accent }}>
          <img src={hero} alt="" loading="lazy" referrerPolicy="no-referrer" className="absolute inset-0 h-full w-full object-cover mix-blend-multiply" />
          <span className="absolute right-8 top-8 border-4 border-black bg-white px-4 py-2 text-sm font-black uppercase text-black">New season</span>
        </div>
      </div>
      <section className="grid grid-cols-4 border-t-8 border-black bg-white">
        {products.slice(0, 4).map((p, i) => (
          <div key={i} className="border-r-8 border-black last:border-r-0">
            <div className="aspect-square overflow-hidden">
              <img src={p.image} alt={p.name} loading="lazy" referrerPolicy="no-referrer" className="h-full w-full object-cover" />
            </div>
            <div className="px-5 py-4">
              <p className="text-lg font-black uppercase">{p.name}</p>
              <p className="mt-1 text-xl font-black tabular-nums" style={{ color: primary }}>{p.price}</p>
            </div>
          </div>
        ))}
      </section>
    </div>
  )
}

// ====================================================================
// MINIMAL — pure white, lots of whitespace, light + tracked
// ====================================================================

function HomeMinimal({ template, hero, products, desktop }: Ctx) {
  const { primary } = template.colors
  if (!desktop) {
    return (
      <div className="flex h-full flex-col bg-white text-zinc-900" style={{ width: REF_PHONE_W, height: REF_PHONE_H }}>
        <header className="flex items-center justify-between px-6 pt-14 pb-4">
          <Menu className="h-5 w-5 text-zinc-700" />
          <span className="text-xs uppercase tracking-[0.5em]" style={{ color: primary }}>{template.name}</span>
          <ShoppingBag className="h-5 w-5 text-zinc-700" />
        </header>
        <div className="flex flex-col items-center px-6 py-8">
          <span className="text-xs uppercase tracking-[0.5em] text-zinc-500">Spring · 26</span>
          <h1 className="mt-4 text-center text-5xl font-light tracking-tight" style={{ color: primary }}>{minimalHeadline(template.sector)}</h1>
          <p className="mt-4 max-w-xs text-center text-sm leading-relaxed text-zinc-500">Considered design. Honest pricing. Free returns within 30 days.</p>
        </div>
        <div className="relative aspect-square w-full px-12">
          <img src={hero} alt="" loading="lazy" referrerPolicy="no-referrer" className="h-full w-full object-cover" />
        </div>
        <div className="mt-6 flex justify-center">
          <button className="border-b text-xs uppercase tracking-[0.4em]" style={{ borderColor: primary, color: primary }}>Browse the edit →</button>
        </div>
        <div className="mt-auto grid grid-cols-2 gap-4 px-6 py-8">
          {products.slice(0, 2).map((p, i) => (
            <div key={i} className="text-center">
              <div className="aspect-square overflow-hidden bg-zinc-50">
                <img src={p.image} alt={p.name} loading="lazy" referrerPolicy="no-referrer" className="h-full w-full object-cover" />
              </div>
              <p className="mt-2 truncate text-sm text-zinc-700">{p.name}</p>
              <p className="text-sm tabular-nums" style={{ color: primary }}>{p.price}</p>
            </div>
          ))}
        </div>
      </div>
    )
  }
  return (
    <div className="flex h-full flex-col bg-white text-zinc-900" style={{ width: REF_DESKTOP_W, height: REF_DESKTOP_H }}>
      <header className="flex items-center justify-between border-b border-zinc-100 px-16 py-6">
        <span className="text-sm uppercase tracking-[0.5em]" style={{ color: primary }}>{template.name}</span>
        <nav className="flex gap-12 text-xs uppercase tracking-[0.4em] text-zinc-600">
          <span>Shop</span><span>Story</span><span>Care</span><span>Journal</span><span>Contact</span>
        </nav>
        <div className="flex items-center gap-5 text-zinc-600">
          <Search className="h-5 w-5" /><User className="h-5 w-5" /><ShoppingBag className="h-5 w-5" />
        </div>
      </header>
      <div className="grid flex-1 grid-cols-2">
        <div className="flex flex-col items-start justify-center px-20">
          <span className="text-xs uppercase tracking-[0.5em] text-zinc-500">Spring · 26</span>
          <h1 className="mt-6 text-7xl font-light leading-[1.05] tracking-tight" style={{ color: primary }}>{minimalHeadline(template.sector)}</h1>
          <p className="mt-6 max-w-md text-lg leading-relaxed text-zinc-500">Considered design. Honest pricing. Free returns within 30 days, anywhere in Nigeria.</p>
          <button className="mt-10 border-b-2 pb-1 text-xs uppercase tracking-[0.4em]" style={{ borderColor: primary, color: primary }}>Browse the edit →</button>
        </div>
        <div className="relative">
          <img src={hero} alt="" loading="lazy" referrerPolicy="no-referrer" className="h-full w-full object-cover" />
        </div>
      </div>
      <section className="border-t border-zinc-100 px-16 py-10">
        <div className="flex items-baseline justify-between">
          <h2 className="text-sm uppercase tracking-[0.5em] text-zinc-500">Current edit</h2>
          <span className="text-xs uppercase tracking-[0.4em]" style={{ color: primary }}>View all →</span>
        </div>
        <div className="mt-6 grid grid-cols-4 gap-6">
          {products.slice(0, 4).map((p, i) => (
            <div key={i}>
              <div className="aspect-[4/5] overflow-hidden bg-zinc-50">
                <img src={p.image} alt={p.name} loading="lazy" referrerPolicy="no-referrer" className="h-full w-full object-cover" />
              </div>
              <p className="mt-3 text-base text-zinc-700">{p.name}</p>
              <p className="mt-0.5 text-base tabular-nums" style={{ color: primary }}>{p.price}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

// ====================================================================
// PLAYFUL — rounded everything, pastel grad bg, gradient CTAs
// ====================================================================

function HomePlayful({ template, hero, products, desktop }: Ctx) {
  const { primary, accent } = template.colors
  if (!desktop) {
    return (
      <div className="flex h-full flex-col" style={{ width: REF_PHONE_W, height: REF_PHONE_H, background: `linear-gradient(180deg, ${primary}15, white)` }}>
        <header className="flex items-center justify-between px-6 pt-14 pb-4">
          <Menu className="h-6 w-6 text-zinc-700" />
          <span className="text-xl font-black tracking-tight" style={{ color: primary }}>{template.name}</span>
          <span className="relative flex h-9 w-9 items-center justify-center rounded-full text-white" style={{ background: accent }}>
            <ShoppingBag className="h-4 w-4" />
            <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-white text-[10px] font-black" style={{ color: primary }}>3</span>
          </span>
        </header>
        <div className="relative mx-4 mt-2 overflow-hidden rounded-3xl" style={{ background: accent }}>
          <img src={hero} alt="" loading="lazy" referrerPolicy="no-referrer" className="aspect-[4/3] h-full w-full object-cover mix-blend-multiply" />
          <div className="absolute inset-0 flex flex-col justify-end p-5 text-white">
            <span className="text-xs font-black uppercase tracking-widest text-white/80">Today's pick</span>
            <h1 className="text-4xl font-black leading-tight">{playfulHeadline(template.sector)}</h1>
            <button className="mt-3 inline-flex w-fit items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-black" style={{ color: primary }}>Order now →</button>
          </div>
        </div>
        {/* Category icon strip — proper food-app feel */}
        <div className="flex gap-3 overflow-x-auto px-4 py-4">
          {[
            { emoji: "🍚", label: "Mains" },
            { emoji: "🥗", label: "Sides" },
            { emoji: "🍹", label: "Drinks" },
            { emoji: "🍰", label: "Sweet" },
            { emoji: "🔥", label: "Combos" },
          ].map((c, i) => (
            <div key={c.label} className="flex shrink-0 flex-col items-center gap-1.5">
              <div className={cn("flex h-12 w-12 items-center justify-center rounded-2xl text-2xl shadow-sm", i === 0 ? "ring-2" : "bg-white")} style={i === 0 ? { background: primary, color: "white" } : { background: "white" }}>{c.emoji}</div>
              <span className="text-[10px] font-bold text-zinc-700">{c.label}</span>
            </div>
          ))}
        </div>
        {/* Section heading + chips */}
        <div className="px-4">
          <div className="flex items-baseline justify-between">
            <h2 className="text-lg font-black" style={{ color: primary }}>Popular today</h2>
            <span className="text-[10px] font-black uppercase tracking-wider" style={{ color: accent }}>See all →</span>
          </div>
          <div className="mt-2 flex gap-1.5 overflow-x-auto">
            {["All", "New", "Bestsellers", "Sale"].map((c, i) => (
              <span key={c} className={cn("shrink-0 rounded-full px-3 py-1 text-xs font-bold", i === 0 ? "" : "border")} style={i === 0 ? { background: primary, color: "white" } : { borderColor: `${primary}33`, color: "#52525b", background: "white" }}>{c}</span>
            ))}
          </div>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-3 px-4 pb-4">
          {products.slice(0, 4).map((p, i) => (
            <div key={i} className="overflow-hidden rounded-2xl bg-white shadow-sm">
              <div className="relative aspect-[5/4]">
                <img src={p.image} alt={p.name} loading="lazy" referrerPolicy="no-referrer" className="h-full w-full object-cover" />
                <div className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-white/95 shadow-sm">
                  <Heart className="h-3 w-3" style={{ color: accent }} />
                </div>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1.5">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[11px] font-bold leading-tight">{p.name}</p>
                  <div className="mt-0.5 flex items-baseline gap-1.5">
                    <p className="text-xs font-black tabular-nums leading-none" style={{ color: primary }}>{p.price}</p>
                    <p className="text-[9px] text-zinc-500">★ 4.{8 + (i % 2)}</p>
                  </div>
                </div>
                <button className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-white shadow-sm" style={{ background: primary }}>
                  <span className="text-base leading-none">+</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }
  return (
    <div className="flex h-full flex-col" style={{ width: REF_DESKTOP_W, height: REF_DESKTOP_H, background: `linear-gradient(180deg, ${primary}15, white)` }}>
      <header className="flex items-center justify-between px-16 py-6">
        <span className="text-3xl font-black tracking-tight" style={{ color: primary }}>{template.name}</span>
        <nav className="flex gap-10 text-sm font-bold text-zinc-700">
          <span>Shop</span><span>Order</span><span>Locations</span><span>About</span>
        </nav>
        <div className="flex items-center gap-4">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-zinc-700"><Search className="h-4 w-4" /></span>
          <span className="relative flex h-10 w-10 items-center justify-center rounded-full text-white" style={{ background: accent }}>
            <ShoppingBag className="h-4 w-4" />
            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-white text-xs font-black" style={{ color: primary }}>3</span>
          </span>
        </div>
      </header>
      {/* Hero + featured grid */}
      <div className="grid grid-cols-[1.3fr_1fr] gap-6 px-16 pb-5">
        <div className="relative overflow-hidden rounded-3xl" style={{ background: accent }}>
          <img src={hero} alt="" loading="lazy" referrerPolicy="no-referrer" className="absolute inset-0 h-full w-full object-cover mix-blend-multiply" />
          <div className="absolute inset-0 flex flex-col justify-end p-10 text-white">
            <span className="inline-flex w-fit items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-black uppercase tracking-widest backdrop-blur-sm">
              <span className="h-2 w-2 rounded-full bg-white" /> Open · 30 min delivery
            </span>
            <h1 className="mt-3 text-6xl font-black leading-[0.95]">{playfulHeadline(template.sector)}</h1>
            <p className="mt-3 max-w-md text-base font-bold text-white/90">Delivered in 30 minutes or your next order's free. Pick up at any branch in Lagos + Abuja.</p>
            <div className="mt-5 flex gap-3">
              <button className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-base font-black" style={{ color: primary }}>Order now →</button>
              <button className="rounded-full border-2 border-white px-6 py-3 text-base font-black text-white">See full menu</button>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 grid-rows-2 gap-3">
          {products.slice(0, 4).map((p, i) => (
            <div key={i} className="overflow-hidden rounded-2xl bg-white shadow-md">
              <div className="relative aspect-[5/4]">
                <img src={p.image} alt={p.name} loading="lazy" referrerPolicy="no-referrer" className="h-full w-full object-cover" />
                <div className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white/95 shadow-sm">
                  <Heart className="h-3.5 w-3.5" style={{ color: accent }} />
                </div>
              </div>
              <div className="flex items-center gap-2 px-3 py-2">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold leading-tight">{p.name}</p>
                  <div className="mt-0.5 flex items-baseline gap-1.5">
                    <p className="text-sm font-black tabular-nums leading-none" style={{ color: primary }}>{p.price}</p>
                    <p className="text-[10px] text-zinc-500">★ 4.{8 + (i % 2)}</p>
                  </div>
                </div>
                <button className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white shadow-sm" style={{ background: primary }}>
                  <span className="text-lg leading-none">+</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Category strip — round emoji tiles */}
      <div className="flex items-center justify-between px-16 py-4">
        <h2 className="text-xs font-black uppercase tracking-widest text-zinc-500">Browse by category</h2>
        <span className="text-xs font-black uppercase tracking-widest" style={{ color: primary }}>All categories →</span>
      </div>
      <div className="grid grid-cols-6 gap-4 px-16">
        {[
          { emoji: "🍚", label: "Mains" },
          { emoji: "🥗", label: "Sides" },
          { emoji: "🍹", label: "Drinks" },
          { emoji: "🍰", label: "Desserts" },
          { emoji: "🔥", label: "Combos" },
          { emoji: "🥡", label: "Family pack" },
        ].map((c, i) => (
          <div key={c.label} className="flex flex-col items-center gap-2 rounded-2xl bg-white px-3 py-4 shadow-sm">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl text-3xl" style={i === 0 ? { background: primary, color: "white" } : { background: `${primary}10` }}>{c.emoji}</div>
            <span className="text-sm font-bold text-zinc-700">{c.label}</span>
            <span className="text-[10px] text-zinc-500">{12 + i * 3} items</span>
          </div>
        ))}
      </div>

      {/* Deal stripe */}
      <div className="mt-5 flex items-center justify-between rounded-2xl bg-white px-16 py-3 shadow-sm" style={{ marginLeft: 64, marginRight: 64 }}>
        <div className="flex items-center gap-3">
          <span className="rounded-full px-3 py-1 text-xs font-black uppercase text-white" style={{ background: accent }}>Deal</span>
          <span className="text-base font-bold">Family combo · 4 mains + 2 sides</span>
          <span className="text-sm text-zinc-500">Save ₦2,400</span>
        </div>
        <span className="text-xl font-black tabular-nums" style={{ color: primary }}>₦8,800</span>
      </div>
    </div>
  )
}

// ====================================================================
// SHOP — shared, style-aware chrome
// ====================================================================

function ShopGeneric({ template, products, desktop }: Ctx) {
  const { primary, accent } = template.colors
  const style = template.style
  const isLuxe = style === "luxe"
  const isBold = style === "bold"
  const w = desktop ? REF_DESKTOP_W : REF_PHONE_W
  const h = desktop ? REF_DESKTOP_H : REF_PHONE_H

  return (
    <div className={cn("flex h-full flex-col", isLuxe ? "bg-zinc-950 text-zinc-100" : isBold ? "bg-white text-zinc-900" : "bg-white text-zinc-900")} style={{ width: w, height: h }}>
      <header className={cn("flex items-center justify-between border-b px-6 md:px-16", desktop ? "py-5" : "pt-14 pb-3", isLuxe ? "border-zinc-800" : "border-zinc-200")}>
        {desktop ? (
          <>
            <span className={cn("text-2xl font-bold", isLuxe && "font-serif italic", isBold && "font-black uppercase")} style={{ color: isLuxe ? accent : primary }}>{template.name}</span>
            <nav className={cn("flex gap-10 text-xs uppercase", isLuxe ? "tracking-[0.4em] text-zinc-400" : isBold ? "font-black tracking-wider text-zinc-700" : "tracking-[0.4em] text-zinc-600")}>
              <span>Shop</span><span>Lookbook</span><span>Story</span><span>Stockists</span>
            </nav>
            <div className="flex items-center gap-5"><Search className="h-5 w-5" /><User className="h-5 w-5" /><ShoppingBag className="h-5 w-5" /></div>
          </>
        ) : (
          <>
            <Menu className="h-6 w-6" />
            <span className={cn("text-xl font-bold", isLuxe && "font-serif italic", isBold && "font-black uppercase")} style={{ color: isLuxe ? accent : primary }}>{template.name}</span>
            <ShoppingBag className="h-6 w-6" />
          </>
        )}
      </header>
      <div className={cn("px-6 md:px-16", desktop ? "py-8" : "py-5")}>
        <span className={cn("text-xs uppercase", isLuxe ? "font-serif tracking-[0.4em] text-zinc-400" : isBold ? "font-black tracking-wider text-zinc-500" : "tracking-[0.4em] text-zinc-500")}>{products.length} pieces</span>
        <h1 className={cn(
          "mt-2",
          isLuxe || style === "editorial" ? "font-serif italic" : isBold ? "font-black uppercase" : style === "minimal" ? "font-light" : "font-bold",
          desktop ? "text-6xl" : "text-4xl",
        )}>{shopHeadline(template.sector)}</h1>
        <div className={cn("mt-5 flex gap-2 overflow-x-auto", desktop ? "" : "")}>
          {["All", "New in", "Featured", "On sale", "Coming soon"].map((c, i) => (
            <span
              key={c}
              className={cn("shrink-0 border px-4 py-2 text-sm font-bold", style === "playful" ? "rounded-full" : style === "luxe" || style === "editorial" ? "rounded-none" : "rounded-full")}
              style={i === 0
                ? { background: primary, color: "white", borderColor: primary }
                : { borderColor: isLuxe ? "#3f3f46" : "#e4e4e7", color: isLuxe ? "#a1a1aa" : "#52525b" }}
            >
              {c}
            </span>
          ))}
        </div>
      </div>
      <div className={cn("grid flex-1 gap-6 overflow-hidden px-6 pb-6 md:px-16", desktop ? "grid-cols-4" : "grid-cols-2")}>
        {products.slice(0, desktop ? 8 : 4).map((p, i) => (
          <div key={i} className="flex flex-col">
            <div className={cn("aspect-[4/5] overflow-hidden", style === "playful" && "rounded-2xl", isLuxe ? "" : "bg-zinc-50")}>
              <img src={p.image} alt={p.name} loading="lazy" referrerPolicy="no-referrer" className={cn("h-full w-full object-cover", isLuxe && "opacity-90")} />
            </div>
            <p className={cn("mt-2 truncate", isLuxe ? "font-serif text-base italic" : "text-sm font-medium")}>{p.name}</p>
            <div className="flex items-baseline justify-between">
              <p className="text-base font-bold tabular-nums" style={{ color: isLuxe ? accent : primary }}>{p.price}</p>
              <p className="text-xs text-zinc-500">★ 4.{6 + (i % 4)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ====================================================================
// PRODUCT
// ====================================================================

function ProductGeneric({ template, products, desktop }: Ctx) {
  const { primary, accent } = template.colors
  const style = template.style
  const isLuxe = style === "luxe"
  const product = products[0]
  const w = desktop ? REF_DESKTOP_W : REF_PHONE_W
  const h = desktop ? REF_DESKTOP_H : REF_PHONE_H

  return (
    <div className={cn("flex h-full flex-col", isLuxe ? "bg-zinc-950 text-zinc-100" : "bg-white text-zinc-900")} style={{ width: w, height: h }}>
      <header className={cn("flex items-center justify-between border-b px-6 md:px-16", desktop ? "py-5" : "pt-14 pb-3", isLuxe ? "border-zinc-800" : "border-zinc-200")}>
        {desktop ? (
          <>
            <span className={cn("text-2xl font-bold", isLuxe && "font-serif italic")} style={{ color: isLuxe ? accent : primary }}>{template.name}</span>
            <nav className={cn("flex gap-10 text-xs uppercase", isLuxe ? "tracking-[0.4em] text-zinc-400" : "tracking-[0.4em] text-zinc-600")}>
              <span>Shop</span><span>Lookbook</span><span>Story</span>
            </nav>
            <ShoppingBag className="h-5 w-5" />
          </>
        ) : (
          <>
            <ChevronLeft className="h-6 w-6" />
            <span className={cn("text-base font-bold", isLuxe && "font-serif italic")}>{product.name}</span>
            <ShoppingBag className="h-6 w-6" />
          </>
        )}
      </header>
      <div className={cn("grid flex-1 overflow-hidden", desktop ? "grid-cols-[1.1fr_1fr] gap-12 px-16 py-10" : "grid-cols-1 gap-4 px-6 py-5")}>
        <div className={cn("relative overflow-hidden", style === "playful" && "rounded-2xl")}>
          <img src={product.image} alt={product.name} loading="lazy" referrerPolicy="no-referrer" className="h-full w-full object-cover" />
        </div>
        <div className="flex flex-col justify-center">
          <span className="text-xs uppercase tracking-[0.4em]" style={{ color: accent }}>{template.sector}</span>
          <h1 className={cn(
            "mt-3 leading-tight",
            isLuxe ? "font-serif italic" : style === "editorial" ? "font-serif" : style === "bold" ? "font-black uppercase" : style === "minimal" ? "font-light" : "font-bold",
            desktop ? "text-5xl" : "text-3xl",
          )}>{product.name}</h1>
          <p className={cn("mt-3 font-bold tabular-nums", desktop ? "text-3xl" : "text-2xl")} style={{ color: isLuxe ? accent : primary }}>{product.price}</p>
          <div className="mt-2 flex items-center gap-2 text-sm">
            <span style={{ color: accent }}>★★★★★</span>
            <span className={isLuxe ? "text-zinc-500" : "text-zinc-500"}>4.9 · 218 reviews</span>
          </div>
          <p className={cn("mt-5 text-base leading-relaxed", isLuxe ? "text-zinc-400" : "text-zinc-600")}>
            Crafted in small batches at our Lekki workshop. Hand-finished, hand-checked, signed by the maker who saw it through.
          </p>

          <p className={cn("mt-6 text-xs uppercase", isLuxe ? "tracking-[0.4em] text-zinc-500" : "tracking-[0.4em] text-zinc-500")}>Size</p>
          <div className="mt-2 flex gap-2">
            {["XS","S","M","L","XL"].map((s, i) => (
              <span key={s} className={cn("flex h-12 w-12 items-center justify-center border text-base font-bold", style === "playful" ? "rounded-full" : "rounded-none")}
                style={i === 1 ? { background: primary, color: "white", borderColor: primary } : { borderColor: isLuxe ? "#3f3f46" : "#d4d4d8", color: isLuxe ? "#a1a1aa" : "#3f3f46" }}>{s}</span>
            ))}
          </div>
          <p className={cn("mt-5 text-xs uppercase tracking-[0.4em]", isLuxe ? "text-zinc-500" : "text-zinc-500")}>Colour</p>
          <div className="mt-2 flex gap-2">
            {[primary, accent, "#a3a3a3", "#1f1f1f"].map((c, i) => (
              <span key={i} className={cn("h-10 w-10 rounded-full border-2", i === 0 ? "border-foreground" : "border-transparent")} style={{ background: c, borderColor: i === 0 ? (isLuxe ? "#fff" : "#18181b") : "transparent" }} />
            ))}
          </div>

          <div className="mt-6 flex items-center gap-3">
            <div className={cn("flex items-center gap-3 border px-3 py-2", isLuxe ? "border-zinc-800" : "border-zinc-300")}>
              <span className="text-base">−</span><span className="font-bold">1</span><span className="text-base">+</span>
            </div>
            <button className={cn(
              "inline-flex flex-1 items-center justify-center gap-2 px-6 py-3 text-base font-bold text-white",
              style === "playful" ? "rounded-full" : "rounded-none",
              style === "bold" && "uppercase tracking-widest",
            )} style={{ background: primary }}>
              <ShoppingBag className="h-4 w-4" /> Add to bag
            </button>
            <button className={cn("flex h-12 w-12 items-center justify-center border", isLuxe ? "border-zinc-800" : "border-zinc-300")}>
              <Heart className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
            <span className="inline-flex items-center gap-2"><Truck className="h-4 w-4" style={{ color: accent }} /> Free delivery over ₦20k</span>
            <span className="inline-flex items-center gap-2"><Shield className="h-4 w-4" style={{ color: accent }} /> 30-day returns</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// ====================================================================
// CART
// ====================================================================

function CartGeneric({ template, products, desktop }: Ctx) {
  const { primary, accent } = template.colors
  const style = template.style
  const isLuxe = style === "luxe"
  const w = desktop ? REF_DESKTOP_W : REF_PHONE_W
  const h = desktop ? REF_DESKTOP_H : REF_PHONE_H
  return (
    <div className={cn("flex h-full flex-col", isLuxe ? "bg-zinc-950 text-zinc-100" : "bg-white text-zinc-900")} style={{ width: w, height: h }}>
      <header className={cn("flex items-center justify-between border-b px-6 md:px-16", desktop ? "py-5" : "pt-14 pb-3", isLuxe ? "border-zinc-800" : "border-zinc-200")}>
        {desktop ? (
          <>
            <span className={cn("text-2xl font-bold", isLuxe && "font-serif italic")} style={{ color: isLuxe ? accent : primary }}>{template.name}</span>
            <span className={cn("text-xs uppercase tracking-[0.4em]", isLuxe ? "text-zinc-400" : "text-zinc-600")}>Cart · Step 1 of 3</span>
            <ShoppingBag className="h-5 w-5" />
          </>
        ) : (
          <>
            <ChevronLeft className="h-6 w-6" />
            <span className={cn("text-base font-bold", isLuxe && "font-serif italic")}>Your bag</span>
            <Search className="h-6 w-6" />
          </>
        )}
      </header>
      <div className={cn("grid flex-1 overflow-hidden", desktop ? "grid-cols-[1.5fr_1fr] gap-10 px-16 py-8" : "grid-cols-1 gap-4 px-6 py-4")}>
        <div>
          {desktop && <h1 className={cn("text-5xl", isLuxe ? "font-serif italic" : style === "bold" ? "font-black uppercase" : "font-light")}>Your bag</h1>}
          {desktop && <p className="mt-1 text-sm text-zinc-500">3 items · Free delivery on orders over ₦20k</p>}
          <ul className={cn("mt-5 divide-y", isLuxe ? "divide-zinc-800" : "divide-zinc-200")}>
            {products.slice(0, 3).map((p, i) => (
              <li key={i} className={cn("flex items-center gap-4", desktop ? "py-5" : "py-3")}>
                <div className={cn("shrink-0 overflow-hidden", style === "playful" ? "rounded-xl" : "rounded-none", desktop ? "h-24 w-24" : "h-16 w-16")}>
                  <img src={p.image} alt={p.name} loading="lazy" referrerPolicy="no-referrer" className="h-full w-full object-cover" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className={cn("truncate", isLuxe ? "font-serif italic" : "font-semibold", desktop ? "text-lg" : "text-sm")}>{p.name}</p>
                  <p className={cn("text-zinc-500", desktop ? "text-sm" : "text-xs")}>Size M · Sage · Qty {i + 1}</p>
                  <button className="mt-1 text-xs text-zinc-500 underline">Remove</button>
                </div>
                <p className={cn("font-bold tabular-nums", desktop ? "text-lg" : "text-sm")}>{p.price}</p>
              </li>
            ))}
          </ul>
          {desktop && (
            <div className={cn("mt-5 flex items-center gap-3 border p-3", isLuxe ? "border-zinc-800" : "border-zinc-200")}>
              <span className="text-xs uppercase tracking-widest text-zinc-500">Promo code</span>
              <input className="flex-1 bg-transparent text-sm outline-none" defaultValue="WELCOME10" />
              <button className="text-xs font-bold uppercase tracking-widest" style={{ color: accent }}>Apply</button>
            </div>
          )}
        </div>
        <aside className={cn("self-start border", isLuxe ? "border-zinc-800" : "border-zinc-200", desktop ? "p-6" : "p-4")}>
          <h2 className={cn(desktop ? "text-xl" : "text-base", "font-bold")}>Summary</h2>
          <dl className={cn("mt-4 space-y-2", desktop ? "text-base" : "text-sm")}>
            <div className="flex justify-between"><dt className="text-zinc-500">Subtotal</dt><dd className="tabular-nums">₦108,500</dd></div>
            <div className="flex justify-between"><dt className="text-zinc-500">Shipping</dt><dd className="tabular-nums">₦1,500</dd></div>
            <div className="flex justify-between"><dt className="text-zinc-500">VAT (7.5%)</dt><dd className="tabular-nums">₦8,137</dd></div>
            <div className={cn("flex justify-between border-t pt-2 font-bold", isLuxe ? "border-zinc-800" : "border-zinc-200", desktop ? "text-xl" : "text-base")}>
              <dt>Total</dt><dd className="tabular-nums">₦118,137</dd>
            </div>
          </dl>
          <button className={cn(
            "mt-5 w-full px-5 py-3 font-bold text-white",
            style === "playful" ? "rounded-full" : "rounded-none",
            style === "bold" && "uppercase tracking-widest",
            desktop ? "text-base" : "text-sm",
          )} style={{ background: primary }}>
            Checkout securely
          </button>
          <p className={cn("mt-3 text-center text-xs text-zinc-500")}>Free returns within 14 days</p>
        </aside>
      </div>
    </div>
  )
}

// ====================================================================
// CHECKOUT
// ====================================================================

function CheckoutGeneric({ template, products, desktop }: Ctx) {
  const { primary, accent } = template.colors
  const isLuxe = template.style === "luxe"
  const w = desktop ? REF_DESKTOP_W : REF_PHONE_W
  const h = desktop ? REF_DESKTOP_H : REF_PHONE_H

  return (
    <div className={cn("flex h-full flex-col", isLuxe ? "bg-zinc-950 text-zinc-100" : "bg-white text-zinc-900")} style={{ width: w, height: h }}>
      <header className={cn("flex items-center justify-between border-b px-6 md:px-16", desktop ? "py-5" : "pt-14 pb-3", isLuxe ? "border-zinc-800" : "border-zinc-200")}>
        {desktop ? (
          <>
            <span className={cn("text-2xl font-bold", isLuxe && "font-serif italic")} style={{ color: isLuxe ? accent : primary }}>{template.name}</span>
            <span className={cn("text-xs uppercase tracking-[0.4em]", isLuxe ? "text-zinc-400" : "text-zinc-600")}>Checkout · Step 3 of 3</span>
            <Shield className="h-5 w-5" style={{ color: accent }} />
          </>
        ) : (
          <>
            <ChevronLeft className="h-6 w-6" />
            <span className={cn("text-base font-bold", isLuxe && "font-serif italic")}>Pay securely</span>
            <Shield className="h-6 w-6" style={{ color: accent }} />
          </>
        )}
      </header>
      <div className={cn("grid flex-1 overflow-hidden", desktop ? "grid-cols-[1.4fr_1fr] gap-10 px-16 py-8" : "grid-cols-1 gap-4 px-6 py-4")}>
        <div className="space-y-5">
          <CheckoutSection title="Contact" border={isLuxe ? "#3f3f46" : "#e4e4e7"}>
            <p className="text-sm">aisha@personal.io</p>
            <p className="text-xs text-zinc-500">+234 803 555 0118</p>
          </CheckoutSection>
          <CheckoutSection title="Delivery address" border={isLuxe ? "#3f3f46" : "#e4e4e7"}>
            <p className="text-sm">Aisha Nwosu</p>
            <p className="text-sm text-zinc-500">12 Admiralty Way, Lekki Phase 1</p>
            <p className="text-sm text-zinc-500">Lagos 106104 · Nigeria</p>
          </CheckoutSection>
          <CheckoutSection title="Delivery method" border={accent}>
            <div className="space-y-2">
              {[
                { name: "GIG Logistics · Standard", days: "2-4 days", price: "₦1,500", on: true },
                { name: "Sendbox · Express",         days: "Next-day",  price: "₦2,800", on: false },
                { name: "Kwik · Same-day",           days: "Today, Lagos only", price: "₦3,500", on: false },
              ].map((d, i) => (
                <div key={i} className="flex items-center gap-3 text-sm">
                  <span className="flex h-4 w-4 items-center justify-center rounded-full border" style={{ borderColor: accent }}>
                    {d.on && <span className="h-2 w-2 rounded-full" style={{ background: accent }} />}
                  </span>
                  <Truck className="h-4 w-4" />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold">{d.name}</p>
                    <p className="text-xs text-zinc-500">{d.days}</p>
                  </div>
                  <p className="font-bold tabular-nums">{d.price}</p>
                </div>
              ))}
            </div>
          </CheckoutSection>
          <CheckoutSection title="Payment" border={accent}>
            <div className="flex items-center gap-3 text-sm">
              <CreditCard className="h-4 w-4" />
              <div className="min-w-0 flex-1">
                <p className="font-semibold">Card · Paystack</p>
                <p className="text-xs text-zinc-500">Visa, Mastercard, Verve · ending 4242</p>
              </div>
              <span className="text-xs text-zinc-500">Change</span>
            </div>
          </CheckoutSection>
        </div>
        {desktop && (
          <aside className={cn("self-start border", isLuxe ? "border-zinc-800" : "border-zinc-200", "p-6")}>
            <h2 className="text-xl font-bold">Your order</h2>
            <ul className={cn("mt-3 divide-y", isLuxe ? "divide-zinc-800" : "divide-zinc-100")}>
              {products.slice(0, 3).map((p, i) => (
                <li key={i} className="flex items-center gap-3 py-2 text-sm">
                  <div className="relative">
                    <img src={p.image} alt="" loading="lazy" referrerPolicy="no-referrer" className="h-12 w-12 rounded object-cover" />
                    <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold text-white" style={{ background: accent }}>{i + 1}</span>
                  </div>
                  <span className="min-w-0 flex-1 truncate">{p.name}</span>
                  <span className="font-bold tabular-nums">{p.price}</span>
                </li>
              ))}
            </ul>
            <dl className="mt-4 space-y-1.5 text-sm">
              <div className="flex justify-between"><dt className="text-zinc-500">Subtotal</dt><dd className="tabular-nums">₦108,500</dd></div>
              <div className="flex justify-between"><dt className="text-zinc-500">Shipping</dt><dd className="tabular-nums">₦1,500</dd></div>
              <div className="flex justify-between"><dt className="text-zinc-500">VAT</dt><dd className="tabular-nums">₦8,137</dd></div>
              <div className={cn("flex justify-between border-t pt-2 text-xl font-bold", isLuxe ? "border-zinc-800" : "border-zinc-200")}>
                <dt>Total</dt><dd className="tabular-nums">₦118,137</dd>
              </div>
            </dl>
            <button className={cn(
              "mt-5 flex w-full items-center justify-center gap-2 px-5 py-3 text-base font-bold text-white",
              template.style === "playful" ? "rounded-full" : "rounded-none",
              template.style === "bold" && "uppercase tracking-widest",
            )} style={{ background: primary }}>
              <Shield className="h-4 w-4" /> Pay ₦118,137
            </button>
            <p className="mt-2 text-center text-xs text-zinc-500">256-bit SSL · powered by Paystack</p>
          </aside>
        )}
      </div>
    </div>
  )
}

function CheckoutSection({ title, border, children }: { title: string; border: string; children: React.ReactNode }) {
  return (
    <div className="border p-4" style={{ borderColor: border }}>
      <p className="mb-2 text-xs font-bold uppercase tracking-[0.4em] text-zinc-500">{title}</p>
      {children}
    </div>
  )
}

// ====================================================================
// ABOUT
// ====================================================================

function AboutGeneric({ template, hero, desktop }: Ctx) {
  const { primary, accent } = template.colors
  const isLuxe = template.style === "luxe"
  const w = desktop ? REF_DESKTOP_W : REF_PHONE_W
  const h = desktop ? REF_DESKTOP_H : REF_PHONE_H

  return (
    <div className={cn("flex h-full flex-col", isLuxe ? "bg-zinc-950 text-zinc-100" : "bg-white text-zinc-900")} style={{ width: w, height: h }}>
      <header className={cn("flex items-center justify-between border-b px-6 md:px-16", desktop ? "py-5" : "pt-14 pb-3", isLuxe ? "border-zinc-800" : "border-zinc-200")}>
        {desktop ? (
          <>
            <span className={cn("text-2xl font-bold", isLuxe && "font-serif italic")} style={{ color: isLuxe ? accent : primary }}>{template.name}</span>
            <nav className={cn("flex gap-10 text-xs uppercase tracking-[0.4em]", isLuxe ? "text-zinc-400" : "text-zinc-600")}>
              <span>Shop</span><span>Lookbook</span><span>Story</span><span>Contact</span>
            </nav>
            <ShoppingBag className="h-5 w-5" />
          </>
        ) : (
          <>
            <ChevronLeft className="h-6 w-6" />
            <span className={cn("text-base font-bold", isLuxe && "font-serif italic")}>Our story</span>
            <Menu className="h-6 w-6" />
          </>
        )}
      </header>
      <div className={cn(desktop ? "px-16 py-12" : "px-6 py-6")}>
        <span className={cn("text-xs uppercase tracking-[0.4em]", "block")} style={{ color: accent }}>Est. 2023</span>
        <h1 className={cn(
          "mt-3 leading-tight",
          isLuxe ? "font-serif italic" : template.style === "editorial" ? "font-serif" : template.style === "bold" ? "font-black uppercase" : template.style === "minimal" ? "font-light" : "font-bold",
          desktop ? "text-6xl" : "text-4xl",
        )}>{aboutHeadline(template.sector)}</h1>
      </div>
      <div className={cn("grid flex-1 overflow-hidden", desktop ? "grid-cols-2 gap-10 px-16 pb-10" : "grid-cols-1 gap-5 px-6 pb-6")}>
        <div className="space-y-5">
          <p className={cn("leading-relaxed", isLuxe ? "text-zinc-300" : "text-zinc-700", desktop ? "text-lg" : "text-base")}>
            {template.name} started as a Saturday-morning stall in Lekki. Today we ship to {Math.floor(template.popularity / 7) + 8} cities — but every piece is still checked by the founder before it leaves our hands.
          </p>
          <div className="grid grid-cols-3 gap-4">
            {[
              { stat: "2.4k+", label: "happy customers" },
              { stat: "12",    label: "cities served" },
              { stat: "4.9★",  label: "review average" },
            ].map((s) => (
              <div key={s.label} className={cn(isLuxe ? "border-zinc-800" : "border-zinc-200", "border-t pt-3")}>
                <p className={cn("font-bold", isLuxe && "font-serif italic", desktop ? "text-4xl" : "text-2xl")} style={{ color: isLuxe ? accent : primary }}>{s.stat}</p>
                <p className={cn("mt-1 text-xs uppercase tracking-widest", isLuxe ? "text-zinc-500" : "text-zinc-500")}>{s.label}</p>
              </div>
            ))}
          </div>
          <ul className={cn("space-y-3", desktop ? "text-base" : "text-sm")}>
            {[
              "Materials sourced within 200 km of our workshop.",
              "Every piece checked by hand before it ships.",
              "Free returns, no questions asked — even after 14 days.",
            ].map((v, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white" style={{ background: accent }}>{i + 1}</span>
                <span>{v}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className={cn("relative overflow-hidden", template.style === "playful" && "rounded-2xl")}>
          <img src={hero} alt="" loading="lazy" referrerPolicy="no-referrer" className="h-full w-full object-cover" />
        </div>
      </div>
    </div>
  )
}

// ====================================================================
// Headlines
// ====================================================================

function luxeHeadline(sector: string): React.ReactNode {
  if (sector === "fashion")     return <>Quietly<br />extraordinary.</>
  if (sector === "beauty")      return <>Skin,<br />considered.</>
  if (sector === "food")        return <>A table<br />set for you.</>
  if (sector === "electronics") return <>Tools that<br />endure.</>
  if (sector === "home")        return <>Objects<br />with weight.</>
  if (sector === "auto")        return <>Precision,<br />packaged.</>
  if (sector === "wholesale")   return <>Sourced<br />with intent.</>
  if (sector === "services")    return <>The art of<br />attention.</>
  return "Made with care."
}

function editorialHeadline(sector: string): React.ReactNode {
  if (sector === "fashion")     return <>Pieces<br />that tell<br />a story.</>
  if (sector === "beauty")      return <>The slow<br />science of<br />glow.</>
  if (sector === "food")        return <>From farm,<br />by hand,<br />to table.</>
  if (sector === "electronics") return <>For the<br />maker's<br />desk.</>
  if (sector === "home")        return <>For the<br />rooms you<br />live in.</>
  if (sector === "auto")        return <>For the<br />long drive.</>
  if (sector === "wholesale")   return <>A trade<br />built<br />on trust.</>
  if (sector === "services")    return <>Time you<br />look forward<br />to.</>
  return "Made well."
}

function boldHeadline(sector: string) {
  if (sector === "fashion")     return "Wear it loud"
  if (sector === "beauty")      return "Glow louder"
  if (sector === "food")        return "Made daily"
  if (sector === "electronics") return "Plug. Go."
  if (sector === "home")        return "Live louder"
  if (sector === "auto")        return "Built tough"
  if (sector === "wholesale")   return "Stock up"
  if (sector === "services")    return "Book now"
  return "Make moves"
}

function minimalHeadline(sector: string) {
  if (sector === "fashion")     return "made simple"
  if (sector === "beauty")      return "skin, simplified"
  if (sector === "food")        return "honest food"
  if (sector === "electronics") return "tools, refined"
  if (sector === "home")        return "home, quieter"
  if (sector === "auto")        return "the right part"
  if (sector === "wholesale")   return "trade, transparent"
  if (sector === "services")    return "time well spent"
  return "less, but better"
}

function playfulHeadline(sector: string) {
  if (sector === "fashion")     return "Bright things daily"
  if (sector === "beauty")      return "Treat yourself"
  if (sector === "food")        return "Hot, fresh, fast"
  if (sector === "electronics") return "Geek out a bit"
  if (sector === "home")        return "Happy home"
  if (sector === "auto")        return "Road-ready"
  if (sector === "wholesale")   return "Bulk up"
  if (sector === "services")    return "You deserve it"
  return "Treat yourself"
}

function shopHeadline(sector: string) {
  if (sector === "fashion")     return "All pieces"
  if (sector === "beauty")      return "The shelf"
  if (sector === "food")        return "Today's menu"
  if (sector === "home")        return "The collection"
  if (sector === "auto")        return "Parts catalog"
  if (sector === "wholesale")   return "Bulk catalog"
  if (sector === "electronics") return "Workspace tools"
  if (sector === "services")    return "Book a service"
  return "Shop all"
}

function aboutHeadline(sector: string) {
  if (sector === "fashion")     return "Made in Lagos. Loved everywhere."
  if (sector === "beauty")      return "Clean ingredients. Real results."
  if (sector === "food")        return "A kitchen with a story."
  if (sector === "electronics") return "Built by a team of three."
  if (sector === "home")        return "Slow goods for the room you love."
  if (sector === "auto")        return "Mechanics first. Sellers second."
  if (sector === "wholesale")   return "A B2B partner you can call."
  if (sector === "services")    return "Booked solid since 2023."
  return "Made with intention."
}

// ====================================================================
// Variant-B renderers — alternate hero layouts so two templates that
// share a `style` look visibly different at a glance.
// ====================================================================

// ---------- LUXE-B (Spa Verve) ----------
// Booking-led: dark hero with a glassy reservation panel overlay.
function HomeLuxeB({ template, hero, products, desktop }: Ctx) {
  const { accent } = template.colors
  if (!desktop) {
    return (
      <div className="flex h-full flex-col bg-zinc-950 text-zinc-100" style={{ width: REF_PHONE_W, height: REF_PHONE_H }}>
        <header className="flex items-center justify-between px-6 pt-14 pb-3">
          <Menu className="h-6 w-6 text-zinc-300" />
          <span className="font-serif text-xl italic" style={{ color: accent }}>{template.name}</span>
          <ShoppingBag className="h-6 w-6 text-zinc-300" />
        </header>
        <div className="relative h-[55%] w-full">
          <img src={hero} alt="" loading="lazy" referrerPolicy="no-referrer" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/40 to-black/80" />
          <div className="absolute inset-0 flex flex-col justify-end p-7">
            <span className="font-serif text-[10px] uppercase tracking-[0.4em]" style={{ color: accent }}>Sanctuary · since 2023</span>
            <h1 className="mt-2 font-serif text-5xl italic leading-[0.9]">A pause<br />for you.</h1>
          </div>
        </div>
        <div className="flex-1 px-6 py-5">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-4 backdrop-blur-sm">
            <p className="font-serif text-sm italic">Reserve a treatment</p>
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-md border border-zinc-800 px-2 py-2 text-zinc-300">Thu · May 21</div>
              <div className="rounded-md border border-zinc-800 px-2 py-2 text-zinc-300">10:00</div>
            </div>
            <button className="mt-3 w-full py-2 text-xs uppercase tracking-[0.3em] text-black" style={{ background: accent }}>Book now</button>
          </div>
        </div>
      </div>
    )
  }
  return (
    <div className="flex h-full flex-col bg-zinc-950 text-zinc-100" style={{ width: REF_DESKTOP_W, height: REF_DESKTOP_H }}>
      <header className="flex items-center justify-between border-b border-zinc-800/60 px-16 py-6">
        <span className="font-serif text-3xl italic" style={{ color: accent }}>{template.name}</span>
        <nav className="flex gap-10 text-xs uppercase tracking-[0.4em] text-zinc-400">
          <span>Treatments</span><span>Membership</span><span>Gift cards</span><span>Therapists</span>
        </nav>
        <div className="flex items-center gap-5 text-zinc-400">
          <Search className="h-5 w-5" /><User className="h-5 w-5" /><ShoppingBag className="h-5 w-5" />
        </div>
      </header>
      <div className="relative flex-1">
        <img src={hero} alt="" loading="lazy" referrerPolicy="no-referrer" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-black/10" />
        <div className="absolute inset-0 grid grid-cols-2 items-center gap-12 px-20">
          <div>
            <span className="font-serif text-sm uppercase tracking-[0.5em]" style={{ color: accent }}>Sanctuary · since 2023</span>
            <h1 className="mt-4 font-serif text-8xl italic leading-[0.92]">A pause for you.</h1>
            <p className="mt-6 max-w-md font-serif text-lg italic text-zinc-300">An hour with us. A week of feeling like yourself again.</p>
          </div>
          <aside className="ml-auto w-full max-w-sm rounded-3xl border border-white/15 bg-black/50 p-7 backdrop-blur-md">
            <p className="font-serif text-xl italic">Reserve a treatment</p>
            <div className="mt-4 space-y-3 text-sm">
              <div>
                <p className="font-serif text-xs uppercase tracking-[0.4em] text-zinc-400">Treatment</p>
                <p className="mt-1 border-b border-white/15 pb-1 text-zinc-100">Hibiscus signature facial · 90 min</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="font-serif text-xs uppercase tracking-[0.4em] text-zinc-400">Date</p>
                  <p className="mt-1 border-b border-white/15 pb-1">Thu · May 21</p>
                </div>
                <div>
                  <p className="font-serif text-xs uppercase tracking-[0.4em] text-zinc-400">Time</p>
                  <p className="mt-1 border-b border-white/15 pb-1">10:00 am</p>
                </div>
              </div>
            </div>
            <button className="mt-6 w-full py-3 text-sm uppercase tracking-[0.4em] text-black" style={{ background: accent }}>Confirm booking</button>
            <p className="mt-2 text-center text-xs text-zinc-400">No charge until you arrive</p>
          </aside>
        </div>
      </div>
      <section className="grid grid-cols-3 border-t border-zinc-800">
        {products.slice(0, 3).map((p, i) => (
          <div key={i} className="flex items-center gap-4 border-r border-zinc-800 p-5 last:border-r-0">
            <div className="h-16 w-16 shrink-0 overflow-hidden">
              <img src={p.image} alt={p.name} loading="lazy" referrerPolicy="no-referrer" className="h-full w-full object-cover opacity-90" />
            </div>
            <div className="min-w-0">
              <p className="font-serif text-lg italic">{p.name}</p>
              <p className="text-sm tabular-nums" style={{ color: accent }}>From {p.price}</p>
            </div>
          </div>
        ))}
      </section>
    </div>
  )
}

// ---------- EDITORIAL-B (The Folio) ----------
// Letter-style intro + neat catalog grid.
function HomeEditorialB({ template, hero, products, desktop }: Ctx) {
  const { primary, accent } = template.colors
  if (!desktop) {
    return (
      <div className="flex h-full flex-col bg-[#f5efe6] text-zinc-900" style={{ width: REF_PHONE_W, height: REF_PHONE_H }}>
        <header className="flex items-center justify-between border-b border-zinc-900 px-6 pt-14 pb-3">
          <Menu className="h-6 w-6" />
          <span className="font-serif text-2xl font-bold tracking-tight">{template.name}</span>
          <Search className="h-6 w-6" />
        </header>
        <div className="px-6 py-6">
          <span className="font-serif text-[10px] uppercase tracking-[0.4em]" style={{ color: primary }}>Volume 14 · May edition</span>
          <h1 className="mt-3 font-serif text-4xl italic leading-tight">Dear reader,</h1>
          <p className="mt-3 font-serif text-base leading-relaxed text-zinc-700">
            We chose these eight titles for the wet season. Pour yourself something hot — and read them slowly.
          </p>
          <p className="mt-3 font-serif text-sm italic text-zinc-600">— The editors</p>
        </div>
        <div className="flex-1 grid grid-cols-2 gap-3 overflow-hidden px-6 pb-6">
          {products.slice(0, 4).map((p, i) => (
            <div key={i}>
              <div className="aspect-[3/4] overflow-hidden bg-zinc-200">
                <img src={p.image} alt={p.name} loading="lazy" referrerPolicy="no-referrer" className="h-full w-full object-cover" />
              </div>
              <p className="mt-1.5 font-serif text-sm italic">{p.name}</p>
              <p className="text-xs font-bold tabular-nums">{p.price}</p>
            </div>
          ))}
        </div>
      </div>
    )
  }
  return (
    <div className="flex h-full flex-col bg-[#f5efe6] text-zinc-900" style={{ width: REF_DESKTOP_W, height: REF_DESKTOP_H }}>
      <header className="flex items-center justify-between border-b-2 border-zinc-900 px-16 py-5">
        <span className="font-serif text-xs uppercase tracking-[0.4em] text-zinc-700">Volume 14 · May edition</span>
        <span className="font-serif text-3xl font-bold tracking-tight">{template.name}</span>
        <div className="flex items-center gap-4 text-zinc-700"><Search className="h-5 w-5" /><User className="h-5 w-5" /><ShoppingBag className="h-5 w-5" /></div>
      </header>
      <div className="grid flex-1 grid-cols-[45%_55%]">
        <div className="flex flex-col justify-center px-16 py-12">
          <h1 className="font-serif text-7xl italic leading-[0.92]">Dear<br />reader,</h1>
          <p className="mt-8 font-serif text-lg leading-relaxed text-zinc-700">
            We chose these eight titles for the wet season. Pour yourself something hot — and read them slowly. Curated by our staff over Friday afternoons in Yaba.
          </p>
          <p className="mt-4 font-serif text-base italic text-zinc-600">— The editors</p>
          <button className="mt-6 self-start border-b-2 font-serif text-base italic" style={{ borderColor: primary, color: primary }}>Subscribe to the book club →</button>
        </div>
        <section className="px-16 py-12">
          <div className="flex items-baseline justify-between border-b border-zinc-900 pb-3">
            <h2 className="font-serif text-2xl italic">This issue's eight</h2>
            <span className="text-xs uppercase tracking-[0.4em]" style={{ color: accent }}>Hand-picked</span>
          </div>
          <div className="mt-5 grid grid-cols-4 gap-5">
            {products.slice(0, 8).map((p, i) => (
              <div key={i}>
                <div className="aspect-[3/4] overflow-hidden bg-zinc-200">
                  <img src={p.image} alt={p.name} loading="lazy" referrerPolicy="no-referrer" className="h-full w-full object-cover" />
                </div>
                <p className="mt-2 line-clamp-1 font-serif text-sm italic">{p.name}</p>
                <p className="text-xs font-bold tabular-nums">{p.price}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}

// ---------- BOLD-B (Sole Society) ----------
// Drop countdown style — top stripe with timer, photo-heavy grid.
function HomeBoldB({ template, hero, products, desktop }: Ctx) {
  const { primary, accent } = template.colors
  if (!desktop) {
    return (
      <div className="flex h-full flex-col bg-white text-zinc-900" style={{ width: REF_PHONE_W, height: REF_PHONE_H }}>
        <header className="flex items-center justify-between border-b-4 border-black px-6 pt-14 pb-3">
          <Menu className="h-6 w-6" />
          <span className="text-xl font-black uppercase tracking-tight" style={{ color: primary }}>{template.name}</span>
          <ShoppingBag className="h-6 w-6" />
        </header>
        <div className="px-6 py-4 text-white" style={{ background: primary }}>
          <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: accent }}>Drop 12 · live in</p>
          <div className="mt-2 grid grid-cols-4 gap-2 text-center">
            {[["02","DAYS"],["14","HRS"],["23","MIN"],["08","SEC"]].map(([n, l]) => (
              <div key={l} className="border-2 border-white py-1">
                <p className="text-2xl font-black leading-none tabular-nums">{n}</p>
                <p className="mt-0.5 text-[8px] font-black uppercase">{l}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="relative aspect-[4/3] w-full" style={{ background: accent }}>
          <img src={hero} alt="" loading="lazy" referrerPolicy="no-referrer" className="absolute inset-0 h-full w-full object-cover mix-blend-multiply" />
          <h1 className="absolute inset-0 flex flex-col items-center justify-center text-center text-5xl font-black uppercase leading-[0.85] tracking-tight text-white">SOLE<br />SEEKERS</h1>
        </div>
        <div className="grid grid-cols-2 border-t-4 border-black">
          {products.slice(0, 2).map((p, i) => (
            <div key={i} className="border-r-4 border-black last:border-r-0">
              <div className="aspect-square overflow-hidden">
                <img src={p.image} alt={p.name} loading="lazy" referrerPolicy="no-referrer" className="h-full w-full object-cover" />
              </div>
              <div className="px-3 py-2 text-black">
                <p className="truncate text-sm font-black uppercase">{p.name}</p>
                <p className="text-base font-black tabular-nums" style={{ color: primary }}>{p.price}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }
  return (
    <div className="flex h-full flex-col bg-white text-zinc-900" style={{ width: REF_DESKTOP_W, height: REF_DESKTOP_H }}>
      <header className="flex items-center justify-between border-b-4 border-black px-16 py-5 text-black">
        <span className="text-2xl font-black uppercase tracking-tight">{template.name}</span>
        <nav className="flex gap-8 text-sm font-black uppercase tracking-wider">
          <span>Drops</span><span>Raffles</span><span>Releases</span><span>Resell</span>
        </nav>
        <div className="flex items-center gap-5"><Search className="h-5 w-5" /><User className="h-5 w-5" /><ShoppingBag className="h-5 w-5" /></div>
      </header>
      <div className="flex items-center justify-between px-16 py-4 text-white" style={{ background: primary }}>
        <div>
          <p className="text-xs font-black uppercase tracking-widest" style={{ color: accent }}>Drop 12 · raffle live</p>
          <p className="text-2xl font-black uppercase tracking-tight">Air Max Sole Seekers · Friday 6pm</p>
        </div>
        <div className="grid grid-cols-4 gap-3 text-center">
          {[["02","DAYS"],["14","HRS"],["23","MIN"],["08","SEC"]].map(([n, l]) => (
            <div key={l} className="border-2 border-white px-3 py-2">
              <p className="text-3xl font-black leading-none tabular-nums">{n}</p>
              <p className="mt-1 text-[10px] font-black uppercase">{l}</p>
            </div>
          ))}
        </div>
        <button className="px-6 py-3 text-sm font-black uppercase tracking-widest text-black" style={{ background: accent }}>Enter raffle</button>
      </div>
      <div className="grid flex-1 grid-cols-3 gap-px bg-black">
        {products.slice(0, 3).map((p, i) => (
          <div key={i} className="relative bg-white">
            <div className="absolute left-3 top-3 z-10 border-2 border-black bg-white px-2 py-0.5 text-[10px] font-black uppercase">#{i + 1}</div>
            <div className="aspect-square overflow-hidden">
              <img src={p.image} alt={p.name} loading="lazy" referrerPolicy="no-referrer" className="h-full w-full object-cover" />
            </div>
            <div className="border-t-4 border-black px-5 py-4">
              <p className="text-xl font-black uppercase">{p.name}</p>
              <div className="mt-1 flex items-baseline justify-between">
                <p className="text-2xl font-black tabular-nums" style={{ color: primary }}>{p.price}</p>
                <p className="text-xs font-black uppercase text-zinc-500">Resell ≈ ₦{Math.round(parseInt(p.price.replace(/\D/g, ""), 10) * 1.6 / 1000)}k</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ---------- MINIMAL-B (Brew & Co) ----------
// Asymmetric — big product photo on the left, narrow text column.
function HomeMinimalB({ template, hero, products, desktop }: Ctx) {
  const { primary } = template.colors
  if (!desktop) {
    return (
      <div className="flex h-full flex-col bg-[#fafaf5] text-zinc-900" style={{ width: REF_PHONE_W, height: REF_PHONE_H }}>
        <header className="flex items-center justify-between px-6 pt-14 pb-3">
          <Menu className="h-5 w-5 text-zinc-700" />
          <span className="text-xs uppercase tracking-[0.5em]" style={{ color: primary }}>{template.name}</span>
          <ShoppingBag className="h-5 w-5 text-zinc-700" />
        </header>
        <div className="relative aspect-square w-full">
          <img src={hero} alt="" loading="lazy" referrerPolicy="no-referrer" className="h-full w-full object-cover" />
          <span className="absolute right-3 top-3 rounded-full bg-white/95 px-3 py-1 text-[9px] font-bold uppercase tracking-widest" style={{ color: primary }}>Single origin · Ethiopia</span>
        </div>
        <div className="px-6 py-5">
          <span className="text-[9px] uppercase tracking-[0.4em] text-zinc-500">Roast 047 · this week</span>
          <h1 className="mt-2 text-3xl font-light leading-tight" style={{ color: primary }}>Yirgacheffe<br />washed.</h1>
          <p className="mt-2 text-xs leading-relaxed text-zinc-500">Notes of jasmine, white peach, bergamot. Roasted 3 days ago.</p>
          <button className="mt-3 border-b text-[10px] uppercase tracking-[0.4em]" style={{ borderColor: primary, color: primary }}>Subscribe →</button>
        </div>
        <div className="grid grid-cols-3 gap-2 px-6 pb-6">
          {products.slice(0, 3).map((p, i) => (
            <div key={i}>
              <div className="aspect-square overflow-hidden bg-zinc-100">
                <img src={p.image} alt={p.name} loading="lazy" referrerPolicy="no-referrer" className="h-full w-full object-cover" />
              </div>
              <p className="mt-1 truncate text-[9px] text-zinc-600">{p.name}</p>
              <p className="text-[9px] tabular-nums" style={{ color: primary }}>{p.price}</p>
            </div>
          ))}
        </div>
      </div>
    )
  }
  return (
    <div className="flex h-full flex-col bg-[#fafaf5] text-zinc-900" style={{ width: REF_DESKTOP_W, height: REF_DESKTOP_H }}>
      <header className="flex items-center justify-between border-b border-zinc-200 px-16 py-6">
        <span className="text-sm uppercase tracking-[0.5em]" style={{ color: primary }}>{template.name}</span>
        <nav className="flex gap-12 text-xs uppercase tracking-[0.4em] text-zinc-600">
          <span>Beans</span><span>Subscription</span><span>Brew guides</span><span>Cafés</span>
        </nav>
        <div className="flex items-center gap-5 text-zinc-600"><Search className="h-5 w-5" /><User className="h-5 w-5" /><ShoppingBag className="h-5 w-5" /></div>
      </header>
      <div className="grid flex-1 grid-cols-[60%_40%]">
        <div className="relative">
          <img src={hero} alt="" loading="lazy" referrerPolicy="no-referrer" className="h-full w-full object-cover" />
          <div className="absolute left-10 top-10 inline-flex items-center gap-2 rounded-full bg-white/95 px-4 py-2 text-xs font-bold uppercase tracking-widest" style={{ color: primary }}>
            <span className="h-2 w-2 rounded-full" style={{ background: primary }} /> Single origin · Ethiopia
          </div>
        </div>
        <div className="flex flex-col justify-center px-16">
          <span className="text-xs uppercase tracking-[0.5em] text-zinc-500">Roast 047 · this week</span>
          <h1 className="mt-5 text-6xl font-light leading-[1.05]" style={{ color: primary }}>Yirgacheffe<br />washed.</h1>
          <p className="mt-6 max-w-md text-base leading-relaxed text-zinc-600">Notes of jasmine, white peach, bergamot. Roasted 3 days ago at our Ikeja roastery. 250g bag.</p>
          <p className="mt-4 text-3xl font-light tabular-nums" style={{ color: primary }}>₦9,800</p>
          <div className="mt-6 flex gap-3">
            <button className="border-b-2 pb-1 text-xs uppercase tracking-[0.4em]" style={{ borderColor: primary, color: primary }}>Buy a bag →</button>
            <button className="border-b-2 border-zinc-300 pb-1 text-xs uppercase tracking-[0.4em] text-zinc-500">Subscribe + save</button>
          </div>
        </div>
      </div>
      <section className="border-t border-zinc-200 px-16 py-8">
        <div className="flex items-baseline justify-between">
          <h2 className="text-sm uppercase tracking-[0.5em] text-zinc-500">More from this week's roast</h2>
          <span className="text-xs uppercase tracking-[0.4em]" style={{ color: primary }}>View roastery →</span>
        </div>
        <div className="mt-5 grid grid-cols-5 gap-5">
          {products.slice(0, 5).map((p, i) => (
            <div key={i}>
              <div className="aspect-square overflow-hidden bg-zinc-100">
                <img src={p.image} alt={p.name} loading="lazy" referrerPolicy="no-referrer" className="h-full w-full object-cover" />
              </div>
              <p className="mt-3 truncate text-sm text-zinc-700">{p.name}</p>
              <p className="mt-0.5 text-sm tabular-nums" style={{ color: primary }}>{p.price}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

// ---------- PLAYFUL-B (Pawsome) ----------
// Story-circle nav + scroll-style category cards.
function HomePlayfulB({ template, hero, products, desktop }: Ctx) {
  const { primary, accent } = template.colors
  if (!desktop) {
    return (
      <div className="flex h-full flex-col" style={{ width: REF_PHONE_W, height: REF_PHONE_H, background: `linear-gradient(180deg, ${primary}10, white)` }}>
        <header className="flex items-center justify-between px-6 pt-14 pb-3">
          <Menu className="h-6 w-6 text-zinc-700" />
          <span className="text-xl font-black tracking-tight" style={{ color: primary }}>{template.name}</span>
          <span className="relative flex h-9 w-9 items-center justify-center rounded-full text-white" style={{ background: accent }}>
            <ShoppingBag className="h-4 w-4" />
          </span>
        </header>
        <div className="flex gap-3 overflow-x-auto px-6 py-3">
          {["For Bella","Dogs","Cats","Toys","Treats","Vet"].map((label, i) => (
            <div key={label} className="flex shrink-0 flex-col items-center gap-1">
              <div className={cn("h-14 w-14 rounded-full p-0.5", i === 0 ? "bg-gradient-to-br from-fuchsia-500 via-amber-400 to-cyan-400" : "bg-white shadow-sm")}>
                <div className="h-full w-full overflow-hidden rounded-full bg-white">
                  <img src={products[i % products.length].image} alt={label} loading="lazy" referrerPolicy="no-referrer" className="h-full w-full object-cover" />
                </div>
              </div>
              <span className="text-[9px] font-bold text-zinc-700">{label}</span>
            </div>
          ))}
        </div>
        <div className="relative mx-4 overflow-hidden rounded-3xl" style={{ background: accent }}>
          <img src={hero} alt="" loading="lazy" referrerPolicy="no-referrer" className="aspect-[4/3] h-full w-full object-cover mix-blend-multiply" />
          <div className="absolute inset-0 flex flex-col justify-end p-5 text-white">
            <span className="text-xs font-black uppercase tracking-widest text-white/80">For Bella · age 3 · 12 kg</span>
            <h1 className="text-4xl font-black leading-tight">Bella's<br />favourites</h1>
            <button className="mt-3 inline-flex w-fit items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-black" style={{ color: primary }}>Shop her box →</button>
          </div>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-3 px-4 pb-4">
          {products.slice(0, 4).map((p, i) => (
            <div key={i} className="overflow-hidden rounded-2xl bg-white shadow-sm">
              <div className="relative aspect-[5/4]">
                <img src={p.image} alt={p.name} loading="lazy" referrerPolicy="no-referrer" className="h-full w-full object-cover" />
                <div className="absolute right-2 top-2 rounded-full bg-white/95 px-1.5 py-0.5 text-[9px] font-black shadow-sm" style={{ color: primary }}>★ 4.{8 + (i % 2)}</div>
              </div>
              <div className="px-2.5 py-1.5">
                <p className="truncate text-[11px] font-bold leading-tight">{p.name}</p>
                <p className="text-xs font-black tabular-nums leading-none" style={{ color: primary }}>{p.price}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }
  return (
    <div className="flex h-full flex-col" style={{ width: REF_DESKTOP_W, height: REF_DESKTOP_H, background: `linear-gradient(180deg, ${primary}15, white)` }}>
      <header className="flex items-center justify-between px-16 py-6">
        <span className="text-3xl font-black tracking-tight" style={{ color: primary }}>{template.name}</span>
        <nav className="flex gap-10 text-sm font-bold text-zinc-700">
          <span>Dogs</span><span>Cats</span><span>Find food</span><span>Vet chat</span><span>Subscribe</span>
        </nav>
        <div className="flex items-center gap-4">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-zinc-700"><Search className="h-4 w-4" /></span>
          <span className="relative flex h-10 w-10 items-center justify-center rounded-full text-white" style={{ background: accent }}><ShoppingBag className="h-4 w-4" /></span>
        </div>
      </header>
      <div className="flex gap-5 overflow-x-auto px-16 pb-4">
        {[
          { label: "For Bella", featured: true },
          { label: "Add a pet" },
          { label: "Dogs" },
          { label: "Cats" },
          { label: "Small pets" },
          { label: "Treats" },
          { label: "Toys" },
          { label: "Vet chat" },
        ].map((s, i) => (
          <div key={s.label} className="flex shrink-0 flex-col items-center gap-2">
            <div className={cn("h-20 w-20 rounded-full p-1", s.featured ? "bg-gradient-to-br from-fuchsia-500 via-amber-400 to-cyan-400" : "bg-white shadow-sm")}>
              <div className="h-full w-full overflow-hidden rounded-full bg-white">
                <img src={products[i % products.length].image} alt={s.label} loading="lazy" referrerPolicy="no-referrer" className="h-full w-full object-cover" />
              </div>
            </div>
            <span className="text-xs font-bold text-zinc-700">{s.label}</span>
          </div>
        ))}
      </div>
      <div className="grid flex-1 grid-cols-[1.3fr_1fr] gap-6 px-16 pb-6">
        <div className="relative overflow-hidden rounded-3xl" style={{ background: accent }}>
          <img src={hero} alt="" loading="lazy" referrerPolicy="no-referrer" className="absolute inset-0 h-full w-full object-cover mix-blend-multiply" />
          <div className="absolute inset-0 flex flex-col justify-end p-10 text-white">
            <span className="text-sm font-black uppercase tracking-widest text-white/80">For Bella · age 3 · 12 kg · sensitive stomach</span>
            <h1 className="mt-2 text-6xl font-black leading-tight">Bella's<br />favourites</h1>
            <p className="mt-4 max-w-md text-base font-bold text-white/90">Picks from your last 6 orders + a vet-suggested addition.</p>
            <div className="mt-5 flex gap-3">
              <button className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-base font-black" style={{ color: primary }}>Shop her box →</button>
              <button className="rounded-full border-2 border-white px-6 py-3 text-base font-black text-white">Edit profile</button>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 grid-rows-2 gap-3">
          {products.slice(0, 4).map((p, i) => (
            <div key={i} className="relative overflow-hidden rounded-2xl bg-white shadow-md">
              <div className="aspect-square">
                <img src={p.image} alt={p.name} loading="lazy" referrerPolicy="no-referrer" className="h-full w-full object-cover" />
              </div>
              <div className="absolute right-3 top-3 rounded-full bg-white/95 px-2 py-0.5 text-[10px] font-black" style={{ color: primary }}>★ 4.{8 + (i % 2)}</div>
              <div className="px-4 py-3">
                <p className="truncate text-base font-bold">{p.name}</p>
                <p className="text-lg font-black tabular-nums" style={{ color: primary }}>{p.price}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ---------- MINIMAL-C (Tech Stack) ----------
// B2B/tech retailer: spec-forward hero with feature callouts +
// compare-products widget + bulk-quote CTA strip.
function HomeMinimalC({ template, hero, products, desktop }: Ctx) {
  const { primary, accent } = template.colors
  if (!desktop) {
    return (
      <div className="flex h-full flex-col bg-white text-zinc-900" style={{ width: REF_PHONE_W, height: REF_PHONE_H }}>
        <header className="flex items-center justify-between border-b border-zinc-100 px-6 pt-14 pb-3">
          <Menu className="h-5 w-5 text-zinc-700" />
          <span className="text-sm font-bold uppercase tracking-[0.3em]" style={{ color: primary }}>{template.name}</span>
          <ShoppingBag className="h-5 w-5 text-zinc-700" />
        </header>
        <div className="bg-zinc-50 px-6 py-4">
          <span className="text-[10px] uppercase tracking-[0.4em]" style={{ color: accent }}>Featured · workhorse</span>
          <h1 className="mt-2 text-3xl font-light leading-tight" style={{ color: primary }}>16″ ProBook M3 Max</h1>
          <p className="mt-1 text-2xl font-light tabular-nums" style={{ color: primary }}>₦1,420,000</p>
        </div>
        <div className="relative aspect-[4/3]">
          <img src={hero} alt="" loading="lazy" referrerPolicy="no-referrer" className="h-full w-full object-cover" />
        </div>
        <div className="grid grid-cols-3 gap-px bg-zinc-200">
          {[
            { label: "M3 Max", sub: "chipset" },
            { label: "32 GB",  sub: "RAM" },
            { label: "1 TB",   sub: "SSD" },
          ].map((s, i) => (
            <div key={i} className="bg-white px-3 py-3 text-center">
              <p className="text-base font-light" style={{ color: primary }}>{s.label}</p>
              <p className="text-[9px] uppercase tracking-widest text-zinc-500">{s.sub}</p>
            </div>
          ))}
        </div>
        <div className="px-6 py-4">
          <div className="flex gap-2">
            <button className="flex-1 border-2 px-3 py-2 text-xs uppercase tracking-[0.3em]" style={{ borderColor: primary, color: primary }}>Compare</button>
            <button className="flex-1 px-3 py-2 text-xs uppercase tracking-[0.3em] text-white" style={{ background: primary }}>Add to bag</button>
          </div>
        </div>
        <div className="mt-auto grid grid-cols-3 gap-2 border-t border-zinc-100 px-6 py-3">
          {products.slice(0, 3).map((p, i) => (
            <div key={i}>
              <div className="aspect-square overflow-hidden bg-zinc-50">
                <img src={p.image} alt={p.name} loading="lazy" referrerPolicy="no-referrer" className="h-full w-full object-cover" />
              </div>
              <p className="mt-0.5 truncate text-[9px] text-zinc-700">{p.name}</p>
              <p className="text-[9px] tabular-nums" style={{ color: primary }}>{p.price}</p>
            </div>
          ))}
        </div>
      </div>
    )
  }
  return (
    <div className="flex h-full flex-col bg-white text-zinc-900" style={{ width: REF_DESKTOP_W, height: REF_DESKTOP_H }}>
      {/* Pre-header B2B strip */}
      <div className="flex items-center justify-between bg-zinc-900 px-16 py-2 text-[11px] text-zinc-300">
        <span>Free delivery on orders over ₦100k</span>
        <div className="flex items-center gap-6">
          <span>B2B portal</span><span>Request a quote</span><span>Bulk pricing →</span>
        </div>
      </div>
      <header className="flex items-center justify-between border-b border-zinc-200 px-16 py-5">
        <span className="text-xl font-bold uppercase tracking-[0.3em]" style={{ color: primary }}>{template.name}</span>
        <nav className="flex gap-10 text-xs font-semibold uppercase tracking-wider text-zinc-700">
          <span>Workstations</span><span>Accessories</span><span>Audio</span><span>Office</span><span>Compare</span>
        </nav>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 rounded-full border border-zinc-200 px-3 py-1.5 text-xs text-zinc-500"><Search className="h-3 w-3" /> Search 12,400 SKUs</div>
          <User className="h-5 w-5 text-zinc-700" />
          <ShoppingBag className="h-5 w-5 text-zinc-700" />
        </div>
      </header>
      <div className="grid flex-1 grid-cols-[1.2fr_1fr]">
        {/* Hero — big product photo with tech-spec callouts */}
        <div className="relative overflow-hidden bg-zinc-50">
          <img src={hero} alt="" loading="lazy" referrerPolicy="no-referrer" className="absolute inset-0 h-full w-full object-cover" />
          {/* Floating spec callouts */}
          {[
            { x: "12%", y: "20%", label: "M3 Max",  sub: "16-core CPU" },
            { x: "65%", y: "30%", label: "120 Hz",   sub: "ProMotion display" },
            { x: "20%", y: "70%", label: "22 hrs",   sub: "battery life" },
          ].map((c, i) => (
            <div key={i} className="absolute" style={{ left: c.x, top: c.y }}>
              <span className="block h-2 w-2 rounded-full" style={{ background: accent }} />
              <div className="ml-3 mt-1 rounded border border-zinc-300 bg-white px-3 py-1.5 shadow-md">
                <p className="text-sm font-bold" style={{ color: primary }}>{c.label}</p>
                <p className="text-[10px] uppercase tracking-wider text-zinc-500">{c.sub}</p>
              </div>
            </div>
          ))}
        </div>
        {/* Right rail */}
        <div className="flex flex-col justify-center px-16 py-10">
          <span className="text-xs uppercase tracking-[0.5em]" style={{ color: accent }}>Featured · workhorse</span>
          <h1 className="mt-4 text-6xl font-light leading-[1.05]" style={{ color: primary }}>16″ ProBook<br />M3 Max</h1>
          <p className="mt-3 text-sm uppercase tracking-widest text-zinc-500">In space black, silver, midnight</p>
          <p className="mt-6 text-4xl font-light tabular-nums" style={{ color: primary }}>₦1,420,000</p>
          <p className="text-xs text-zinc-500">or ₦118k × 12 with Paystack instalments</p>
          <div className="mt-6 grid grid-cols-3 gap-2 border border-zinc-200 p-3">
            {[
              { label: "M3 Max", sub: "16-core chip" },
              { label: "32 GB",  sub: "unified memory" },
              { label: "1 TB",   sub: "fast SSD" },
            ].map((s, i) => (
              <div key={i} className="text-center">
                <p className="text-base font-light" style={{ color: primary }}>{s.label}</p>
                <p className="text-[9px] uppercase tracking-widest text-zinc-500">{s.sub}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 flex gap-3">
            <button className="px-7 py-3 text-xs uppercase tracking-[0.4em] text-white" style={{ background: primary }}>Add to bag</button>
            <button className="border-b-2 pb-1 text-xs uppercase tracking-[0.4em]" style={{ borderColor: primary, color: primary }}>Compare → 4 products</button>
          </div>
          <div className="mt-4 flex items-center gap-3 text-xs text-zinc-500">
            <Shield className="h-3.5 w-3.5" style={{ color: accent }} />
            Price-match guaranteed · 2-year warranty · 14-day returns
          </div>
        </div>
      </div>
      {/* B2B CTA strip */}
      <div className="flex items-center justify-between border-t border-zinc-200 bg-zinc-50 px-16 py-5">
        <div className="flex items-center gap-6">
          <span className="text-xs uppercase tracking-[0.5em] text-zinc-500">Buying for a team?</span>
          <span className="text-base text-zinc-700">Get a quote in 2 hours · NET-30 terms · dedicated account manager</span>
        </div>
        <button className="border-b-2 pb-1 text-xs uppercase tracking-[0.4em]" style={{ borderColor: primary, color: primary }}>Request a bulk quote →</button>
      </div>
    </div>
  )
}

// ---------- PLAYFUL-C (Crafted) ----------
// Maker marketplace: maker-of-the-week + grid of maker mini-profiles
// + "custom order" CTA.
function HomePlayfulC({ template, hero, products, desktop }: Ctx) {
  const { primary, accent } = template.colors
  if (!desktop) {
    return (
      <div className="flex h-full flex-col" style={{ width: REF_PHONE_W, height: REF_PHONE_H, background: `linear-gradient(180deg, ${primary}12, white 60%)` }}>
        <header className="flex items-center justify-between px-6 pt-14 pb-3">
          <Menu className="h-6 w-6 text-zinc-700" />
          <span className="text-xl font-black tracking-tight" style={{ color: primary }}>{template.name}</span>
          <ShoppingBag className="h-6 w-6 text-zinc-700" />
        </header>
        <div className="px-6 py-2 text-center">
          <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: accent }}>Maker of the week</span>
          <h1 className="mt-1 text-4xl font-black leading-tight" style={{ color: primary }}>Aduke<br />weaves.</h1>
        </div>
        <div className="relative mx-4 my-3 overflow-hidden rounded-3xl">
          <img src={hero} alt="" loading="lazy" referrerPolicy="no-referrer" className="aspect-[4/3] h-full w-full object-cover" />
          <div className="absolute bottom-3 left-3 right-3 flex items-center gap-3 rounded-2xl bg-white/95 px-3 py-2 backdrop-blur-sm">
            <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full ring-2" style={{ borderColor: accent }}>
              <img src={products[0].image} alt="" className="h-full w-full object-cover" loading="lazy" referrerPolicy="no-referrer" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-black">Aduke Bello</p>
              <p className="text-[10px] text-zinc-500">Iseyin · 47 pieces · since 2018</p>
            </div>
            <button className="rounded-full px-3 py-1.5 text-[10px] font-black text-white" style={{ background: primary }}>Shop her work</button>
          </div>
        </div>
        <div className="px-6 py-2">
          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">8 makers · 312 pieces</p>
        </div>
        <div className="grid flex-1 grid-cols-2 gap-3 px-4 pb-4">
          {products.slice(0, 4).map((p, i) => (
            <div key={i} className="relative overflow-hidden rounded-2xl bg-white shadow-sm">
              <div className="aspect-square">
                <img src={p.image} alt={p.name} loading="lazy" referrerPolicy="no-referrer" className="h-full w-full object-cover" />
              </div>
              <div className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-white/95 px-2 py-0.5">
                <MapPin className="h-2 w-2" style={{ color: accent }} />
                <span className="text-[8px] font-bold">Lagos</span>
              </div>
              <div className="px-3 py-2">
                <p className="truncate text-xs font-bold">{p.name}</p>
                <p className="text-sm font-black tabular-nums" style={{ color: primary }}>{p.price}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }
  return (
    <div className="flex h-full flex-col" style={{ width: REF_DESKTOP_W, height: REF_DESKTOP_H, background: `linear-gradient(180deg, ${primary}10, white 50%)` }}>
      <header className="flex items-center justify-between px-16 py-6">
        <span className="text-3xl font-black tracking-tight" style={{ color: primary }}>{template.name}</span>
        <nav className="flex gap-10 text-sm font-bold text-zinc-700">
          <span>Shop</span><span>Makers</span><span>Custom orders</span><span>Stories</span>
        </nav>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs text-zinc-500 shadow-sm"><Search className="h-3.5 w-3.5" /> Find your maker</div>
          <span className="relative flex h-10 w-10 items-center justify-center rounded-full text-white" style={{ background: accent }}><ShoppingBag className="h-4 w-4" /></span>
        </div>
      </header>
      {/* Maker of the week feature */}
      <div className="grid grid-cols-[55%_45%] gap-8 px-16 pb-6">
        <div className="relative aspect-[4/3] overflow-hidden rounded-3xl">
          <img src={hero} alt="" loading="lazy" referrerPolicy="no-referrer" className="absolute inset-0 h-full w-full object-cover" />
          <span className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full bg-white/95 px-3 py-1.5 text-xs font-black backdrop-blur-sm" style={{ color: primary }}>
            <span className="h-2 w-2 rounded-full" style={{ background: accent }} /> Maker of the week
          </span>
        </div>
        <div className="flex flex-col justify-center">
          <span className="text-xs font-black uppercase tracking-widest" style={{ color: accent }}>Aduke Bello · Iseyin</span>
          <h1 className="mt-3 text-7xl font-black leading-[0.9]" style={{ color: primary }}>Aduke<br />weaves.</h1>
          <p className="mt-5 max-w-md text-base font-medium leading-relaxed text-zinc-700">
            Third-generation Aso-Oke weaver. Every piece in her collection takes 14 days on the loom, then 3 more in finishing. We pay her 70% of every sale.
          </p>
          <div className="mt-5 flex items-baseline gap-6">
            <div><p className="text-2xl font-black" style={{ color: primary }}>47</p><p className="text-[10px] uppercase tracking-widest text-zinc-500">pieces</p></div>
            <div><p className="text-2xl font-black" style={{ color: primary }}>2018</p><p className="text-[10px] uppercase tracking-widest text-zinc-500">joined</p></div>
            <div><p className="text-2xl font-black" style={{ color: primary }}>4.96★</p><p className="text-[10px] uppercase tracking-widest text-zinc-500">rating</p></div>
          </div>
          <div className="mt-6 flex gap-3">
            <button className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-base font-black text-white" style={{ background: primary }}>Shop her collection →</button>
            <button className="inline-flex items-center gap-2 rounded-full border-2 bg-white px-6 py-3 text-base font-black" style={{ borderColor: primary, color: primary }}>Request a custom piece</button>
          </div>
        </div>
      </div>
      {/* Maker grid + product grid */}
      <div className="grid flex-1 grid-cols-[280px_1fr] gap-8 border-t border-zinc-200 px-16 pt-5">
        <aside>
          <p className="text-xs font-black uppercase tracking-widest text-zinc-500">Other makers</p>
          <ul className="mt-3 space-y-3">
            {[
              { name: "Tunde Adebayo", city: "Abeokuta", craft: "leather",  pieces: 32 },
              { name: "Chiamaka Okeke", city: "Aba",      craft: "ceramics", pieces: 41 },
              { name: "Hassan Musa",   city: "Kano",     craft: "brassware", pieces: 28 },
              { name: "Bisi Sanyaolu", city: "Ibadan",   craft: "raffia",   pieces: 19 },
            ].map((m, i) => (
              <li key={i} className="flex items-center gap-3 rounded-2xl bg-white px-3 py-2 shadow-sm">
                <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full ring-2" style={{ borderColor: accent }}>
                  <img src={products[(i + 1) % products.length].image} alt="" className="h-full w-full object-cover" loading="lazy" referrerPolicy="no-referrer" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-black">{m.name}</p>
                  <p className="text-[10px] text-zinc-500">{m.city} · {m.craft} · {m.pieces} pieces</p>
                </div>
              </li>
            ))}
          </ul>
        </aside>
        <div>
          <div className="flex items-baseline justify-between">
            <p className="text-xs font-black uppercase tracking-widest text-zinc-500">Pieces from this week's makers</p>
            <span className="text-xs font-black uppercase tracking-widest" style={{ color: primary }}>View all 312 →</span>
          </div>
          <div className="mt-3 grid grid-cols-4 gap-4">
            {products.slice(0, 4).map((p, i) => (
              <div key={i} className="relative overflow-hidden rounded-2xl bg-white shadow-sm">
                <div className="aspect-square">
                  <img src={p.image} alt={p.name} loading="lazy" referrerPolicy="no-referrer" className="h-full w-full object-cover" />
                </div>
                <div className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-white/95 px-2 py-0.5">
                  <MapPin className="h-2.5 w-2.5" style={{ color: accent }} />
                  <span className="text-[9px] font-bold">{["Lagos","Aba","Kano","Iseyin"][i % 4]}</span>
                </div>
                <div className="px-3 py-2">
                  <p className="truncate text-sm font-bold">{p.name}</p>
                  <p className="text-base font-black tabular-nums" style={{ color: primary }}>{p.price}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ====================================================================
// Registry
// ====================================================================

// ====================================================================
// New pages — Contact / FAQ / Account / Order tracking / Wishlist
// Each is a style-aware Generic renderer like the existing ones.
// ====================================================================

// ---------- shared header helpers ----------
function PageHeader({ template, desktop, label, right }: { template: StorefrontTemplate; desktop: boolean; label?: string; right?: React.ReactNode }) {
  const { primary, accent } = template.colors
  const style = template.style
  const isLuxe = style === "luxe"
  return (
    <header className={cn("flex items-center justify-between border-b px-6 md:px-16", desktop ? "py-5" : "pt-14 pb-3", isLuxe ? "border-zinc-800" : "border-zinc-200")}>
      {desktop ? (
        <>
          <span className={cn("text-2xl font-bold", isLuxe && "font-serif italic", style === "bold" && "font-black uppercase")} style={{ color: isLuxe ? accent : primary }}>{template.name}</span>
          <nav className={cn("flex gap-10 text-xs uppercase", isLuxe ? "tracking-[0.4em] text-zinc-400" : style === "bold" ? "font-black tracking-wider text-zinc-700" : "tracking-[0.4em] text-zinc-600")}>
            <span>Shop</span><span>Story</span><span>Contact</span><span>Account</span>
          </nav>
          <div className="flex items-center gap-5"><Search className="h-5 w-5" /><User className="h-5 w-5" /><ShoppingBag className="h-5 w-5" /></div>
        </>
      ) : (
        <>
          <ChevronLeft className="h-6 w-6" />
          <span className={cn("text-base font-bold", isLuxe && "font-serif italic", style === "bold" && "font-black uppercase")}>{label ?? template.name}</span>
          {right ?? <ShoppingBag className="h-6 w-6" />}
        </>
      )}
    </header>
  )
}

// ---------- CONTACT ----------
function ContactGeneric({ template, desktop }: Ctx) {
  const { primary, accent } = template.colors
  const style = template.style
  const isLuxe = style === "luxe"
  const w = desktop ? REF_DESKTOP_W : REF_PHONE_W
  const h = desktop ? REF_DESKTOP_H : REF_PHONE_H
  const heading = isLuxe ? "Get in touch." : style === "bold" ? "Talk to us" : "We're here."
  const headingClass = cn(
    "leading-tight",
    isLuxe ? "font-serif italic" : style === "editorial" ? "font-serif italic" : style === "bold" ? "font-black uppercase" : style === "minimal" ? "font-light" : "font-bold",
    desktop ? "text-6xl" : "text-3xl",
  )
  const fieldBorder = isLuxe ? "#3f3f46" : "#d4d4d8"
  return (
    <div className={cn("flex h-full flex-col", isLuxe ? "bg-zinc-950 text-zinc-100" : "bg-white text-zinc-900")} style={{ width: w, height: h }}>
      <PageHeader template={template} desktop={desktop} label="Contact" />
      <div className={cn(desktop ? "px-16 py-10" : "px-6 py-5")}>
        <span className="text-xs uppercase tracking-[0.4em]" style={{ color: accent }}>Reach us</span>
        <h1 className={cn("mt-2", headingClass)}>{heading}</h1>
        <p className={cn("mt-2 max-w-xl", isLuxe ? "text-zinc-400" : "text-zinc-600", desktop ? "text-base" : "text-sm")}>
          We answer every WhatsApp message ourselves. Email replies inside 2 business hours, Mon–Sat.
        </p>
      </div>
      <div className={cn("grid flex-1 overflow-hidden", desktop ? "grid-cols-[55%_45%] gap-10 px-16 pb-10" : "grid-cols-1 gap-5 px-6 pb-6")}>
        {/* Form */}
        <form className="space-y-4">
          <div className={cn("grid gap-4", desktop ? "grid-cols-2" : "grid-cols-1")}>
            <FieldB label="First name" placeholder="Aisha" border={fieldBorder} />
            <FieldB label="Last name"  placeholder="Nwosu" border={fieldBorder} />
          </div>
          <FieldB label="Email" placeholder="you@yours.com" border={fieldBorder} />
          <FieldB label="Subject" placeholder="Order #SHOP-7849 — sizing question" border={fieldBorder} />
          <FieldB label="Message" border={fieldBorder} multiline />
          <div className="flex items-center gap-3">
            <button className={cn("px-7 py-3 text-sm font-bold text-white", style === "playful" ? "rounded-full" : "rounded-none", style === "bold" && "uppercase tracking-widest")} style={{ background: primary }}>Send message</button>
            <span className={cn("text-xs", isLuxe ? "text-zinc-500" : "text-zinc-500")}>Replies within 2 hours</span>
          </div>
        </form>

        {/* Info + map */}
        <aside className={cn("flex flex-col gap-4 self-start", desktop ? "" : "")}>
          <div className={cn("rounded border p-5", isLuxe ? "border-zinc-800" : "border-zinc-200")}>
            <p className="text-xs uppercase tracking-[0.4em]" style={{ color: accent }}>Studio + showroom</p>
            <p className={cn("mt-3 leading-relaxed", isLuxe ? "text-zinc-200" : "text-zinc-700")}>12 Admiralty Way<br />Lekki Phase 1<br />Lagos · Nigeria</p>
            <p className={cn("mt-2 text-xs", isLuxe ? "text-zinc-500" : "text-zinc-500")}>Mon–Fri · 10am to 7pm<br />Sat · 11am to 5pm · Sun closed</p>
          </div>
          <div className={cn("grid grid-cols-3 gap-2", desktop ? "" : "")}>
            {[
              { Icon: MessageCircle, label: "WhatsApp", sub: "0803 555 0118" },
              { Icon: PhoneIcon,     label: "Phone",    sub: "01 4634 552"   },
              { Icon: Mail,          label: "Email",    sub: "hi@shop.ng"    },
            ].map((c) => (
              <div key={c.label} className={cn("rounded border p-3 text-center", isLuxe ? "border-zinc-800" : "border-zinc-200")}>
                <c.Icon className="mx-auto h-5 w-5" style={{ color: accent }} />
                <p className={cn("mt-1 text-[10px] uppercase tracking-wider", isLuxe ? "text-zinc-500" : "text-zinc-500")}>{c.label}</p>
                <p className="text-xs font-bold">{c.sub}</p>
              </div>
            ))}
          </div>
          {/* Map placeholder — CSS grid pattern, no external dep */}
          <div className={cn("relative aspect-[3/2] overflow-hidden rounded border", isLuxe ? "border-zinc-800" : "border-zinc-200")} style={{ background: isLuxe ? "#0a0a0a" : "#f4f4f5" }}>
            <div className="absolute inset-0" style={{
              backgroundImage: `linear-gradient(${isLuxe ? "#27272a" : "#e4e4e7"} 1px, transparent 1px), linear-gradient(90deg, ${isLuxe ? "#27272a" : "#e4e4e7"} 1px, transparent 1px)`,
              backgroundSize: "32px 32px",
            }} />
            <span className="absolute left-1/2 top-1/2 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full text-white shadow-lg" style={{ background: accent }}>
              <MapPin className="h-5 w-5" />
            </span>
            <span className={cn("absolute bottom-2 right-2 rounded px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest", isLuxe ? "bg-zinc-900 text-zinc-300" : "bg-white text-zinc-700")}>Open in maps →</span>
          </div>
          <div className={cn("flex items-center gap-3", desktop ? "" : "")}>
            <span className={cn("text-xs uppercase tracking-[0.4em]", isLuxe ? "text-zinc-500" : "text-zinc-500")}>Follow us</span>
            <Instagram className="h-4 w-4" style={{ color: accent }} />
            <span className="text-xs font-semibold">@{template.id.replace(/-/g, "")}</span>
          </div>
        </aside>
      </div>
    </div>
  )
}

function FieldB({ label, placeholder, border, multiline }: { label: string; placeholder?: string; border: string; multiline?: boolean }) {
  return (
    <label className="block">
      <span className="text-[10px] uppercase tracking-[0.4em] text-zinc-500">{label}</span>
      <div className="mt-1 border-b" style={{ borderColor: border }}>
        {multiline ? (
          <div className="h-20 bg-transparent py-2 text-sm">{placeholder ?? "Tell us what's on your mind…"}</div>
        ) : (
          <div className="py-2 text-sm" style={{ color: placeholder ? "#9ca3af" : undefined }}>{placeholder ?? ""}</div>
        )}
      </div>
    </label>
  )
}

// ---------- FAQ ----------
function FaqGeneric({ template, desktop }: Ctx) {
  const { primary, accent } = template.colors
  const style = template.style
  const isLuxe = style === "luxe"
  const w = desktop ? REF_DESKTOP_W : REF_PHONE_W
  const h = desktop ? REF_DESKTOP_H : REF_PHONE_H

  const categories = ["All", "Orders", "Shipping", "Returns", "Sizing", "Care", "Account"]
  const questions = [
    { q: "How long does delivery take?",                          a: "GIG Standard is 2–4 days nationwide. Sendbox Express is next-day in Lagos.", cat: "Shipping", open: true },
    { q: "Do you ship outside Nigeria?",                          a: "Yes — DHL Express to anywhere worldwide. Rates calculated at checkout." },
    { q: "What's your return policy?",                            a: "14 days, free returns. Pallio sends a prepaid courier label by email." },
    { q: "How do I track my order?",                              a: "You'll get a tracking link by email + WhatsApp the moment the courier picks up." },
    { q: "Are the colours on screen accurate?",                   a: "We photograph every piece in natural daylight. Variation up to 10% is normal." },
    { q: "Can I change my order after placing it?",               a: "Yes — within 1 hour of placing. After that, ping our WhatsApp and we'll try our best." },
  ]
  return (
    <div className={cn("flex h-full flex-col", isLuxe ? "bg-zinc-950 text-zinc-100" : "bg-white text-zinc-900")} style={{ width: w, height: h }}>
      <PageHeader template={template} desktop={desktop} label="FAQ" />
      <div className={cn(desktop ? "px-16 py-10" : "px-6 py-5")}>
        <span className="text-xs uppercase tracking-[0.4em]" style={{ color: accent }}>Help</span>
        <h1 className={cn(
          "mt-2 leading-tight",
          isLuxe ? "font-serif italic" : style === "bold" ? "font-black uppercase" : style === "minimal" ? "font-light" : "font-bold",
          desktop ? "text-5xl" : "text-3xl",
        )}>Frequently asked.</h1>
        <p className={cn("mt-2 max-w-xl text-sm", isLuxe ? "text-zinc-400" : "text-zinc-600")}>If you can't find an answer here, our team responds within 2 hours on WhatsApp.</p>
      </div>
      <div className={cn(desktop ? "px-16" : "px-6")}>
        <div className="flex gap-2 overflow-x-auto">
          {categories.map((c, i) => (
            <span key={c} className={cn("shrink-0 border px-3 py-1.5 text-xs font-semibold", style === "playful" ? "rounded-full" : "rounded-none")} style={i === 0 ? { background: primary, color: "white", borderColor: primary } : { borderColor: isLuxe ? "#3f3f46" : "#d4d4d8", color: isLuxe ? "#a1a1aa" : "#52525b" }}>
              {c}
            </span>
          ))}
        </div>
      </div>
      <div className={cn("flex-1 overflow-hidden", desktop ? "grid grid-cols-[1fr_320px] gap-10 px-16 py-8" : "px-6 py-5")}>
        <ul className={cn("divide-y", isLuxe ? "divide-zinc-800" : "divide-zinc-200")}>
          {questions.map((q, i) => (
            <li key={i} className="py-4">
              <div className="flex items-start justify-between gap-4">
                <p className={cn("text-base", q.open && "font-bold")}>{q.q}</p>
                <ChevronUp className={cn("h-4 w-4 shrink-0 transition-transform", !q.open && "rotate-180")} style={{ color: accent }} />
              </div>
              {q.open && (
                <p className={cn("mt-2 max-w-2xl text-sm leading-relaxed", isLuxe ? "text-zinc-400" : "text-zinc-600")}>{q.a}</p>
              )}
            </li>
          ))}
        </ul>
        {desktop && (
          <aside className={cn("self-start rounded border p-6", isLuxe ? "border-zinc-800" : "border-zinc-200")}>
            <Headphones className="h-6 w-6" style={{ color: accent }} />
            <p className={cn("mt-3 text-lg", isLuxe ? "font-serif italic" : "font-bold")}>Still need help?</p>
            <p className={cn("mt-2 text-sm", isLuxe ? "text-zinc-400" : "text-zinc-600")}>Our team responds within 2 hours, Mon–Sat.</p>
            <button className={cn("mt-4 inline-flex w-full items-center justify-center gap-2 px-4 py-3 text-sm font-bold text-white", style === "playful" ? "rounded-full" : "rounded-none")} style={{ background: primary }}>
              <MessageCircle className="h-4 w-4" /> WhatsApp us
            </button>
            <button className={cn("mt-2 inline-flex w-full items-center justify-center gap-2 border px-4 py-3 text-sm font-bold", isLuxe ? "border-zinc-700 text-zinc-200" : "border-zinc-300 text-zinc-700", style === "playful" ? "rounded-full" : "rounded-none")}>
              <Mail className="h-4 w-4" /> Email
            </button>
          </aside>
        )}
      </div>
    </div>
  )
}

// ---------- ACCOUNT ----------
function AccountGeneric({ template, products, desktop }: Ctx) {
  const { primary, accent } = template.colors
  const style = template.style
  const isLuxe = style === "luxe"
  const w = desktop ? REF_DESKTOP_W : REF_PHONE_W
  const h = desktop ? REF_DESKTOP_H : REF_PHONE_H

  const orders = [
    { id: "SHOP-7849", date: "May 19", status: "Out for delivery", tone: "warning", total: "₦118,137", items: 3 },
    { id: "SHOP-7821", date: "May 12", status: "Delivered",        tone: "success", total: "₦42,500",  items: 2 },
    { id: "SHOP-7798", date: "May 02", status: "Delivered",        tone: "success", total: "₦24,500",  items: 1 },
    { id: "SHOP-7720", date: "Apr 18", status: "Refunded",         tone: "neutral", total: "₦52,000",  items: 1 },
  ] as const

  const tabs = ["Orders", "Addresses", "Payment", "Wishlist", "Settings"]

  return (
    <div className={cn("flex h-full flex-col", isLuxe ? "bg-zinc-950 text-zinc-100" : "bg-white text-zinc-900")} style={{ width: w, height: h }}>
      <PageHeader template={template} desktop={desktop} label="My account" />
      <div className={cn(desktop ? "px-16 py-8" : "px-6 py-5")}>
        <div className="flex items-center gap-4">
          <span className="flex h-14 w-14 items-center justify-center rounded-full text-white" style={{ background: accent }}>
            <span className="text-lg font-black">AN</span>
          </span>
          <div>
            <p className={cn("text-2xl", isLuxe ? "font-serif italic" : style === "bold" ? "font-black uppercase" : "font-bold")}>Hi, Aisha</p>
            <p className={cn("text-xs uppercase tracking-[0.3em]", isLuxe ? "text-zinc-500" : "text-zinc-500")}>Member since 2024 · 14 orders</p>
          </div>
        </div>
      </div>
      <div className={cn(desktop ? "grid grid-cols-[220px_1fr] gap-10 px-16 pb-10" : "px-6 pb-5")}>
        {/* Sidebar tabs */}
        <aside className={cn(desktop ? "" : "mb-4")}>
          {desktop ? (
            <ul className={cn("space-y-1 border-y py-2", isLuxe ? "border-zinc-800" : "border-zinc-200")}>
              {tabs.map((t, i) => (
                <li key={t}>
                  <button className={cn("flex w-full items-center justify-between rounded px-3 py-2 text-sm", i === 0 ? "" : isLuxe ? "text-zinc-400 hover:text-zinc-100" : "text-zinc-600 hover:text-zinc-900")} style={i === 0 ? { background: isLuxe ? `${accent}20` : `${primary}10`, color: isLuxe ? accent : primary, fontWeight: 700 } : undefined}>
                    {t}
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </li>
              ))}
              <li className="mt-4 pt-4" style={{ borderTop: `1px solid ${isLuxe ? "#27272a" : "#e4e4e7"}` }}>
                <button className={cn("w-full px-3 py-2 text-left text-sm", isLuxe ? "text-zinc-500" : "text-zinc-500")}>Sign out</button>
              </li>
            </ul>
          ) : (
            <div className="flex gap-2 overflow-x-auto">
              {tabs.map((t, i) => (
                <span key={t} className={cn("shrink-0 border px-3 py-1.5 text-xs font-semibold", style === "playful" ? "rounded-full" : "rounded-none")} style={i === 0 ? { background: primary, color: "white", borderColor: primary } : { borderColor: isLuxe ? "#3f3f46" : "#d4d4d8" }}>{t}</span>
              ))}
            </div>
          )}
        </aside>
        {/* Orders panel */}
        <div className="space-y-4">
          {/* KPI strip */}
          <div className={cn("grid grid-cols-3 gap-3", desktop ? "" : "")}>
            {[
              { label: "Total spent",  value: "₦642,800",  hint: "lifetime" },
              { label: "Loyalty pts",  value: "1,420",     hint: "₦14k credit" },
              { label: "Open orders",  value: "1",         hint: "out for delivery" },
            ].map((k) => (
              <div key={k.label} className={cn("rounded border p-4", isLuxe ? "border-zinc-800" : "border-zinc-200")}>
                <p className={cn("text-[10px] uppercase tracking-[0.3em]", isLuxe ? "text-zinc-500" : "text-zinc-500")}>{k.label}</p>
                <p className={cn("mt-1 text-2xl font-bold tabular-nums", isLuxe && "font-serif italic")} style={{ color: isLuxe ? accent : primary }}>{k.value}</p>
                <p className={cn("text-[10px]", isLuxe ? "text-zinc-500" : "text-zinc-500")}>{k.hint}</p>
              </div>
            ))}
          </div>

          {/* Orders list */}
          <div className="flex items-baseline justify-between">
            <h2 className={cn("text-xl", isLuxe ? "font-serif italic" : "font-bold")}>Recent orders</h2>
            <span className="text-xs uppercase tracking-[0.4em]" style={{ color: accent }}>View all →</span>
          </div>
          <ul className={cn("divide-y rounded border", isLuxe ? "divide-zinc-800 border-zinc-800" : "divide-zinc-100 border-zinc-200")}>
            {orders.map((o) => (
              <li key={o.id} className="flex items-center gap-4 p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded" style={{ background: `${accent}15`, color: accent }}>
                  <Package className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-mono text-sm font-bold">{o.id}</p>
                  <p className={cn("text-xs", isLuxe ? "text-zinc-500" : "text-zinc-500")}>{o.date} · {o.items} items</p>
                </div>
                <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider", o.tone === "success" ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-300" : o.tone === "warning" ? "bg-amber-500/15 text-amber-700 dark:text-amber-300" : isLuxe ? "bg-zinc-800 text-zinc-400" : "bg-zinc-100 text-zinc-500")}>
                  {o.status}
                </span>
                <p className="text-sm font-bold tabular-nums">{o.total}</p>
                <ChevronRight className={cn("h-4 w-4 shrink-0", isLuxe ? "text-zinc-500" : "text-zinc-400")} />
              </li>
            ))}
          </ul>

          {/* Saved address */}
          {desktop && (
            <div className={cn("grid grid-cols-2 gap-4")}>
              <div className={cn("rounded border p-4", isLuxe ? "border-zinc-800" : "border-zinc-200")}>
                <p className={cn("text-[10px] uppercase tracking-[0.4em]", isLuxe ? "text-zinc-500" : "text-zinc-500")}>Default address</p>
                <p className="mt-2 font-bold">Aisha Nwosu</p>
                <p className={cn("text-sm", isLuxe ? "text-zinc-400" : "text-zinc-600")}>12 Admiralty Way · Lekki Phase 1 · Lagos</p>
                <p className={cn("mt-1 text-xs", isLuxe ? "text-zinc-500" : "text-zinc-500")}>+234 803 555 0118</p>
              </div>
              <div className={cn("rounded border p-4", isLuxe ? "border-zinc-800" : "border-zinc-200")}>
                <p className={cn("text-[10px] uppercase tracking-[0.4em]", isLuxe ? "text-zinc-500" : "text-zinc-500")}>Saved payment</p>
                <div className="mt-2 flex items-center gap-3">
                  <CreditCard className="h-5 w-5" style={{ color: accent }} />
                  <div>
                    <p className="font-bold">Visa · ending 4242</p>
                    <p className={cn("text-xs", isLuxe ? "text-zinc-500" : "text-zinc-500")}>Expires 12/27</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ---------- ORDER TRACKING ----------
function TrackGeneric({ template, products, desktop }: Ctx) {
  const { primary, accent } = template.colors
  const style = template.style
  const isLuxe = style === "luxe"
  const w = desktop ? REF_DESKTOP_W : REF_PHONE_W
  const h = desktop ? REF_DESKTOP_H : REF_PHONE_H

  const steps = [
    { label: "Order placed",  done: true,  at: "May 19 · 11:22am" },
    { label: "Paid",          done: true,  at: "May 19 · 11:22am" },
    { label: "Packed",        done: true,  at: "May 19 · 4:08pm" },
    { label: "Shipped",       done: true,  at: "May 20 · 9:14am" },
    { label: "Out for delivery", done: true, at: "Today · 8:52am", current: true },
    { label: "Delivered",     done: false, at: "Expected today · by 6pm" },
  ]

  return (
    <div className={cn("flex h-full flex-col", isLuxe ? "bg-zinc-950 text-zinc-100" : "bg-white text-zinc-900")} style={{ width: w, height: h }}>
      <PageHeader template={template} desktop={desktop} label="Track order" />
      <div className={cn(desktop ? "px-16 py-8" : "px-6 py-5")}>
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <div>
            <span className="text-xs uppercase tracking-[0.4em]" style={{ color: accent }}>Order · placed May 19</span>
            <h1 className={cn(
              "mt-1 leading-tight",
              isLuxe ? "font-serif italic" : style === "bold" ? "font-black uppercase" : "font-bold",
              desktop ? "text-4xl" : "text-2xl",
            )}>SHOP-7849</h1>
          </div>
          <span className="rounded-full bg-amber-500/15 px-3 py-1 text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300">Out for delivery</span>
        </div>
        <p className={cn("mt-2 text-sm", isLuxe ? "text-zinc-400" : "text-zinc-600")}>
          ETA: <strong className="font-semibold text-foreground">Today, by 6pm</strong> · Courier: GIG Logistics · <span className="font-mono">GIGL-9X4-22001</span>
        </p>
      </div>
      <div className={cn("grid flex-1 overflow-hidden", desktop ? "grid-cols-[1.4fr_1fr] gap-10 px-16 pb-10" : "grid-cols-1 gap-5 px-6 pb-6")}>
        {/* Timeline */}
        <div>
          <ol className={cn("relative space-y-5 border-l-2 pl-6", isLuxe ? "border-zinc-800" : "border-zinc-200")}>
            {steps.map((s, i) => (
              <li key={i} className="relative">
                <span className={cn(
                  "absolute -left-[33px] top-0 flex h-6 w-6 items-center justify-center rounded-full ring-4",
                  s.done ? "text-white" : isLuxe ? "bg-zinc-800 text-zinc-500" : "bg-white text-zinc-400",
                  isLuxe ? "ring-zinc-950" : "ring-white",
                )}
                  style={s.done ? { background: s.current ? accent : "#10b981" } : undefined}
                >
                  {s.done ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : <Box className="h-3.5 w-3.5" />}
                </span>
                <div className="flex items-baseline justify-between gap-3">
                  <p className={cn("text-base", s.current && "font-bold")} style={s.current ? { color: accent } : undefined}>{s.label}</p>
                  <p className={cn("text-xs tabular-nums", isLuxe ? "text-zinc-500" : "text-zinc-500")}>{s.at}</p>
                </div>
                {s.current && (
                  <p className={cn("mt-1 text-xs", isLuxe ? "text-zinc-400" : "text-zinc-600")}>
                    Rider Tunde just picked up at the Lekki hub. You'll get a call before arrival.
                  </p>
                )}
              </li>
            ))}
          </ol>
          <button className={cn(
            "mt-6 inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white",
            style === "playful" ? "rounded-full" : "rounded-none",
            style === "bold" && "uppercase tracking-widest",
          )} style={{ background: primary }}>
            <Truck className="h-4 w-4" /> Live courier map
          </button>
        </div>

        {/* Items + summary */}
        <aside className={cn("flex flex-col gap-4 self-start")}>
          <div className={cn("rounded border p-5", isLuxe ? "border-zinc-800" : "border-zinc-200")}>
            <p className="text-xs uppercase tracking-[0.4em]" style={{ color: accent }}>3 items shipping</p>
            <ul className={cn("mt-3 divide-y", isLuxe ? "divide-zinc-800" : "divide-zinc-100")}>
              {products.slice(0, 3).map((p, i) => (
                <li key={i} className="flex items-center gap-3 py-3">
                  <div className="h-12 w-12 shrink-0 overflow-hidden rounded">
                    <img src={p.image} alt={p.name} loading="lazy" referrerPolicy="no-referrer" className="h-full w-full object-cover" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{p.name}</p>
                    <p className={cn("text-xs", isLuxe ? "text-zinc-500" : "text-zinc-500")}>Qty {i + 1}</p>
                  </div>
                  <p className="text-sm font-bold tabular-nums">{p.price}</p>
                </li>
              ))}
            </ul>
            <dl className={cn("mt-3 space-y-1.5 border-t pt-3 text-xs", isLuxe ? "border-zinc-800" : "border-zinc-200")}>
              <div className="flex justify-between"><dt className="text-zinc-500">Subtotal</dt><dd className="tabular-nums">₦108,500</dd></div>
              <div className="flex justify-between"><dt className="text-zinc-500">Shipping</dt><dd className="tabular-nums">₦1,500</dd></div>
              <div className={cn("flex justify-between border-t pt-1.5 text-base font-bold", isLuxe ? "border-zinc-800" : "border-zinc-200")}>
                <dt>Total</dt><dd className="tabular-nums">₦118,137</dd>
              </div>
            </dl>
          </div>
          <div className={cn("flex items-center gap-3 rounded border p-4", isLuxe ? "border-zinc-800" : "border-zinc-200")}>
            <Headphones className="h-5 w-5 shrink-0" style={{ color: accent }} />
            <p className="text-xs">Questions about this order? <strong>WhatsApp us</strong> — 24h reply Mon-Sat.</p>
          </div>
        </aside>
      </div>
    </div>
  )
}

// ---------- WISHLIST ----------
function WishlistGeneric({ template, products, desktop }: Ctx) {
  const { primary, accent } = template.colors
  const style = template.style
  const isLuxe = style === "luxe"
  const w = desktop ? REF_DESKTOP_W : REF_PHONE_W
  const h = desktop ? REF_DESKTOP_H : REF_PHONE_H

  return (
    <div className={cn("flex h-full flex-col", isLuxe ? "bg-zinc-950 text-zinc-100" : "bg-white text-zinc-900")} style={{ width: w, height: h }}>
      <PageHeader template={template} desktop={desktop} label="Wishlist" />
      <div className={cn(desktop ? "px-16 py-8" : "px-6 py-5")}>
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <div>
            <span className="text-xs uppercase tracking-[0.4em]" style={{ color: accent }}>Saved for later</span>
            <h1 className={cn(
              "mt-1 leading-tight",
              isLuxe ? "font-serif italic" : style === "bold" ? "font-black uppercase" : style === "minimal" ? "font-light" : "font-bold",
              desktop ? "text-5xl" : "text-3xl",
            )}>My wishlist</h1>
            <p className={cn("mt-2 text-sm", isLuxe ? "text-zinc-400" : "text-zinc-600")}>{products.length} items · sync across all your devices</p>
          </div>
          <button className={cn("inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white", style === "playful" ? "rounded-full" : "rounded-none", style === "bold" && "uppercase tracking-widest")} style={{ background: primary }}>
            <ShoppingBag className="h-4 w-4" /> Move all to bag
          </button>
        </div>
      </div>
      <div className={cn("grid flex-1 gap-5 overflow-hidden", desktop ? "grid-cols-4 px-16 pb-10" : "grid-cols-2 gap-3 px-6 pb-6")}>
        {products.slice(0, desktop ? 8 : 4).map((p, i) => {
          const inStock = i !== 2
          const onSale  = i === 1 || i === 4
          return (
            <div key={i} className="flex flex-col">
              <div className={cn("relative aspect-[4/5] overflow-hidden", style === "playful" && "rounded-2xl", isLuxe ? "" : "bg-zinc-50")}>
                <img src={p.image} alt={p.name} loading="lazy" referrerPolicy="no-referrer" className={cn("h-full w-full object-cover", isLuxe && "opacity-90")} />
                <div className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/95 shadow-sm">
                  <Heart className="h-4 w-4 fill-current" style={{ color: accent }} />
                </div>
                {onSale && (
                  <span className="absolute left-2 top-2 rounded bg-rose-500 px-2 py-0.5 text-[10px] font-black uppercase text-white">Sale</span>
                )}
                {!inStock && (
                  <span className={cn("absolute inset-x-0 bottom-0 px-3 py-1.5 text-center text-[10px] font-bold uppercase tracking-widest", isLuxe ? "bg-black/80 text-zinc-300" : "bg-white/95 text-zinc-700")}>Out of stock</span>
                )}
              </div>
              <p className={cn("mt-2 truncate", isLuxe ? "font-serif text-base italic" : "text-sm font-medium")}>{p.name}</p>
              <div className="flex items-baseline justify-between">
                <p className="text-base font-bold tabular-nums" style={{ color: isLuxe ? accent : primary }}>{p.price}</p>
                {onSale && <p className={cn("text-xs line-through", isLuxe ? "text-zinc-500" : "text-zinc-400")}>₦{Math.round(parseInt(p.price.replace(/\D/g, ""), 10) * 1.25 / 1000)}k</p>}
              </div>
              <div className="mt-2 flex gap-2">
                <button className={cn("flex-1 px-3 py-2 text-xs font-bold text-white", style === "playful" ? "rounded-full" : "rounded-none", !inStock && "opacity-50")} style={{ background: primary }}>
                  {inStock ? "Add to bag" : "Notify me"}
                </button>
                <button className={cn("flex h-9 w-9 items-center justify-center border", isLuxe ? "border-zinc-700 text-zinc-400" : "border-zinc-300 text-zinc-600")}>
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ---------- BOLD-C (Garage Pro) ----------
// Garage / auto-parts: hazard-striped pre-header + VIN lookup +
// fitment chips on every part card.
function HomeBoldC({ template, hero, products, desktop }: Ctx) {
  const { primary, accent } = template.colors
  if (!desktop) {
    return (
      <div className="flex h-full flex-col bg-zinc-50 text-zinc-900" style={{ width: REF_PHONE_W, height: REF_PHONE_H }}>
        {/* hazard stripe */}
        <div className="h-3" style={{ backgroundImage: `repeating-linear-gradient(45deg, ${accent} 0 14px, ${primary} 14px 28px)` }} />
        <header className="flex items-center justify-between bg-black px-6 pt-3 pb-3 text-white">
          <Menu className="h-5 w-5" />
          <span className="text-base font-black uppercase tracking-tight">{template.name}</span>
          <ShoppingBag className="h-5 w-5" />
        </header>
        {/* VIN lookup */}
        <div className="bg-zinc-900 px-6 py-4 text-white">
          <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: accent }}>Find parts that fit</p>
          <div className="mt-2 grid grid-cols-3 gap-1 text-[10px]">
            {[["2018","year"],["Toyota","make"],["Camry","model"]].map(([v,l]) => (
              <div key={l} className="rounded border border-zinc-700 px-2 py-1.5">
                <p className="font-bold">{v}</p>
                <p className="text-[8px] uppercase text-zinc-400">{l}</p>
              </div>
            ))}
          </div>
          <button className="mt-2 w-full py-2 text-xs font-black uppercase tracking-widest text-black" style={{ background: accent }}>Search 8,400 parts →</button>
        </div>
        {/* Hero */}
        <div className="relative aspect-[4/3] w-full">
          <img src={hero} alt="" loading="lazy" referrerPolicy="no-referrer" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
          <h1 className="absolute bottom-3 left-3 right-3 text-4xl font-black uppercase leading-[0.85] tracking-tight text-white">
            BUILT<br /><span style={{ color: accent }}>TO LAST</span>
          </h1>
        </div>
        {/* Service categories */}
        <div className="grid grid-cols-4 gap-px bg-zinc-300">
          {["Engine","Brakes","Tires","Electrical"].map((c, i) => (
            <div key={c} className="bg-white py-2.5 text-center">
              <p className="text-[11px] font-black uppercase">{c}</p>
              <p className="text-[8px] text-zinc-500">{120 + i * 47} parts</p>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-2 p-3">
          {products.slice(0, 2).map((p, i) => (
            <div key={i} className="border-2 border-black bg-white">
              <div className="aspect-square overflow-hidden">
                <img src={p.image} alt={p.name} loading="lazy" referrerPolicy="no-referrer" className="h-full w-full object-cover" />
              </div>
              <div className="px-2 py-1.5">
                <p className="truncate text-[10px] font-black uppercase">{p.name}</p>
                <p className="text-[11px] font-black tabular-nums" style={{ color: primary }}>{p.price}</p>
                <span className="mt-1 inline-block bg-zinc-900 px-1.5 py-0.5 text-[8px] font-black uppercase text-white">Fits Camry '18</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }
  return (
    <div className="flex h-full flex-col bg-zinc-50 text-zinc-900" style={{ width: REF_DESKTOP_W, height: REF_DESKTOP_H }}>
      {/* hazard stripe */}
      <div className="h-4" style={{ backgroundImage: `repeating-linear-gradient(45deg, ${accent} 0 20px, ${primary} 20px 40px)` }} />
      <header className="flex items-center justify-between bg-black px-16 py-4 text-white">
        <span className="text-2xl font-black uppercase tracking-tight">{template.name}</span>
        <nav className="flex gap-10 text-sm font-black uppercase tracking-wider text-zinc-300">
          <span>Shop</span><span>Service</span><span>Bay scheduling</span><span>Bulk · trade</span><span>Locations</span>
        </nav>
        <div className="flex items-center gap-4">
          <span className="text-xs font-bold uppercase tracking-widest" style={{ color: accent }}>0800 GARAGE</span>
          <ShoppingBag className="h-5 w-5" />
        </div>
      </header>
      {/* VIN lookup strip */}
      <div className="flex items-center gap-4 bg-zinc-900 px-16 py-4 text-white">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.3em]" style={{ color: accent }}>Find parts that fit your car</p>
          <p className="text-sm">8,400 SKUs · year + make + model lookup</p>
        </div>
        <div className="ml-auto grid grid-cols-4 gap-2">
          {[["Year","2018"],["Make","Toyota"],["Model","Camry"],["Trim","SE 2.5L"]].map(([l, v]) => (
            <div key={l} className="rounded border border-zinc-700 px-3 py-2">
              <p className="text-[10px] uppercase tracking-wider text-zinc-400">{l}</p>
              <p className="text-sm font-bold">{v}</p>
            </div>
          ))}
        </div>
        <button className="px-6 py-3 text-xs font-black uppercase tracking-widest text-black" style={{ background: accent }}>Search →</button>
      </div>
      {/* Hero */}
      <div className="relative flex-1">
        <img src={hero} alt="" loading="lazy" referrerPolicy="no-referrer" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-black/10" />
        <div className="absolute inset-0 flex items-center px-20">
          <div>
            <span className="inline-flex items-center gap-2 border-2 border-white bg-black px-3 py-1.5 text-xs font-black uppercase tracking-widest" style={{ color: accent }}>
              <span className="h-2 w-2 rounded-full" style={{ background: accent }} /> Service bay open
            </span>
            <h1 className="mt-5 text-[8rem] font-black uppercase leading-[0.85] tracking-tight text-white">
              BUILT<br /><span style={{ color: accent }}>TO LAST.</span>
            </h1>
            <p className="mt-4 max-w-md text-base font-bold text-white/90">OEM + aftermarket parts, fitment-checked. Bay scheduling at 4 Lagos branches.</p>
            <div className="mt-6 flex gap-3">
              <button className="px-7 py-3 text-sm font-black uppercase tracking-widest text-black" style={{ background: accent }}>Book a bay →</button>
              <button className="border-2 border-white px-7 py-3 text-sm font-black uppercase tracking-widest text-white">Shop catalog</button>
            </div>
          </div>
        </div>
      </div>
      {/* Service categories */}
      <div className="grid grid-cols-6 border-t-4 border-black">
        {[
          { label: "Engine",      count: 247 },
          { label: "Brakes",      count: 184 },
          { label: "Suspension",  count: 132 },
          { label: "Electrical",  count: 312 },
          { label: "Tires + rims",count: 96 },
          { label: "Body",        count: 158 },
        ].map((c, i) => (
          <div key={c.label} className={cn("border-r border-zinc-300 bg-white px-5 py-4 last:border-r-0", i === 0 && "border-l-0")}>
            <p className="text-sm font-black uppercase">{c.label}</p>
            <p className="mt-1 text-xs text-zinc-500">{c.count} SKUs</p>
          </div>
        ))}
      </div>
    </div>
  )
}

// ---------- MINIMAL-D (Studio Flow) ----------
// Single-product drop landing page — huge product photo + live
// countdown + email capture + scarcity meter. No multi-product grid.
function HomeMinimalD({ template, hero, products, desktop }: Ctx) {
  const { primary, accent } = template.colors
  if (!desktop) {
    return (
      <div className="flex h-full flex-col bg-white text-zinc-900" style={{ width: REF_PHONE_W, height: REF_PHONE_H }}>
        <header className="flex items-center justify-between px-6 pt-14 pb-3">
          <Menu className="h-5 w-5 text-zinc-700" />
          <span className="text-xs uppercase tracking-[0.5em]" style={{ color: primary }}>{template.name}</span>
          <ShoppingBag className="h-5 w-5 text-zinc-700" />
        </header>
        <div className="relative aspect-square w-full bg-zinc-50">
          <img src={products[0].image} alt="" loading="lazy" referrerPolicy="no-referrer" className="h-full w-full object-cover" />
          <span className="absolute left-3 top-3 rounded-none bg-black px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-white">Drop 04 · waitlist</span>
        </div>
        <div className="px-6 py-4">
          <span className="text-[10px] uppercase tracking-[0.4em] text-zinc-500">Launching in</span>
          <div className="mt-2 grid grid-cols-4 gap-2 text-center">
            {[["02","DAYS"],["14","HRS"],["23","MIN"],["08","SEC"]].map(([n, l]) => (
              <div key={l} className="border-b-2 pb-1.5" style={{ borderColor: primary }}>
                <p className="text-2xl font-light tabular-nums" style={{ color: primary }}>{n}</p>
                <p className="text-[8px] uppercase tracking-widest text-zinc-500">{l}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="px-6 py-1">
          <h1 className="text-2xl font-light leading-tight" style={{ color: primary }}>{products[0].name}</h1>
          <p className="mt-1 text-xs text-zinc-500">Limited to 200 pieces · numbered + signed</p>
        </div>
        <div className="px-6 py-3">
          <div className="h-1.5 w-full rounded-full bg-zinc-100">
            <div className="h-full rounded-full" style={{ width: "76%", background: accent }} />
          </div>
          <p className="mt-1 text-[10px] uppercase tracking-widest text-zinc-500">152 of 200 reserved</p>
        </div>
        <div className="px-6 py-3">
          <label className="block">
            <span className="text-[10px] uppercase tracking-[0.4em] text-zinc-500">Reserve your piece</span>
            <div className="mt-1 flex border-b" style={{ borderColor: primary }}>
              <input className="flex-1 bg-transparent py-2 text-sm outline-none" defaultValue="aisha@personal.io" readOnly />
              <button className="text-[10px] uppercase tracking-[0.4em]" style={{ color: primary }}>Notify me →</button>
            </div>
          </label>
        </div>
      </div>
    )
  }
  return (
    <div className="flex h-full flex-col bg-white text-zinc-900" style={{ width: REF_DESKTOP_W, height: REF_DESKTOP_H }}>
      <header className="flex items-center justify-between border-b border-zinc-100 px-16 py-5">
        <span className="text-sm uppercase tracking-[0.5em]" style={{ color: primary }}>{template.name}</span>
        <nav className="flex gap-10 text-xs uppercase tracking-[0.4em] text-zinc-500">
          <span>The drop</span><span>Atelier</span><span>Journal</span><span>Press</span>
        </nav>
        <span className="text-xs uppercase tracking-[0.4em] text-zinc-500">Drop 04 · waitlist</span>
      </header>
      <div className="grid flex-1 grid-cols-[55%_45%]">
        {/* Product photo */}
        <div className="relative overflow-hidden bg-zinc-50">
          <img src={products[0].image} alt="" loading="lazy" referrerPolicy="no-referrer" className="absolute inset-0 h-full w-full object-cover" />
          <span className="absolute left-6 top-6 bg-black px-3 py-1 text-xs font-bold uppercase tracking-widest text-white">Drop 04</span>
          <span className="absolute bottom-6 left-6 rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold uppercase tracking-widest" style={{ color: primary }}>Numbered · 1 of 200</span>
        </div>
        {/* Countdown + reserve */}
        <div className="flex flex-col justify-center px-16 py-10">
          <span className="text-xs uppercase tracking-[0.5em]" style={{ color: accent }}>The 04 drop · launching</span>
          <div className="mt-5 grid grid-cols-4 gap-4">
            {[["02","DAYS"],["14","HRS"],["23","MIN"],["08","SEC"]].map(([n, l]) => (
              <div key={l} className="border-b-2 pb-2" style={{ borderColor: primary }}>
                <p className="text-5xl font-light tabular-nums" style={{ color: primary }}>{n}</p>
                <p className="mt-1 text-[10px] uppercase tracking-[0.4em] text-zinc-500">{l}</p>
              </div>
            ))}
          </div>
          <h1 className="mt-8 text-5xl font-light leading-[1.05]" style={{ color: primary }}>{products[0].name}</h1>
          <p className="mt-3 text-base text-zinc-500">Limited to 200 pieces · numbered, signed, shipped in a custom case.</p>
          <p className="mt-2 text-2xl font-light tabular-nums" style={{ color: primary }}>{products[0].price}</p>
          {/* Scarcity meter */}
          <div className="mt-6">
            <div className="h-2 w-full rounded-full bg-zinc-100">
              <div className="h-full rounded-full" style={{ width: "76%", background: accent }} />
            </div>
            <p className="mt-2 text-xs uppercase tracking-widest text-zinc-500">152 of 200 reserved · waitlist open</p>
          </div>
          {/* Reserve */}
          <label className="mt-6 block">
            <span className="text-xs uppercase tracking-[0.4em] text-zinc-500">Reserve your piece</span>
            <div className="mt-2 flex border-b-2" style={{ borderColor: primary }}>
              <input className="flex-1 bg-transparent py-3 text-base outline-none" defaultValue="aisha@personal.io" readOnly />
              <button className="px-4 text-xs uppercase tracking-[0.4em]" style={{ color: primary }}>Notify me →</button>
            </div>
            <p className="mt-2 text-[11px] text-zinc-500">You'll get a private link 2 hours before public launch.</p>
          </label>
        </div>
      </div>
    </div>
  )
}

// ---------- EDITORIAL-C (Atelier) ----------
// Services salon — booking-led editorial with service cards, time
// slot picker, and "this week's appointments" sidebar.
function HomeEditorialC({ template, hero, products, desktop }: Ctx) {
  const { primary, accent } = template.colors
  const services = [
    { name: "Hair colour + treatment", duration: "2 hr 30",  price: "₦35,000" },
    { name: "Bridal makeup",            duration: "3 hr",     price: "₦85,000" },
    { name: "Full-body massage",        duration: "90 min",   price: "₦28,000" },
    { name: "Hydrating facial",         duration: "60 min",   price: "₦18,000" },
  ]
  const slots = ["10:00", "11:30", "13:00", "14:30", "16:00", "17:30"]
  if (!desktop) {
    return (
      <div className="flex h-full flex-col bg-[#fbf8f3] text-zinc-900" style={{ width: REF_PHONE_W, height: REF_PHONE_H }}>
        <header className="flex items-center justify-between border-b border-zinc-900 px-6 pt-14 pb-3">
          <Menu className="h-6 w-6" />
          <span className="font-serif text-2xl italic font-bold tracking-tight">{template.name}</span>
          <ShoppingBag className="h-6 w-6" />
        </header>
        <div className="px-6 py-4">
          <span className="font-serif text-xs uppercase tracking-[0.4em] text-zinc-600">Volume 03 · By appointment</span>
          <h1 className="mt-2 font-serif text-5xl italic leading-[0.95]">Hands<br />you trust.</h1>
        </div>
        <div className="relative aspect-[16/9] w-full">
          <img src={hero} alt="" loading="lazy" referrerPolicy="no-referrer" className="h-full w-full object-cover" />
          <span className="absolute right-3 top-3 rounded-full bg-white/95 px-3 py-1 font-serif text-[10px] italic" style={{ color: primary }}>Booked by 2,400+ in Lagos</span>
        </div>
        <div className="px-6 py-4">
          <p className="font-serif text-[10px] uppercase tracking-[0.4em] text-zinc-600">Available today</p>
          <div className="mt-2 flex gap-1.5 overflow-x-auto">
            {slots.map((t, i) => (
              <span key={t} className={cn("shrink-0 rounded-none border px-3 py-1.5 font-serif text-xs", i === 1 && "italic")} style={i === 1 ? { background: primary, color: "white", borderColor: primary } : { borderColor: "#d4d4d8" }}>{t}</span>
            ))}
          </div>
        </div>
        <ul className="flex-1 divide-y divide-zinc-200 px-6 py-2">
          {services.slice(0, 3).map((s, i) => (
            <li key={i} className="flex items-baseline justify-between py-2.5">
              <div className="min-w-0">
                <p className="truncate font-serif text-base italic">{s.name}</p>
                <p className="font-serif text-[10px] text-zinc-500">{s.duration}</p>
              </div>
              <p className="shrink-0 font-serif text-sm font-bold tabular-nums">{s.price}</p>
            </li>
          ))}
        </ul>
      </div>
    )
  }
  return (
    <div className="flex h-full flex-col bg-[#fbf8f3] text-zinc-900" style={{ width: REF_DESKTOP_W, height: REF_DESKTOP_H }}>
      <header className="flex items-center justify-between border-b-2 border-zinc-900 px-16 py-5">
        <span className="font-serif text-xs uppercase tracking-[0.4em] text-zinc-700">Volume 03 · By appointment</span>
        <span className="font-serif text-3xl italic font-bold tracking-tight">{template.name}</span>
        <div className="flex items-center gap-4 text-zinc-700"><Search className="h-5 w-5" /><User className="h-5 w-5" /></div>
      </header>
      <div className="grid flex-1 grid-cols-[55%_45%]">
        {/* Hero photo + headline overlay */}
        <div className="relative">
          <img src={hero} alt="" loading="lazy" referrerPolicy="no-referrer" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
          <div className="absolute bottom-10 left-10 right-10 text-white">
            <span className="font-serif text-sm uppercase tracking-[0.5em]" style={{ color: accent }}>The cover story</span>
            <h1 className="mt-3 font-serif text-7xl italic leading-[0.92]">Hands<br />you trust.</h1>
            <p className="mt-4 max-w-md font-serif text-base italic">Booked by 2,400+ in Lagos. Studio appointments only — no walk-ins.</p>
          </div>
        </div>
        {/* Booking panel */}
        <div className="flex flex-col px-12 py-10">
          <p className="font-serif text-xs uppercase tracking-[0.5em] text-zinc-600">Reserve a session</p>
          <h2 className="mt-3 font-serif text-3xl italic leading-tight">Pick your hour.</h2>
          {/* Date strip */}
          <div className="mt-5 flex gap-2 overflow-x-auto">
            {[
              { day: "Mon", date: "19" },
              { day: "Tue", date: "20" },
              { day: "Wed", date: "21", active: true },
              { day: "Thu", date: "22" },
              { day: "Fri", date: "23" },
              { day: "Sat", date: "24" },
              { day: "Sun", date: "25" },
            ].map((d, i) => (
              <div key={i} className={cn("shrink-0 border px-3 py-2.5 text-center", d.active ? "" : "")} style={d.active ? { background: primary, color: "white", borderColor: primary } : { borderColor: "#d4d4d8" }}>
                <p className="font-serif text-[10px] uppercase">{d.day}</p>
                <p className="font-serif text-xl italic">{d.date}</p>
              </div>
            ))}
          </div>
          {/* Time slots */}
          <p className="mt-5 font-serif text-xs uppercase tracking-[0.5em] text-zinc-600">Available · Wed 21 May</p>
          <div className="mt-2 grid grid-cols-3 gap-2">
            {slots.map((t, i) => (
              <span key={t} className={cn("border px-3 py-2.5 text-center font-serif text-base", i === 1 && "italic")} style={i === 1 ? { background: primary, color: "white", borderColor: primary } : { borderColor: "#d4d4d8" }}>{t}</span>
            ))}
          </div>
          <button className="mt-6 w-full border-2 py-3 font-serif text-sm italic" style={{ borderColor: primary, color: primary }}>Reserve · 11:30 Wed 21 →</button>
          <p className="mt-2 text-center font-serif text-[11px] italic text-zinc-500">No charge until you arrive · cancel 4 hrs ahead, free</p>
        </div>
      </div>
      {/* Service menu strip */}
      <section className="border-t-2 border-zinc-900 px-16 py-7">
        <div className="flex items-baseline justify-between">
          <h2 className="font-serif text-2xl italic">The menu</h2>
          <span className="font-serif text-xs uppercase tracking-[0.4em]" style={{ color: accent }}>Full price list →</span>
        </div>
        <div className="mt-4 grid grid-cols-4 gap-6">
          {services.map((s, i) => (
            <div key={i} className="border-t border-zinc-300 pt-3">
              <p className="font-serif text-base italic">{s.name}</p>
              <p className="mt-1 font-serif text-[10px] uppercase tracking-widest text-zinc-500">{s.duration}</p>
              <p className="mt-2 font-serif text-lg font-bold tabular-nums" style={{ color: primary }}>{s.price}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

// ---------- BOLD-D (Vendor Grid) ----------
// Dense electronics matrix — sidebar filters + 8-up product grid +
// stock chips.
function HomeBoldD({ template, hero, products, desktop }: Ctx) {
  const { primary, accent } = template.colors
  if (!desktop) {
    return (
      <div className="flex h-full flex-col bg-white text-zinc-900" style={{ width: REF_PHONE_W, height: REF_PHONE_H }}>
        <header className="flex items-center justify-between bg-black px-6 pt-14 pb-3 text-white">
          <Menu className="h-6 w-6" />
          <span className="text-base font-black uppercase tracking-tight" style={{ color: accent }}>{template.name}</span>
          <ShoppingBag className="h-6 w-6" />
        </header>
        <div className="border-b-4 border-black bg-zinc-900 px-6 py-3 text-white">
          <div className="flex items-center gap-2 rounded-none border border-zinc-700 bg-zinc-800 px-3 py-2 text-xs">
            <Search className="h-4 w-4" />
            <span className="flex-1">Search 12,400 SKUs</span>
          </div>
          <div className="mt-2 flex gap-1.5 overflow-x-auto">
            {["All","Laptops","Audio","Wearables","Storage"].map((c, i) => (
              <span key={c} className="shrink-0 border-2 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider" style={i === 0 ? { borderColor: accent, color: accent, background: "#000" } : { borderColor: "#3f3f46", color: "#a1a1aa" }}>{c}</span>
            ))}
          </div>
        </div>
        <div className="grid flex-1 grid-cols-2 gap-px overflow-hidden bg-black">
          {products.slice(0, 6).map((p, i) => (
            <div key={i} className="relative flex flex-col bg-white">
              <div className="relative aspect-square overflow-hidden">
                <img src={p.image} alt={p.name} loading="lazy" referrerPolicy="no-referrer" className="h-full w-full object-cover" />
                <span className="absolute right-1.5 top-1.5 bg-white px-1.5 py-0.5 text-[8px] font-black uppercase tracking-wider" style={{ color: primary }}>In stock</span>
              </div>
              <div className="border-t-2 border-black px-2 py-1.5">
                <p className="truncate text-[10px] font-black uppercase">{p.name}</p>
                <p className="text-xs font-black tabular-nums" style={{ color: primary }}>{p.price}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }
  return (
    <div className="flex h-full flex-col bg-white text-zinc-900" style={{ width: REF_DESKTOP_W, height: REF_DESKTOP_H }}>
      <header className="flex items-center justify-between bg-black px-16 py-4 text-white">
        <span className="text-2xl font-black uppercase tracking-tight" style={{ color: accent }}>{template.name}</span>
        <div className="flex flex-1 items-center gap-2 rounded-none border border-zinc-700 bg-zinc-800 px-4 py-2 mx-12">
          <Search className="h-4 w-4 text-zinc-400" />
          <span className="text-sm text-zinc-400">Search 12,400 SKUs by name, SKU, brand</span>
          <span className="ml-auto text-[10px] uppercase tracking-widest text-zinc-500">⌘ K</span>
        </div>
        <div className="flex items-center gap-4 text-sm font-black uppercase tracking-wider">
          <User className="h-5 w-5" /><ShoppingBag className="h-5 w-5" />
        </div>
      </header>
      <div className="grid flex-1 grid-cols-[220px_1fr]">
        {/* Filter sidebar */}
        <aside className="border-r-4 border-black bg-zinc-50 p-4">
          <p className="text-xs font-black uppercase tracking-widest">Category</p>
          <ul className="mt-2 space-y-1 text-sm">
            {["All · 12,400","Laptops · 412","Audio · 1,820","Wearables · 932","Storage · 2,140","Networking · 814","Cables · 3,200"].map((c, i) => (
              <li key={c} className={cn("px-2 py-1.5 font-black uppercase", i === 0 ? "text-white" : "text-zinc-700")} style={i === 0 ? { background: primary } : undefined}>{c}</li>
            ))}
          </ul>
          <p className="mt-5 text-xs font-black uppercase tracking-widest">Brand</p>
          <ul className="mt-2 space-y-1.5 text-xs">
            {[["Apple", 184],["Samsung", 142],["Logitech", 220],["Anker", 312]].map(([b, n]) => (
              <li key={b} className="flex items-center justify-between"><span><span className="mr-2 inline-block h-3 w-3 border-2 border-black" /> {b}</span><span className="text-zinc-500">{n}</span></li>
            ))}
          </ul>
          <p className="mt-5 text-xs font-black uppercase tracking-widest">Price</p>
          <div className="mt-2">
            <div className="relative h-1 bg-zinc-300"><div className="absolute h-full" style={{ left: "10%", width: "60%", background: accent }} /></div>
            <div className="mt-2 flex items-center justify-between text-xs"><span>₦5k</span><span>₦450k</span></div>
          </div>
          <p className="mt-5 text-xs font-black uppercase tracking-widest">Stock</p>
          <ul className="mt-2 space-y-1 text-xs">
            <li className="flex items-center justify-between"><span><span className="mr-2 inline-block h-3 w-3 border-2 border-black bg-black" /> In stock</span><span className="text-zinc-500">10,420</span></li>
            <li className="flex items-center justify-between"><span><span className="mr-2 inline-block h-3 w-3 border-2 border-black" /> Pre-order</span><span className="text-zinc-500">1,980</span></li>
          </ul>
        </aside>
        {/* Product matrix */}
        <div className="flex flex-col">
          <div className="flex items-center justify-between bg-zinc-100 px-6 py-3">
            <p className="text-sm font-black uppercase tracking-widest">All · 12,400 results</p>
            <div className="flex items-center gap-4 text-xs">
              <span className="font-black uppercase tracking-widest">Sort:</span>
              <span className="font-bold">Popular ▾</span>
              <span className="font-bold">Price ▾</span>
              <span className="font-bold">Newest ▾</span>
            </div>
          </div>
          <div className="grid flex-1 grid-cols-4 gap-px bg-black">
            {products.slice(0, 8).map((p, i) => (
              <div key={i} className="relative flex flex-col bg-white">
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img src={p.image} alt={p.name} loading="lazy" referrerPolicy="no-referrer" className="h-full w-full object-cover" />
                  {i % 3 === 0 && <span className="absolute left-2 top-2 bg-black px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-white">New</span>}
                  {i === 1 && <span className="absolute left-2 top-2 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-black" style={{ background: accent }}>-12%</span>}
                  <span className="absolute right-2 top-2 bg-white px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider" style={{ color: primary }}>In stock</span>
                  <button className="absolute bottom-2 right-2 flex h-7 w-7 items-center justify-center border-2 border-black bg-white">
                    <Heart className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div className="flex-1 border-t-2 border-black px-3 py-2.5">
                  <p className="line-clamp-1 text-xs font-black uppercase">{p.name}</p>
                  <p className="text-[9px] uppercase tracking-wider text-zinc-500">SKU EL-{4000 + i}</p>
                  <div className="mt-1.5 flex items-baseline justify-between">
                    <p className="text-base font-black tabular-nums" style={{ color: primary }}>{p.price}</p>
                    <p className="text-[9px] uppercase tracking-wider text-zinc-500">★ 4.{6 + (i % 4)}</p>
                  </div>
                </div>
                <button className="border-t-2 border-black py-2 text-[10px] font-black uppercase tracking-widest text-white" style={{ background: primary }}>Add to bag</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ---------- BOLD-E (Suya Spot) ----------
// Restaurant chain with location picker, today's combos, live order
// queue.
function HomeBoldE({ template, hero, products, desktop }: Ctx) {
  const { primary, accent } = template.colors
  const branches = [
    { name: "Lekki",   wait: "12 min", busy: "moderate" },
    { name: "Ikoyi",   wait: "8 min",  busy: "open" },
    { name: "VI",      wait: "22 min", busy: "busy" },
    { name: "Yaba",    wait: "15 min", busy: "moderate" },
    { name: "Wuse 2",  wait: "10 min", busy: "open" },
  ]
  const busyTone = (b: string) => b === "open" ? accent : b === "busy" ? "#ef4444" : "#f59e0b"

  if (!desktop) {
    return (
      <div className="flex h-full flex-col" style={{ width: REF_PHONE_W, height: REF_PHONE_H, background: primary }}>
        <header className="flex items-center justify-between px-6 pt-14 pb-3 text-white">
          <Menu className="h-6 w-6" />
          <span className="text-base font-black uppercase tracking-tight">{template.name}</span>
          <ShoppingBag className="h-6 w-6" />
        </header>
        {/* Branch picker pill */}
        <div className="mx-6 my-2 flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs">
          <MapPin className="h-3 w-3" style={{ color: primary }} />
          <div className="min-w-0 flex-1">
            <p className="truncate font-black uppercase" style={{ color: primary }}>Lekki branch · open</p>
            <p className="text-[9px] text-zinc-500">12 min wait · 30-min delivery</p>
          </div>
          <span className="text-[10px] font-black uppercase" style={{ color: accent }}>Change ▾</span>
        </div>
        {/* Hero */}
        <div className="relative aspect-[4/3] mx-6 overflow-hidden rounded-2xl" style={{ background: accent }}>
          <img src={hero} alt="" loading="lazy" referrerPolicy="no-referrer" className="absolute inset-0 h-full w-full object-cover mix-blend-multiply" />
          <div className="absolute inset-0 flex flex-col justify-end p-4 text-white">
            <h1 className="text-5xl font-black uppercase leading-[0.85] tracking-tight">MADE<br /><span style={{ color: accent, textShadow: "2px 2px 0 #000" }}>DAILY.</span></h1>
            <p className="mt-2 text-xs font-bold uppercase tracking-widest text-white/90">Smoked over open flame · since 2019</p>
          </div>
        </div>
        {/* Today's combos */}
        <div className="px-6 py-4">
          <div className="flex items-baseline justify-between">
            <p className="text-xs font-black uppercase tracking-widest text-white/80">Today's combos</p>
            <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: accent }}>See all 18 →</span>
          </div>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {products.slice(0, 2).map((p, i) => (
              <div key={i} className="overflow-hidden rounded-2xl bg-white">
                <div className="relative aspect-[4/3]">
                  <img src={p.image} alt={p.name} loading="lazy" referrerPolicy="no-referrer" className="h-full w-full object-cover" />
                  {i === 0 && <span className="absolute left-2 top-2 rounded-full px-2 py-0.5 text-[8px] font-black uppercase text-white" style={{ background: primary }}>Bestseller</span>}
                </div>
                <div className="px-2 py-1.5">
                  <p className="truncate text-[11px] font-black uppercase">{p.name}</p>
                  <div className="mt-0.5 flex items-baseline justify-between">
                    <p className="text-xs font-black tabular-nums" style={{ color: primary }}>{p.price}</p>
                    <span className="flex h-5 w-5 items-center justify-center rounded-full text-white" style={{ background: primary }}><span className="text-xs leading-none">+</span></span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }
  return (
    <div className="flex h-full flex-col" style={{ width: REF_DESKTOP_W, height: REF_DESKTOP_H, background: primary }}>
      <header className="flex items-center justify-between px-16 py-5 text-white">
        <span className="text-2xl font-black uppercase tracking-tight">{template.name}</span>
        <nav className="flex gap-10 text-sm font-black uppercase tracking-wider">
          <span>Menu</span><span>Combos</span><span>Catering</span><span>Branches</span><span>Loyalty</span>
        </nav>
        <div className="flex items-center gap-4">
          <span className="hidden text-xs uppercase tracking-widest md:inline" style={{ color: accent }}>0700 SUYA</span>
          <Search className="h-5 w-5" /><ShoppingBag className="h-5 w-5" />
        </div>
      </header>
      {/* Branch picker strip */}
      <div className="flex items-center gap-3 border-y-2 border-black bg-white px-16 py-3">
        <MapPin className="h-4 w-4" style={{ color: primary }} />
        <p className="text-xs font-black uppercase tracking-widest text-zinc-500">Order from</p>
        <div className="flex gap-2 overflow-x-auto">
          {branches.map((b, i) => (
            <div key={b.name} className={cn("flex shrink-0 items-center gap-2 rounded-full border-2 px-3 py-1.5 text-xs font-black uppercase", i === 0 ? "" : "border-zinc-300 text-zinc-700")} style={i === 0 ? { borderColor: primary, color: primary } : undefined}>
              <span className="h-2 w-2 rounded-full" style={{ background: busyTone(b.busy) }} />
              <span>{b.name}</span>
              <span className="text-[10px] font-bold normal-case text-zinc-500">{b.wait}</span>
            </div>
          ))}
        </div>
      </div>
      {/* Hero + side combos */}
      <div className="grid flex-1 grid-cols-[1.4fr_1fr] gap-6 p-8">
        <div className="relative overflow-hidden rounded-3xl" style={{ background: accent }}>
          <img src={hero} alt="" loading="lazy" referrerPolicy="no-referrer" className="absolute inset-0 h-full w-full object-cover mix-blend-multiply" />
          <div className="absolute inset-0 flex flex-col justify-end p-10 text-white">
            <span className="inline-flex w-fit items-center gap-2 rounded-full bg-black/40 px-3 py-1 text-xs font-black uppercase tracking-widest backdrop-blur-sm">
              <span className="h-2 w-2 rounded-full" style={{ background: accent }} /> Open · ordering in 30 min
            </span>
            <h1 className="mt-4 text-9xl font-black uppercase leading-[0.85] tracking-tight">MADE<br /><span style={{ color: accent, textShadow: "4px 4px 0 #000" }}>DAILY.</span></h1>
            <p className="mt-4 text-base font-bold uppercase tracking-widest text-white/90">Smoked over open flame · since 2019 · 5 branches in Lagos</p>
            <div className="mt-6 flex gap-3">
              <button className="rounded-full bg-white px-6 py-3 text-base font-black uppercase tracking-widest" style={{ color: primary }}>Order now →</button>
              <button className="rounded-full border-2 border-white px-6 py-3 text-base font-black uppercase tracking-widest text-white">View full menu</button>
            </div>
          </div>
        </div>
        {/* Side: combos panel */}
        <div className="flex flex-col gap-3">
          <div className="flex items-baseline justify-between text-white">
            <p className="text-sm font-black uppercase tracking-widest">Today's combos</p>
            <span className="text-xs font-black uppercase tracking-widest" style={{ color: accent }}>See 18 →</span>
          </div>
          <div className="grid flex-1 grid-cols-2 gap-3">
            {products.slice(0, 4).map((p, i) => (
              <div key={i} className="relative overflow-hidden rounded-2xl bg-white">
                <div className="relative aspect-[4/3]">
                  <img src={p.image} alt={p.name} loading="lazy" referrerPolicy="no-referrer" className="h-full w-full object-cover" />
                  {i === 0 && <span className="absolute left-2 top-2 rounded-full px-2 py-0.5 text-[10px] font-black uppercase text-white" style={{ background: primary }}>Bestseller</span>}
                  {i === 2 && <span className="absolute left-2 top-2 rounded-full bg-black px-2 py-0.5 text-[10px] font-black uppercase" style={{ color: accent }}>Spicy</span>}
                </div>
                <div className="px-3 py-2">
                  <p className="truncate text-sm font-black uppercase">{p.name}</p>
                  <p className="text-[10px] uppercase tracking-wider text-zinc-500">Ready in 12 min</p>
                  <div className="mt-1 flex items-baseline justify-between">
                    <p className="text-base font-black tabular-nums" style={{ color: primary }}>{p.price}</p>
                    <button className="flex h-7 w-7 items-center justify-center rounded-full text-white" style={{ background: primary }}><span className="text-base leading-none">+</span></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Loyalty stripe */}
      <div className="flex items-center justify-between bg-black px-16 py-3 text-white">
        <div className="flex items-center gap-3">
          <span className="rounded-full px-3 py-1 text-xs font-black uppercase" style={{ background: accent, color: "black" }}>Loyalty</span>
          <span className="text-sm font-bold uppercase tracking-widest">Buy 9 plates, get 1 free · 12,400 members</span>
        </div>
        <span className="text-xs font-black uppercase tracking-widest" style={{ color: accent }}>Join →</span>
      </div>
    </div>
  )
}

// ---------- MINIMAL-E (Trade Hub) ----------
// Wholesale B2B portal — MOQ matrix, credit-terms widget, bulk pricing.
function HomeMinimalE({ template, hero, products, desktop }: Ctx) {
  const { primary, accent } = template.colors
  if (!desktop) {
    return (
      <div className="flex h-full flex-col bg-white text-zinc-900" style={{ width: REF_PHONE_W, height: REF_PHONE_H }}>
        <header className="flex items-center justify-between border-b border-zinc-200 px-6 pt-14 pb-3">
          <Menu className="h-5 w-5 text-zinc-700" />
          <span className="text-xs uppercase tracking-[0.5em]" style={{ color: primary }}>{template.name}</span>
          <ShoppingBag className="h-5 w-5 text-zinc-700" />
        </header>
        <div className="bg-zinc-50 px-6 py-3">
          <p className="text-[10px] uppercase tracking-[0.4em] text-zinc-500">Signed in as · Funke Apparel</p>
          <div className="mt-2 flex items-center justify-between">
            <p className="text-sm font-light" style={{ color: primary }}>Credit: ₦480k of ₦2M</p>
            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-emerald-700">NET-30</span>
          </div>
          <div className="mt-1.5 h-1 w-full rounded-full bg-zinc-200">
            <div className="h-full rounded-full bg-emerald-500" style={{ width: "24%" }} />
          </div>
        </div>
        <div className="px-6 py-4">
          <h1 className="text-3xl font-light leading-tight" style={{ color: primary }}>Trade,<br />transparent.</h1>
          <p className="mt-2 text-xs text-zinc-500">Cases ship from Lagos within 48 hours. Discounts apply at checkout.</p>
        </div>
        {/* MOQ matrix */}
        <div className="mx-6 overflow-hidden rounded-xl border border-zinc-200">
          <div className="grid grid-cols-4 bg-zinc-50">
            {["MOQ","1-9","10-49","50+"].map((m, i) => (
              <p key={m} className={cn("border-r border-zinc-200 px-2 py-2 text-center text-[10px] font-bold uppercase tracking-widest last:border-r-0", i === 0 ? "text-zinc-500" : "text-zinc-700")}>{m}</p>
            ))}
          </div>
          <div className="grid grid-cols-4">
            {["Price","₦7,000","₦6,400","₦5,800"].map((p, i) => (
              <p key={i} className={cn("border-r border-zinc-200 border-t px-2 py-2 text-center text-xs last:border-r-0", i === 0 && "text-zinc-500")} style={i === 3 ? { color: primary, fontWeight: 700 } : undefined}>{p}</p>
            ))}
          </div>
          <div className="grid grid-cols-4">
            {["Save","—","-9%","-17%"].map((s, i) => (
              <p key={i} className={cn("border-r border-zinc-200 border-t px-2 py-1.5 text-center text-[10px] font-bold last:border-r-0", i === 0 && "text-zinc-500")} style={i > 1 ? { color: accent } : undefined}>{s}</p>
            ))}
          </div>
        </div>
        <div className="grid flex-1 grid-cols-2 gap-2 px-6 py-4">
          {products.slice(0, 2).map((p, i) => (
            <div key={i} className="border border-zinc-200 p-2">
              <div className="aspect-square overflow-hidden bg-zinc-50">
                <img src={p.image} alt={p.name} loading="lazy" referrerPolicy="no-referrer" className="h-full w-full object-cover" />
              </div>
              <p className="mt-1 truncate text-xs">{p.name}</p>
              <p className="text-xs font-bold tabular-nums" style={{ color: primary }}>{p.price}</p>
              <p className="text-[9px] uppercase tracking-wider text-zinc-500">MOQ 24 · 312 in stock</p>
            </div>
          ))}
        </div>
      </div>
    )
  }
  return (
    <div className="flex h-full flex-col bg-white text-zinc-900" style={{ width: REF_DESKTOP_W, height: REF_DESKTOP_H }}>
      {/* B2B pre-header */}
      <div className="flex items-center justify-between border-b border-zinc-200 bg-zinc-50 px-16 py-2 text-[11px] text-zinc-600">
        <span>Signed in as <strong className="font-semibold text-zinc-900">Funke Apparel</strong> · NET-30 customer · Account #B2B-2401</span>
        <div className="flex items-center gap-5">
          <span>Account manager: Aisha · 0803 555 0118</span>
          <span>Request a quote</span>
          <span>Order pad</span>
        </div>
      </div>
      <header className="flex items-center justify-between border-b border-zinc-200 px-16 py-5">
        <span className="text-sm uppercase tracking-[0.5em]" style={{ color: primary }}>{template.name}</span>
        <nav className="flex gap-10 text-xs uppercase tracking-[0.4em] text-zinc-600">
          <span>Catalog</span><span>Quotes</span><span>Past orders</span><span>Invoices</span><span>Statements</span>
        </nav>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-full border border-zinc-200 px-3 py-1.5 text-xs text-zinc-500"><Search className="h-3 w-3" /> Search 8,400 SKUs</div>
          <ShoppingBag className="h-5 w-5" />
        </div>
      </header>
      <div className="grid flex-1 grid-cols-[55%_45%]">
        {/* Left: hero + headline */}
        <div className="flex flex-col justify-center px-16 py-12">
          <span className="text-xs uppercase tracking-[0.5em]" style={{ color: accent }}>Wholesale · since 2019</span>
          <h1 className="mt-5 text-7xl font-light leading-[1.05]" style={{ color: primary }}>Trade,<br />transparent.</h1>
          <p className="mt-5 max-w-md text-base leading-relaxed text-zinc-500">Cases ship from our Apapa warehouse within 48 hours. Volume discounts apply automatically at checkout. NET-30 terms available for repeat buyers.</p>
          <div className="mt-6 flex gap-3">
            <button className="px-7 py-3 text-xs uppercase tracking-[0.4em] text-white" style={{ background: primary }}>Browse catalog →</button>
            <button className="border-b-2 pb-1 text-xs uppercase tracking-[0.4em]" style={{ borderColor: primary, color: primary }}>Request a quote</button>
          </div>
        </div>
        {/* Right: credit + MOQ matrix */}
        <div className="flex flex-col justify-center gap-5 border-l border-zinc-200 px-12 py-12">
          {/* Credit widget */}
          <div className="border border-zinc-200 p-5">
            <div className="flex items-baseline justify-between">
              <p className="text-[10px] uppercase tracking-[0.4em] text-zinc-500">Available credit · NET-30</p>
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-emerald-700">In good standing</span>
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <p className="text-3xl font-light tabular-nums" style={{ color: primary }}>₦1,520,000</p>
              <p className="text-sm text-zinc-500">of ₦2,000,000</p>
            </div>
            <div className="mt-2 h-1.5 w-full rounded-full bg-zinc-100">
              <div className="h-full rounded-full bg-emerald-500" style={{ width: "76%" }} />
            </div>
            <p className="mt-2 text-xs text-zinc-500">Next invoice due May 31 · auto-debit on file</p>
          </div>
          {/* MOQ matrix */}
          <div className="border border-zinc-200">
            <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-3">
              <p className="text-[10px] uppercase tracking-[0.4em] text-zinc-500">Volume pricing · Cotton tee · case of 24</p>
              <span className="text-[10px] uppercase tracking-widest" style={{ color: accent }}>Auto-applied</span>
            </div>
            <div className="grid grid-cols-4">
              {[
                { mo: "1-9 cases",  price: "₦7,000", save: "—" },
                { mo: "10-49 cases",price: "₦6,400", save: "-9%" },
                { mo: "50-99 cases",price: "₦6,000", save: "-14%" },
                { mo: "100+ cases", price: "₦5,800", save: "-17%" },
              ].map((m, i) => (
                <div key={m.mo} className={cn("border-r border-zinc-200 px-4 py-4 last:border-r-0", i === 3 && "bg-zinc-50")}>
                  <p className="text-[10px] uppercase tracking-widest text-zinc-500">{m.mo}</p>
                  <p className="mt-2 text-xl font-light tabular-nums" style={{ color: primary }}>{m.price}</p>
                  <p className="mt-1 text-[10px] font-bold tabular-nums" style={i > 0 ? { color: accent } : { color: "#a1a1aa" }}>{m.save}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      {/* Category strip */}
      <section className="border-t border-zinc-200 px-16 py-6">
        <div className="flex items-baseline justify-between">
          <p className="text-xs uppercase tracking-[0.5em] text-zinc-500">Bestsellers · by case</p>
          <span className="text-xs uppercase tracking-[0.4em]" style={{ color: primary }}>Full catalog →</span>
        </div>
        <div className="mt-4 grid grid-cols-4 gap-4">
          {products.slice(0, 4).map((p, i) => (
            <div key={i} className="border border-zinc-200">
              <div className="aspect-square overflow-hidden bg-zinc-50">
                <img src={p.image} alt={p.name} loading="lazy" referrerPolicy="no-referrer" className="h-full w-full object-cover" />
              </div>
              <div className="border-t border-zinc-200 px-4 py-3">
                <p className="truncate text-sm">{p.name}</p>
                <div className="mt-1 flex items-baseline justify-between">
                  <p className="text-base font-light tabular-nums" style={{ color: primary }}>{p.price}</p>
                  <p className="text-[10px] uppercase tracking-wider text-zinc-500">MOQ 24</p>
                </div>
                <p className="mt-1 text-[10px] text-zinc-500">{312 + i * 84} cases in stock · Apapa</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

// ---------- Wire up HOME_VARIANTS registry ----------
HOME_VARIANTS.luxe      = [HomeLuxe,      HomeLuxeB]
HOME_VARIANTS.editorial = [HomeEditorial, HomeEditorialB, HomeEditorialC]
HOME_VARIANTS.bold      = [HomeBold,      HomeBoldB,      HomeBoldC,    HomeBoldD,    HomeBoldE]
HOME_VARIANTS.minimal   = [HomeMinimal,   HomeMinimalB,   HomeMinimalC, HomeMinimalD, HomeMinimalE]
HOME_VARIANTS.playful   = [HomePlayful,   HomePlayfulB,   HomePlayfulC]

// ====================================================================
const PAGE_RENDERERS: Record<StorefrontStyle, Record<PageId, (ctx: Ctx) => React.ReactNode>> = {
  luxe:      { home: DispatchHome("luxe"),      shop: ShopGeneric, product: ProductGeneric, cart: CartGeneric, checkout: CheckoutGeneric, about: AboutGeneric, contact: ContactGeneric, faq: FaqGeneric, account: AccountGeneric, track: TrackGeneric, wishlist: WishlistGeneric },
  editorial: { home: DispatchHome("editorial"), shop: ShopGeneric, product: ProductGeneric, cart: CartGeneric, checkout: CheckoutGeneric, about: AboutGeneric, contact: ContactGeneric, faq: FaqGeneric, account: AccountGeneric, track: TrackGeneric, wishlist: WishlistGeneric },
  bold:      { home: DispatchHome("bold"),      shop: ShopGeneric, product: ProductGeneric, cart: CartGeneric, checkout: CheckoutGeneric, about: AboutGeneric, contact: ContactGeneric, faq: FaqGeneric, account: AccountGeneric, track: TrackGeneric, wishlist: WishlistGeneric },
  minimal:   { home: DispatchHome("minimal"),   shop: ShopGeneric, product: ProductGeneric, cart: CartGeneric, checkout: CheckoutGeneric, about: AboutGeneric, contact: ContactGeneric, faq: FaqGeneric, account: AccountGeneric, track: TrackGeneric, wishlist: WishlistGeneric },
  playful:   { home: DispatchHome("playful"),   shop: ShopGeneric, product: ProductGeneric, cart: CartGeneric, checkout: CheckoutGeneric, about: AboutGeneric, contact: ContactGeneric, faq: FaqGeneric, account: AccountGeneric, track: TrackGeneric, wishlist: WishlistGeneric },
}

// ====================================================================
// Imagery
// ====================================================================

const SECTOR_HERO: Record<string, string> = {
  fashion:     "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1600&h=900&fit=crop&crop=entropy&auto=format&q=85",
  beauty:      "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=1600&h=900&fit=crop&crop=entropy&auto=format&q=85",
  food:        "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=1600&h=900&fit=crop&crop=entropy&auto=format&q=85",
  electronics: "https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=1600&h=900&fit=crop&crop=entropy&auto=format&q=85",
  home:        "https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=1600&h=900&fit=crop&crop=entropy&auto=format&q=85",
  auto:        "https://images.unsplash.com/photo-1486496146582-9ffcd0b2b2b7?w=1600&h=900&fit=crop&crop=entropy&auto=format&q=85",
  wholesale:   "https://images.unsplash.com/photo-1553413077-190dd305871c?w=1600&h=900&fit=crop&crop=entropy&auto=format&q=85",
  services:    "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1600&h=900&fit=crop&crop=entropy&auto=format&q=85",
}

const SECTOR_PRODUCTS: Record<string, { name: string; price: string; image: string }[]> = {
  fashion: [
    { name: "Adire silk blouse",     price: "₦24,500", image: "https://images.unsplash.com/photo-1485518882345-15568b007407?w=600&h=750&fit=crop&auto=format&q=85" },
    { name: "Bridgetown co-ord",     price: "₦38,000", image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&h=750&fit=crop&auto=format&q=85" },
    { name: "Aso-oke ankle skirt",   price: "₦42,000", image: "https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?w=600&h=750&fit=crop&auto=format&q=85" },
    { name: "Heritage cardigan",     price: "₦19,500", image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&h=750&fit=crop&auto=format&q=85" },
    { name: "Sunset midi dress",     price: "₦31,000", image: "https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=600&h=750&fit=crop&auto=format&q=85" },
    { name: "Cropped jacket",        price: "₦52,000", image: "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=600&h=750&fit=crop&auto=format&q=85" },
    { name: "Linen wide pant",       price: "₦28,000", image: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=600&h=750&fit=crop&auto=format&q=85" },
    { name: "Tassel earrings",       price: "₦9,500",  image: "https://images.unsplash.com/photo-1535632787350-4e68ef0ac584?w=600&h=750&fit=crop&auto=format&q=85" },
  ],
  beauty: [
    { name: "Shea glow oil",          price: "₦8,500",  image: "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=600&h=750&fit=crop&auto=format&q=85" },
    { name: "Niacinamide serum",      price: "₦12,800", image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&h=750&fit=crop&auto=format&q=85" },
    { name: "Rosehip night cream",    price: "₦14,200", image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&h=750&fit=crop&auto=format&q=85" },
    { name: "Hibiscus toner",         price: "₦6,400",  image: "https://images.unsplash.com/photo-1612817288484-6f916006741a?w=600&h=750&fit=crop&auto=format&q=85" },
    { name: "Bakuchiol gel",          price: "₦15,000", image: "https://images.unsplash.com/photo-1583209814683-c023dd293cc6?w=600&h=750&fit=crop&auto=format&q=85" },
    { name: "Charcoal mask",          price: "₦7,200",  image: "https://images.unsplash.com/photo-1591348278863-a8fb3887e2aa?w=600&h=750&fit=crop&auto=format&q=85" },
    { name: "Vitamin C serum",        price: "₦11,500", image: "https://images.unsplash.com/photo-1570194065650-d99fb4a8e965?w=600&h=750&fit=crop&auto=format&q=85" },
    { name: "Lip mask trio",          price: "₦5,800",  image: "https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=600&h=750&fit=crop&auto=format&q=85" },
  ],
  food: [
    { name: "Jollof family pack",     price: "₦4,800",  image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&h=750&fit=crop&auto=format&q=85" },
    { name: "Grilled tilapia",        price: "₦5,200",  image: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=600&h=750&fit=crop&auto=format&q=85" },
    { name: "Suya bowl",              price: "₦4,500",  image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&h=750&fit=crop&auto=format&q=85" },
    { name: "Egusi + pounded yam",    price: "₦3,800",  image: "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=600&h=750&fit=crop&auto=format&q=85" },
    { name: "Banga + catfish",        price: "₦5,800",  image: "https://images.unsplash.com/photo-1551782450-a2132b4ba21d?w=600&h=750&fit=crop&auto=format&q=85" },
    { name: "Coconut curry",          price: "₦4,200",  image: "https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=600&h=750&fit=crop&auto=format&q=85" },
    { name: "Pepper soup",             price: "₦3,500",  image: "https://images.unsplash.com/photo-1574484284002-952d92456975?w=600&h=750&fit=crop&auto=format&q=85" },
    { name: "Chapman cocktail",        price: "₦2,200",  image: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=600&h=750&fit=crop&auto=format&q=85" },
  ],
  electronics: [
    { name: "USB-C 6-in-1 hub",       price: "₦25,000", image: "https://images.unsplash.com/photo-1625948515291-69613efd103f?w=600&h=750&fit=crop&auto=format&q=85" },
    { name: "Wireless ergo mouse",    price: "₦12,500", image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600&h=750&fit=crop&auto=format&q=85" },
    { name: "65W GaN charger",        price: "₦18,000", image: "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=600&h=750&fit=crop&auto=format&q=85" },
    { name: "65% keyboard",           price: "₦42,000", image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&h=750&fit=crop&auto=format&q=85" },
    { name: "27\" 4K monitor",        price: "₦185,000",image: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600&h=750&fit=crop&auto=format&q=85" },
    { name: "Webcam · 1080p",         price: "₦22,500", image: "https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=600&h=750&fit=crop&auto=format&q=85" },
    { name: "Bluetooth earbuds",       price: "₦28,000", image: "https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=600&h=750&fit=crop&auto=format&q=85" },
    { name: "Desk standing mat",       price: "₦15,500", image: "https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=600&h=750&fit=crop&auto=format&q=85" },
  ],
  home: [
    { name: "Stoneware set",          price: "₦18,500", image: "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=600&h=750&fit=crop&auto=format&q=85" },
    { name: "Aso-Oke throw",          price: "₦24,000", image: "https://images.unsplash.com/photo-1583845112203-29329902332e?w=600&h=750&fit=crop&auto=format&q=85" },
    { name: "Walnut desk lamp",       price: "₦42,500", image: "https://images.unsplash.com/photo-1517256064527-09c73fc73e38?w=600&h=750&fit=crop&auto=format&q=85" },
    { name: "Linen pillow",           price: "₦9,800",  image: "https://images.unsplash.com/photo-1538688525198-9b88f6f53126?w=600&h=750&fit=crop&auto=format&q=85" },
    { name: "Candle holder",          price: "₦16,200", image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&h=750&fit=crop&auto=format&q=85" },
    { name: "Rattan basket",          price: "₦11,500", image: "https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=600&h=750&fit=crop&auto=format&q=85" },
    { name: "Wool runner rug",         price: "₦68,000", image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&h=750&fit=crop&auto=format&q=85" },
    { name: "Terracotta planter",     price: "₦7,500",  image: "https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=600&h=750&fit=crop&auto=format&q=85" },
  ],
  auto: [
    { name: "Brake pads (front)",     price: "₦42,000", image: "https://images.unsplash.com/photo-1486496146582-9ffcd0b2b2b7?w=600&h=750&fit=crop&auto=format&q=85" },
    { name: "Engine oil 5L",          price: "₦18,500", image: "https://images.unsplash.com/photo-1607860108855-64acf2078ed9?w=600&h=750&fit=crop&auto=format&q=85" },
    { name: "Floor mats",             price: "₦24,000", image: "https://images.unsplash.com/photo-1583195764034-ed09cbb1a2ce?w=600&h=750&fit=crop&auto=format&q=85" },
    { name: "LED headlights",         price: "₦68,000", image: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=600&h=750&fit=crop&auto=format&q=85" },
    { name: "Cabin filter",           price: "₦8,500",  image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600&h=750&fit=crop&auto=format&q=85" },
    { name: "Dashcam 1080p",          price: "₦52,000", image: "https://images.unsplash.com/photo-1547038577-da80abbc4f19?w=600&h=750&fit=crop&auto=format&q=85" },
    { name: "Spark plug set",         price: "₦14,000", image: "https://images.unsplash.com/photo-1601362840469-51e4d8d58785?w=600&h=750&fit=crop&auto=format&q=85" },
    { name: "Wiper blade pair",       price: "₦9,200",  image: "https://images.unsplash.com/photo-1577496549804-8b1ce8e3ed91?w=600&h=750&fit=crop&auto=format&q=85" },
  ],
  wholesale: [
    { name: "Cotton tee × 24",        price: "₦168,000",image: "https://images.unsplash.com/photo-1553413077-190dd305871c?w=600&h=750&fit=crop&auto=format&q=85" },
    { name: "Body lotion × 36",       price: "₦92,400", image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=600&h=750&fit=crop&auto=format&q=85" },
    { name: "Ceramic mug × 48",       price: "₦216,000",image: "https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=600&h=750&fit=crop&auto=format&q=85" },
    { name: "Hair oil × 60",          price: "₦78,000", image: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=600&h=750&fit=crop&auto=format&q=85" },
    { name: "Tote bag × 50",          price: "₦125,000",image: "https://images.unsplash.com/photo-1586528116493-2e8f3ce3a2bf?w=600&h=750&fit=crop&auto=format&q=85" },
    { name: "Hand soap × 72",         price: "₦108,000",image: "https://images.unsplash.com/photo-1586528116022-aeda1700e5b5?w=600&h=750&fit=crop&auto=format&q=85" },
    { name: "Sneaker pack × 12",       price: "₦168,000",image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=750&fit=crop&auto=format&q=85" },
    { name: "Notebook × 40",          price: "₦52,000", image: "https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=600&h=750&fit=crop&auto=format&q=85" },
  ],
  services: [
    { name: "Hair + treatment",       price: "₦35,000", image: "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=600&h=750&fit=crop&auto=format&q=85" },
    { name: "Mani-pedi classic",      price: "₦12,000", image: "https://images.unsplash.com/photo-1559599101-f09722fb4948?w=600&h=750&fit=crop&auto=format&q=85" },
    { name: "Massage · 90 min",       price: "₦28,000", image: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600&h=750&fit=crop&auto=format&q=85" },
    { name: "Bridal makeup",          price: "₦85,000", image: "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=600&h=750&fit=crop&auto=format&q=85" },
    { name: "Facial · hydrating",     price: "₦18,000", image: "https://images.unsplash.com/photo-1542848284-8afa78a08ccb?w=600&h=750&fit=crop&auto=format&q=85" },
    { name: "Lash extensions",        price: "₦22,000", image: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&h=750&fit=crop&auto=format&q=85" },
    { name: "Brow lamination",         price: "₦16,500", image: "https://images.unsplash.com/photo-1571646034647-52e6ea84b28c?w=600&h=750&fit=crop&auto=format&q=85" },
    { name: "Spa day · full",          price: "₦65,000", image: "https://images.unsplash.com/photo-1591343395082-e120087004b4?w=600&h=750&fit=crop&auto=format&q=85" },
  ],
}

void Mail; void Star
