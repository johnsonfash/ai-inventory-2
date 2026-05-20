import * as React from "react"
import { Facebook, Globe, Image as ImageIcon, Instagram, Megaphone, ShoppingBag, Tag, Youtube } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FormShell } from "@/components/forms/form-shell"
import { FormSection } from "@/components/forms/form-section"
import { FormGrid } from "@/components/forms/form-grid"
import { FormField } from "@/components/forms/form-field"
import { FormFooter } from "@/components/forms/form-footer"
import { FormAside } from "@/components/forms/form-aside"
import { SwitchField } from "@/components/forms/switch-field"
import { InputAddon } from "@/components/forms/input-addon"

type Channel = "facebook-ads" | "instagram-ads" | "facebook-marketplace" | "youtube-adsense" | "website"

export default function NewListing() {
  const [submitting, setSubmitting] = React.useState(false)
  const [channels, setChannels] = React.useState<Record<Channel, boolean>>({
    "facebook-ads": true,
    "instagram-ads": true,
    "facebook-marketplace": false,
    "youtube-adsense": false,
    website: true,
  })
  const enabledCount = Object.values(channels).filter(Boolean).length

  return (
    <FormShell
      title="New cross-channel listing"
      description="Publish one product to multiple marketing channels at once."
      backHref="/marketing"
      onSubmit={() => {
        setSubmitting(true)
        setTimeout(() => setSubmitting(false), 600)
      }}
      aside={
        <FormAside
          tips={[
            { title: "Catalog sync", body: "Listings pull stock and price live from your Pallio inventory.", Icon: Tag },
            { title: "Channel rules", body: "Each channel has its own length, image, and category limits — Pallio adapts the listing.", Icon: Megaphone },
            { title: "Images", body: "Square 1080×1080 PNG/JPG performs best across all channels.", Icon: ImageIcon },
          ]}
        />
      }
      footer={
        <FormFooter
          submitLabel={`Publish to ${enabledCount} ${enabledCount === 1 ? "channel" : "channels"}`}
          submitting={submitting}
          submitDisabled={enabledCount === 0}
          cancelHref="/marketing"
        />
      }
    >
      <FormSection title="Product" description="What you're listing" Icon={Tag}>
        <FormGrid cols={2}>
          <FormField label="Source item" required hint="Pull price, stock, and images from inventory.">
            <Select defaultValue="EL-2109">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="EL-2109">USB‑C Hub 6‑in‑1 (EL-2109)</SelectItem>
                <SelectItem value="AP-4012">Cotton Tee — Black (AP-4012)</SelectItem>
                <SelectItem value="HM-2205">Ceramic Mug 12oz (HM-2205)</SelectItem>
                <SelectItem value="BT-9091">Hydrating Serum (BT-9091)</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
          <FormField label="Listing price" required hint="Override the catalog price for this listing only.">
            <InputAddon leading="$">
              <input type="number" step="0.01" defaultValue={39.99} required />
            </InputAddon>
          </FormField>
          <FormField label="Title" required span={2} hint="Max 120 characters across channels.">
            <Input defaultValue="USB‑C Hub 6‑in‑1 — 4K HDMI · 100W PD · SD/microSD" required />
          </FormField>
          <FormField label="Description" required span={2}>
            <Textarea rows={5} defaultValue="The everything-port adapter. 6 ports in one, including 100W passthrough and a 4K@60 HDMI output. Pocket-sized aluminium chassis." />
          </FormField>
          <FormField label="Hero image" span={2}>
            <Input type="file" accept="image/*" />
          </FormField>
        </FormGrid>
      </FormSection>

      <FormSection title="Channels" description="Where this listing will appear" Icon={Megaphone}>
        <div className="flex flex-col gap-2">
          <ChannelToggle
            Icon={Facebook}
            label="Facebook Ads"
            description="Catalog-driven product ads across Facebook placements."
            tone="sky"
            checked={channels["facebook-ads"]}
            onChange={(v) => setChannels((c) => ({ ...c, "facebook-ads": v }))}
          />
          <ChannelToggle
            Icon={Instagram}
            label="Instagram Ads"
            description="Reels, Stories, and Shopping ads."
            tone="fuchsia"
            checked={channels["instagram-ads"]}
            onChange={(v) => setChannels((c) => ({ ...c, "instagram-ads": v }))}
          />
          <ChannelToggle
            Icon={ShoppingBag}
            label="Facebook Marketplace"
            description="Local + national Marketplace listings."
            tone="violet"
            checked={channels["facebook-marketplace"]}
            onChange={(v) => setChannels((c) => ({ ...c, "facebook-marketplace": v }))}
          />
          <ChannelToggle
            Icon={Youtube}
            label="YouTube & AdSense"
            description="Affiliate placements + video ad inventory."
            tone="rose"
            checked={channels["youtube-adsense"]}
            onChange={(v) => setChannels((c) => ({ ...c, "youtube-adsense": v }))}
          />
          <ChannelToggle
            Icon={Globe}
            label="Website"
            description="Feature on your connected storefront."
            tone="emerald"
            checked={channels.website}
            onChange={(v) => setChannels((c) => ({ ...c, website: v }))}
          />
        </div>
      </FormSection>

      <FormSection title="Budget" description="Per-channel daily ad budget" Icon={Megaphone}>
        <FormGrid cols={3}>
          <FormField label="Daily budget">
            <InputAddon leading="$">
              <input type="number" step="0.01" defaultValue={20} />
            </InputAddon>
          </FormField>
          <FormField label="Bidding strategy">
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
            <Select defaultValue="lookalike">
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
            <SwitchField
              label="Auto-pause on low ROAS"
              description="Pause this listing on any channel where ROAS drops below 1.0× for 24h."
              defaultChecked
            />
          </FormField>
        </FormGrid>
      </FormSection>
    </FormShell>
  )
}

function ChannelToggle({
  Icon,
  label,
  description,
  tone,
  checked,
  onChange,
}: {
  Icon: React.ElementType
  label: string
  description: string
  tone: "sky" | "fuchsia" | "violet" | "rose" | "emerald"
  checked: boolean
  onChange: (v: boolean) => void
}) {
  const TONES = {
    violet: "bg-brand-soft text-brand dark:bg-primary/15 dark:text-primary",
    sky: "bg-sky-50 text-sky-600 dark:bg-sky-500/10 dark:text-sky-300",
    fuchsia: "bg-fuchsia-50 text-fuchsia-600 dark:bg-fuchsia-500/10 dark:text-fuchsia-300",
    rose: "bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-300",
    emerald: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300",
  } as const

  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-border bg-background p-3 transition-colors hover:border-brand/40">
      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${TONES[tone]}`}>
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold">{label}</p>
        <p className="mt-0.5 text-[11px] text-muted-foreground">{description}</p>
      </div>
      <label className="inline-flex cursor-pointer items-center">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="peer sr-only"
        />
        <span className="relative h-5 w-9 rounded-full bg-muted transition-colors peer-checked:bg-brand peer-checked:dark:bg-primary">
          <span className="absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-background transition-transform peer-checked:translate-x-4" />
        </span>
      </label>
    </label>
  )
}
