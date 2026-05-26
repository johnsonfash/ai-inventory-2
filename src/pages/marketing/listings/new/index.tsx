import * as React from "react"
import {
  AppWindow,
  Facebook,
  Globe,
  Image as ImageIcon,
  Instagram,
  Megaphone,
  Music2,
  Package,
  Plus,
  ShoppingBag,
  Sparkles,
  Tag,
  Video,
  Wrench,
  X,
  Youtube,
  type LucideIcon,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FormShell } from "@/components/forms/form-shell"
import { FormSection } from "@/components/forms/form-section"
import { FormGrid } from "@/components/forms/form-grid"
import { FormField } from "@/components/forms/form-field"
import { FormFooter } from "@/components/forms/form-footer"
import { SwitchField } from "@/components/forms/switch-field"
import { InputAddon } from "@/components/forms/input-addon"
import { ProductThumb } from "@/components/product-thumb"
import { useCurrency } from "@/contexts/currency"
import { loadAllCatalog } from "@/lib/pos/storage"
import { cn } from "@/lib/utils"

// Ads aren't goods-only. You can promote a catalog product, a service,
// an app, or anything custom — so the builder starts by asking WHAT
// you're advertising, then adapts the fields + the call-to-action.
type Subject = "product" | "service" | "app" | "custom"
const SUBJECTS: { key: Subject; label: string; Icon: LucideIcon; cta: string }[] = [
  { key: "product", label: "Product",  Icon: Package,   cta: "Shop now" },
  { key: "service", label: "Service",  Icon: Wrench,    cta: "Book now" },
  { key: "app",     label: "App",      Icon: AppWindow, cta: "Get the app" },
  { key: "custom",  label: "Custom",   Icon: Sparkles,  cta: "Learn more" },
]

type ChannelKey = "facebook-ads" | "instagram-ads" | "tiktok-ads" | "facebook-marketplace" | "youtube-adsense" | "website"
const CHANNELS: { key: ChannelKey; label: string; Icon: LucideIcon; tone: keyof typeof TONES; paid: boolean; desc: string }[] = [
  { key: "facebook-ads",         label: "Facebook Ads",         Icon: Facebook,    tone: "sky",     paid: true,  desc: "Catalog-driven ads across Facebook." },
  { key: "instagram-ads",        label: "Instagram Ads",        Icon: Instagram,   tone: "fuchsia", paid: true,  desc: "Reels, Stories, and Shopping ads." },
  { key: "tiktok-ads",           label: "TikTok Ads",           Icon: Music2,      tone: "violet",  paid: true,  desc: "In-feed video + Spark Ads." },
  { key: "facebook-marketplace", label: "Facebook Marketplace", Icon: ShoppingBag, tone: "emerald", paid: false, desc: "Local + national listings." },
  { key: "youtube-adsense",      label: "YouTube & AdSense",    Icon: Youtube,     tone: "rose",    paid: true,  desc: "Video ad inventory." },
  { key: "website",              label: "Website",              Icon: Globe,       tone: "emerald", paid: false, desc: "Feature on your connected storefront." },
]

const TONES = {
  violet: "bg-brand-soft text-brand dark:bg-primary/15 dark:text-primary",
  sky: "bg-sky-50 text-sky-600 dark:bg-sky-500/10 dark:text-sky-300",
  fuchsia: "bg-fuchsia-50 text-fuchsia-600 dark:bg-fuchsia-500/10 dark:text-fuchsia-300",
  rose: "bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-300",
  emerald: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300",
} as const

type Media = { url: string; name: string; kind: "image" | "video" }

export default function NewListing() {
  const { symbol, formatPrice } = useCurrency()
  const catalog = React.useMemo(() => loadAllCatalog(), [])

  const [submitting, setSubmitting] = React.useState(false)
  const [subject, setSubject] = React.useState<Subject>("product")
  const [sku, setSku] = React.useState(catalog[0]?.sku ?? "")
  const [title, setTitle] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [price, setPrice] = React.useState<string>("")
  const [destUrl, setDestUrl] = React.useState("")
  const [media, setMedia] = React.useState<Media[]>([])
  const [channels, setChannels] = React.useState<Record<ChannelKey, boolean>>({
    "facebook-ads": true, "instagram-ads": true, "tiktok-ads": false,
    "facebook-marketplace": false, "youtube-adsense": false, website: true,
  })

  const subjectDef = SUBJECTS.find((s) => s.key === subject)!
  const enabledChannels = CHANNELS.filter((c) => channels[c.key])
  const hasPaid = enabledChannels.some((c) => c.paid)

  // Cleanup object URLs on unmount.
  React.useEffect(() => () => { media.forEach((m) => URL.revokeObjectURL(m.url)) }, [media])

  // Picking a catalog item pre-fills the title + price (still editable).
  const pickItem = (nextSku: string) => {
    setSku(nextSku)
    const item = catalog.find((c) => c.sku === nextSku)
    if (item) {
      setTitle(item.name)
      setPrice(String(item.price ?? ""))
    }
  }

  const addFiles = (files: FileList | null, kind: Media["kind"]) => {
    if (!files) return
    const next: Media[] = Array.from(files).map((f) => ({ url: URL.createObjectURL(f), name: f.name, kind }))
    setMedia((prev) => (kind === "video" ? [...prev.filter((m) => m.kind !== "video"), ...next.slice(0, 1)] : [...prev, ...next]))
  }
  const removeMedia = (url: string) => {
    setMedia((prev) => prev.filter((m) => m.url !== url))
    URL.revokeObjectURL(url)
  }

  const productItem = subject === "product" ? catalog.find((c) => c.sku === sku) : undefined
  const previewTitle = title || (productItem?.name ?? "Your headline goes here")
  const previewImage = media.find((m) => m.kind === "image")?.url ?? productItem?.image
  const priceNum = Number(price)
  const enabledCount = enabledChannels.length

  return (
    <FormShell
      title="New ad / listing"
      description="Promote a product, service, app, or anything else — across every channel at once."
      titleTooltip={
        <>
          Build one ad and publish it to every connected channel
          (Facebook, Instagram, TikTok, Marketplace, YouTube, your
          storefront). Start by choosing what you're promoting — a
          catalog product pulls its photo + price automatically; a
          service, app, or custom subject takes a destination link.
        </>
      }
      backHref="/marketing"
      onSubmit={() => { setSubmitting(true); setTimeout(() => setSubmitting(false), 600) }}
      aside={<PreviewAside subjectCta={subjectDef.cta} title={previewTitle} image={previewImage} priceLabel={price && !Number.isNaN(priceNum) ? formatPrice(priceNum) : undefined} channels={enabledChannels.map((c) => c.label)} hasVideo={media.some((m) => m.kind === "video")} />}
      footer={
        <FormFooter
          submitLabel={`Publish to ${enabledCount} ${enabledCount === 1 ? "channel" : "channels"}`}
          submitting={submitting}
          submitDisabled={enabledCount === 0 || !previewTitle.trim()}
          cancelHref="/marketing"
        />
      }
    >
      {/* What are you promoting */}
      <FormSection title="What are you promoting?" description="This shapes the fields and the call-to-action" Icon={Megaphone}>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {SUBJECTS.map((s) => (
            <button
              key={s.key}
              type="button"
              onClick={() => setSubject(s.key)}
              className={cn(
                "flex flex-col items-center gap-1.5 rounded-xl border p-3 text-center transition-colors",
                subject === s.key ? "border-brand bg-brand-soft text-brand dark:border-primary dark:bg-primary/15 dark:text-primary" : "border-border bg-background text-muted-foreground hover:border-brand/40",
              )}
            >
              <s.Icon className="h-5 w-5" />
              <span className="text-xs font-semibold">{s.label}</span>
            </button>
          ))}
        </div>
      </FormSection>

      {/* Subject details */}
      <FormSection title="Details" description={subject === "product" ? "Pull from your catalogue, or edit anything" : "What you're advertising"} Icon={Tag}>
        <FormGrid cols={2}>
          {subject === "product" && (
            <FormField label="Catalogue item" required span={2} hint="Pulls the photo, name, and price from your inventory.">
              <Select value={sku} onValueChange={pickItem}>
                <SelectTrigger><SelectValue placeholder="Choose a product" /></SelectTrigger>
                <SelectContent>
                  {catalog.map((c) => (
                    <SelectItem key={c.sku} value={c.sku}>{c.name} ({c.sku})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
          )}
          <FormField label="Headline" required span={2} hint="Max ~120 characters; channels trim as needed.">
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={subject === "app" ? "The fastest way to…" : "A short, punchy headline"} required />
          </FormField>
          <FormField label="Description" required span={2}>
            <Textarea rows={4} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Tell people why they should care. Keep it concrete." />
          </FormField>
          <FormField label={subject === "product" ? "Listing price" : "Price (optional)"} hint={subject === "product" ? "Override the catalogue price for this ad." : "Leave blank for non-priced offers."}>
            <InputAddon leading={symbol}>
              <input type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0.00" />
            </InputAddon>
          </FormField>
          {subject !== "product" && (
            <FormField label="Destination link" required hint="Where the ad sends people (app store, booking page, site).">
              <Input type="url" value={destUrl} onChange={(e) => setDestUrl(e.target.value)} placeholder="https://…" />
            </FormField>
          )}
        </FormGrid>
      </FormSection>

      {/* Media */}
      <FormSection title="Media" description="Images and an optional video — mobile-first formats win" Icon={ImageIcon}>
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap gap-2">
            {media.map((m) => (
              <div key={m.url} className="relative h-20 w-20 overflow-hidden rounded-xl border border-border bg-muted">
                {m.kind === "image" ? (
                  <img src={m.url} alt={m.name} className="h-full w-full object-cover" />
                ) : (
                  <span className="flex h-full w-full flex-col items-center justify-center gap-1 text-muted-foreground"><Video className="h-5 w-5" /><span className="text-[9px]">video</span></span>
                )}
                <button type="button" onClick={() => removeMedia(m.url)} aria-label="Remove" className="absolute right-0.5 top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white">
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
            <label className="flex h-20 w-20 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-border bg-background text-muted-foreground transition-colors hover:border-brand/40">
              <Plus className="h-5 w-5" />
              <span className="text-[10px]">Image</span>
              <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => addFiles(e.target.files, "image")} />
            </label>
            <label className="flex h-20 w-20 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-border bg-background text-muted-foreground transition-colors hover:border-brand/40">
              <Video className="h-5 w-5" />
              <span className="text-[10px]">Video</span>
              <input type="file" accept="video/*" className="hidden" onChange={(e) => addFiles(e.target.files, "video")} />
            </label>
          </div>
          <p className="text-[11px] text-muted-foreground">
            Square (1080×1080) images and vertical (9:16) video perform best across Reels, TikTok and Stories. No video yet? Generate one with AI from the Marketing page.
          </p>
        </div>
      </FormSection>

      {/* Channels */}
      <FormSection title="Channels" description="Where this ad will run" Icon={Megaphone}>
        <div className="flex flex-col gap-2">
          {CHANNELS.map((c) => (
            <ChannelToggle key={c.key} Icon={c.Icon} label={c.label} description={c.desc} tone={c.tone}
              checked={channels[c.key]} onChange={(v) => setChannels((prev) => ({ ...prev, [c.key]: v }))} />
          ))}
        </div>
      </FormSection>

      {/* Budget — only when a paid ad channel is selected */}
      {hasPaid && (
        <FormSection title="Budget & targeting" description="Applies to the paid ad channels above" Icon={Megaphone}>
          <FormGrid cols={3}>
            <FormField label="Daily budget">
              <InputAddon leading={symbol}><input type="number" step="0.01" defaultValue={20} /></InputAddon>
            </FormField>
            <FormField label="Bidding">
              <Select defaultValue="auto">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto">Auto-bid</SelectItem>
                  <SelectItem value="lowest">Lowest CPM</SelectItem>
                  <SelectItem value="target-roas">Target ROAS</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
            <FormField label="Audience">
              <Select defaultValue={subject === "product" ? "lookalike" : "broad"}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="lookalike">Lookalike of buyers</SelectItem>
                  <SelectItem value="custom">Custom audience</SelectItem>
                  <SelectItem value="retargeting">Retargeting</SelectItem>
                  <SelectItem value="broad">Broad</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
            <FormField span={3}>
              <SwitchField label="Auto-pause on low ROAS" description="Pause on any channel where ROAS drops below 1.0× for 24h." defaultChecked />
            </FormField>
          </FormGrid>
        </FormSection>
      )}
    </FormShell>
  )
}

// Live preview — a social-post mock that updates as you build, so you
// see the ad the way a shopper will before publishing.
function PreviewAside({ subjectCta, title, image, priceLabel, channels, hasVideo }: {
  subjectCta: string
  title: string
  image?: string
  priceLabel?: string
  channels: string[]
  hasVideo: boolean
}) {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Live preview</p>
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className="flex items-center gap-2 px-3 py-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-brand to-fuchsia-500 text-[10px] font-bold text-white">P</span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold">Your business</p>
            <p className="text-[10px] text-muted-foreground">Sponsored</p>
          </div>
        </div>
        <div className="relative aspect-square w-full bg-muted">
          {image ? (
            <img src={image} alt="" className="h-full w-full object-cover" />
          ) : (
            <ProductThumb name={title} className="h-full w-full rounded-none" textClassName="text-3xl" />
          )}
          {hasVideo && (
            <span className="absolute bottom-2 right-2 inline-flex items-center gap-1 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-semibold text-white"><Video className="h-3 w-3" /> video</span>
          )}
        </div>
        <div className="flex items-center justify-between gap-2 px-3 py-2.5">
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold">{title}</p>
            {priceLabel && <p className="text-[11px] text-muted-foreground">{priceLabel}</p>}
          </div>
          <span className="shrink-0 rounded-lg bg-brand px-2.5 py-1 text-[11px] font-semibold text-brand-foreground dark:bg-primary dark:text-primary-foreground">{subjectCta}</span>
        </div>
      </div>
      {channels.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {channels.map((c) => (
            <span key={c} className="rounded-full border border-border bg-background px-2 py-0.5 text-[10px] font-medium text-muted-foreground">{c}</span>
          ))}
        </div>
      )}
    </div>
  )
}

function ChannelToggle({ Icon, label, description, tone, checked, onChange }: {
  Icon: LucideIcon
  label: string
  description: string
  tone: keyof typeof TONES
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-border bg-background p-3 transition-colors hover:border-brand/40">
      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${TONES[tone]}`}>
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold">{label}</p>
        <p className="mt-0.5 text-[11px] text-muted-foreground">{description}</p>
      </div>
      <span className="inline-flex items-center">
        <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="peer sr-only" />
        <span className="relative h-5 w-9 rounded-full bg-muted transition-colors peer-checked:bg-brand peer-checked:dark:bg-primary">
          <span className="absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-background transition-transform peer-checked:translate-x-4" />
        </span>
      </span>
    </label>
  )
}
