import * as React from "react"
import { toast } from "sonner"
import {
  Banknote,
  Bell,
  Building2,
  Calculator,
  Calendar,
  Check,
  Copy,
  CreditCard,
  Filter,
  HelpCircle,
  Mail,
  MapPin,
  Package,
  Pause,
  Play,
  Receipt,
  RefreshCcw,
  RotateCcw,
  Send,
  ShieldCheck,
  Sliders,
  Truck,
  Users,
  Zap,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SwitchField } from "@/components/forms/switch-field"
import { StatusBadge, type StatusTone } from "@/components/lists/status-badge"
import { InfoTooltip } from "@/components/info-tooltip"
import type { IntegrationConnection, IntegrationProvider } from "@/lib/integrations/types"
import { cn } from "@/lib/utils"

// Per-integration functional config block. Renders category-aware
// tabs + tiles + toggles so the detail page does more than just
// store credentials — payments configure settlement + refunds + test
// mode, delivery configures hubs + rate cards + COD, comms configures
// sender + templates, etc.
//
// Mobile-first: tabs scroll horizontally; sections stack vertically
// at every breakpoint; tap-targets are at least 32px.

type Props = {
  provider: IntegrationProvider
  connection: IntegrationConnection
}

type TabId = string

export function IntegrationConfig({ provider, connection }: Props) {
  const tabs = TABS_BY_CATEGORY[provider.category] ?? []
  const [active, setActive] = React.useState<TabId>(tabs[0]?.id ?? "")

  if (tabs.length === 0) return null

  return (
    <section className="rounded-2xl border border-border bg-card p-4">
      <div className="flex items-baseline gap-1.5">
        <h3 className="text-sm font-semibold md:text-base">Configuration</h3>
        <InfoTooltip label="Configuration" size="xs">
          Functional settings for {provider.name}. Changes here affect
          live checkouts, shipments, emails — not just stored secrets.
        </InfoTooltip>
      </div>

      {/* Tabs — horizontal scroll on mobile */}
      <div className="-mx-4 mt-3 flex gap-1.5 overflow-x-auto px-4 scrollbar-hide md:mx-0 md:px-0">
        {tabs.map((t) => {
          const Icon = t.Icon
          const isActive = active === t.id
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setActive(t.id)}
              className={cn(
                "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
                isActive
                  ? "border-transparent bg-brand text-brand-foreground dark:bg-primary dark:text-primary-foreground"
                  : "border-border bg-background text-muted-foreground hover:bg-accent hover:text-foreground",
              )}
            >
              <Icon className="h-3.5 w-3.5" /> {t.label}
            </button>
          )
        })}
      </div>

      <div className="mt-4">
        {/* Render the selected tab using a single switch — keeps the
            implementations co-located + makes it easy to add tabs
            per category without restructuring. */}
        <TabBody provider={provider} connection={connection} tabId={active} />
      </div>
    </section>
  )
}

// ------------------ Tab catalog per category ------------------
type TabDef = { id: string; label: string; Icon: React.ElementType }

const TABS_BY_CATEGORY: Record<string, TabDef[]> = {
  payments: [
    { id: "settlement", label: "Settlement",  Icon: Banknote },
    { id: "refunds",    label: "Refunds",     Icon: RefreshCcw },
    { id: "test-mode",  label: "Test mode",   Icon: Sliders },
    { id: "webhook",    label: "Webhook",     Icon: Zap },
  ],
  delivery: [
    { id: "hubs",       label: "Pickup hubs",   Icon: MapPin },
    { id: "service",    label: "Default service", Icon: Truck },
    { id: "cod",        label: "Cash on delivery", Icon: Banknote },
    { id: "ratecard",   label: "Rate card",     Icon: Calculator },
  ],
  commerce: [
    { id: "sync",       label: "Catalog sync",   Icon: RefreshCcw },
    { id: "fulfilment", label: "Fulfilment",     Icon: Package },
    { id: "webhook",    label: "Webhook",        Icon: Zap },
  ],
  comms: [
    { id: "sender",     label: "Sender",         Icon: Send },
    { id: "templates",  label: "Templates",      Icon: Mail },
    { id: "suppression",label: "Suppression",    Icon: Filter },
  ],
  marketing: [
    { id: "audience",   label: "Audience sync",  Icon: Users },
    { id: "triggers",   label: "Triggers",       Icon: Zap },
    { id: "compliance", label: "Compliance",     Icon: ShieldCheck },
  ],
  accounting: [
    { id: "mapping",    label: "Account mapping", Icon: Calculator },
    { id: "schedule",   label: "Sync schedule",   Icon: Calendar },
    { id: "tax",        label: "Tax handling",    Icon: Receipt },
  ],
  team: [
    { id: "channels",   label: "Channels",      Icon: Mail },
    { id: "events",     label: "Triggers",      Icon: Bell },
  ],
  analytics: [
    { id: "events",     label: "Event stream",   Icon: Zap },
    { id: "funnels",    label: "Funnels",        Icon: Filter },
  ],
}

// ------------------ Tab bodies ------------------
function TabBody({ provider, tabId }: { provider: IntegrationProvider; connection: IntegrationConnection; tabId: string }) {
  const category = provider.category
  if (category === "payments") return <PaymentsTab providerName={provider.name} tabId={tabId} />
  if (category === "delivery") return <DeliveryTab providerName={provider.name} tabId={tabId} />
  if (category === "commerce") return <CommerceTab providerName={provider.name} tabId={tabId} />
  if (category === "comms") return <CommsTab providerName={provider.name} tabId={tabId} />
  if (category === "marketing") return <MarketingTab providerName={provider.name} tabId={tabId} />
  if (category === "accounting") return <AccountingTab providerName={provider.name} tabId={tabId} />
  if (category === "team") return <TeamTab providerName={provider.name} tabId={tabId} />
  if (category === "analytics") return <AnalyticsTab providerName={provider.name} tabId={tabId} />
  return null
}

// ------------------ Shared helpers ------------------
function FieldRow({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5 text-xs">
      <span className="font-semibold text-foreground/80">{label}</span>
      {children}
      {hint && <span className="text-[11px] text-muted-foreground">{hint}</span>}
    </label>
  )
}

function CopyableField({ value, label }: { value: string; label: string }) {
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value)
      toast.success(`${label} copied`)
    } catch {
      toast.error("Couldn't copy")
    }
  }
  return (
    <div className="flex items-center gap-2 rounded-xl border border-border bg-background p-2.5">
      <code className="flex-1 truncate font-mono text-xs">{value}</code>
      <Button size="sm" variant="ghost" onClick={copy}><Copy className="h-3.5 w-3.5" /> Copy</Button>
    </div>
  )
}

function TestButton({ onClick, label = "Test" }: { onClick?: () => void; label?: string }) {
  const [busy, setBusy] = React.useState(false)
  const run = async () => {
    setBusy(true)
    await new Promise((r) => setTimeout(r, 700))
    setBusy(false)
    toast.success(`${label} request returned 200.`)
    onClick?.()
  }
  return (
    <Button size="sm" variant="outline" onClick={run} disabled={busy}>
      <Zap className="h-3.5 w-3.5" /> {busy ? "Testing…" : label}
    </Button>
  )
}

const STATUS_TONE: StatusTone = "success"

// ------------------ Payments ------------------
function PaymentsTab({ providerName, tabId }: { providerName: string; tabId: string }) {
  if (tabId === "settlement") {
    return (
      <div className="flex flex-col gap-3">
        <p className="text-xs text-muted-foreground">Where {providerName} sends the money you collect. Next-day to a Nigerian bank by default.</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <FieldRow label="Settlement bank" hint="Selected from your verified withdrawal accounts.">
            <Select defaultValue="gtb-1023">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="gtb-1023">GTBank · ****1023</SelectItem>
                <SelectItem value="zenith-8841">Zenith · ****8841</SelectItem>
                <SelectItem value="opay-002">Opay Wallet · 9039…</SelectItem>
              </SelectContent>
            </Select>
          </FieldRow>
          <FieldRow label="Settlement cadence" hint="Faster settlements may incur a small fee.">
            <Select defaultValue="next-day">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="next-day">Next business day (default)</SelectItem>
                <SelectItem value="same-day">Same-day (T+0, +0.5%)</SelectItem>
                <SelectItem value="weekly">Weekly batch</SelectItem>
              </SelectContent>
            </Select>
          </FieldRow>
          <FieldRow label="Hold buffer" hint="Reserve a % against potential chargebacks.">
            <Input defaultValue="2%" />
          </FieldRow>
          <FieldRow label="Currency" hint="What balance is settled to your bank.">
            <Select defaultValue="NGN">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="NGN">NGN — Naira</SelectItem>
                <SelectItem value="USD">USD — Dollar</SelectItem>
              </SelectContent>
            </Select>
          </FieldRow>
        </div>
        <div className="rounded-xl border border-dashed border-border bg-muted/30 p-3 text-xs">
          <p className="font-semibold">Next payout</p>
          <p className="mt-1 text-muted-foreground">Pallio will sweep <span className="font-mono">₦184,200</span> to GTBank ****1023 tomorrow at 16:00 WAT. Cut-off is 14:00.</p>
        </div>
      </div>
    )
  }
  if (tabId === "refunds") {
    return (
      <div className="flex flex-col gap-3">
        <SwitchField label="Allow partial refunds" description="Customer support can refund a portion of an order without voiding it." defaultChecked />
        <SwitchField label="Auto-refund on cancelled orders" description="If a sale is voided within 60 minutes of capture, refund automatically." />
        <SwitchField label="Notify the customer by email" description="Sends 'Your refund is on the way' the moment the gateway accepts the request." defaultChecked />
        <FieldRow label="Default reason on quick refunds" hint="Shown on the customer's statement.">
          <Select defaultValue="goodwill">
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="goodwill">Goodwill gesture</SelectItem>
              <SelectItem value="defective">Defective item</SelectItem>
              <SelectItem value="wrong-item">Wrong item shipped</SelectItem>
              <SelectItem value="late">Late delivery</SelectItem>
            </SelectContent>
          </Select>
        </FieldRow>
      </div>
    )
  }
  if (tabId === "test-mode") {
    return (
      <div className="flex flex-col gap-3">
        <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-3 text-xs text-amber-800 dark:text-amber-300">
          <p className="font-bold">Test mode on</p>
          <p className="mt-1">Cards are charged with the gateway's sandbox numbers. <strong>No real money moves.</strong> Switch off before you go live.</p>
        </div>
        <SwitchField label="Use test keys" description="Routes through the sandbox API endpoints." defaultChecked />
        <CopyableField value="4242 4242 4242 4242 · 12/30 · 123" label="Test card" />
        <CopyableField value="0000000000 · 12345" label="Test bank" />
      </div>
    )
  }
  if (tabId === "webhook") {
    return (
      <div className="flex flex-col gap-3">
        <p className="text-xs text-muted-foreground">{providerName} posts payment events to Pallio at this URL. Add it on the {providerName} dashboard → Webhooks.</p>
        <CopyableField value="https://api.pallio.app/hooks/payments" label="Webhook URL" />
        <FieldRow label="Events to subscribe to">
          <div className="flex flex-wrap gap-1.5">
            {["charge.success", "charge.failed", "refund.processed", "transfer.success", "dispute.opened"].map((e) => (
              <span key={e} className="inline-flex items-center gap-1 rounded-full bg-brand-soft px-2 py-0.5 font-mono text-[10px] text-brand dark:bg-primary/15 dark:text-primary">
                <Check className="h-2.5 w-2.5" /> {e}
              </span>
            ))}
          </div>
        </FieldRow>
        <TestButton label="Send test event" />
      </div>
    )
  }
  return null
}

// ------------------ Delivery ------------------
function DeliveryTab({ providerName, tabId }: { providerName: string; tabId: string }) {
  if (tabId === "hubs") {
    return (
      <div className="flex flex-col gap-3">
        <p className="text-xs text-muted-foreground">Locations the courier picks up from. Add a hub per shop or warehouse.</p>
        <ul className="space-y-2">
          {[
            { name: "Lekki Phase 1 — Flagship",    code: "LEK1", hours: "Mon–Sat · 09–19", active: true },
            { name: "Ikeja City Mall — Kiosk",      code: "IKJ1", hours: "Daily · 10–22",   active: true },
            { name: "Wuse 2 — Abuja",                code: "ABJ1", hours: "Mon–Sat · 09–18", active: false },
          ].map((h) => (
            <li key={h.code} className="flex items-center gap-3 rounded-xl border border-border bg-background p-2.5">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-soft text-brand dark:bg-primary/15 dark:text-primary">
                <Building2 className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{h.name}</p>
                <p className="truncate text-[11px] text-muted-foreground">{h.code} · {h.hours}</p>
              </div>
              <StatusBadge tone={h.active ? STATUS_TONE : "neutral"} withDot>
                {h.active ? "live" : "paused"}
              </StatusBadge>
            </li>
          ))}
        </ul>
        <Button size="sm" variant="outline"><MapPin className="h-3.5 w-3.5" /> Add pickup hub</Button>
      </div>
    )
  }
  if (tabId === "service") {
    return (
      <div className="flex flex-col gap-3">
        <FieldRow label="Default service level" hint="Used when checkout doesn't specify.">
          <Select defaultValue="standard">
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="same-day">Same-day (Lagos only)</SelectItem>
              <SelectItem value="next-day">Next-day</SelectItem>
              <SelectItem value="standard">Standard (3–5 days)</SelectItem>
              <SelectItem value="economy">Economy (5–7 days)</SelectItem>
            </SelectContent>
          </Select>
        </FieldRow>
        <FieldRow label="Default package size" hint="Used by the rate engine when an item has no dimensions.">
          <Select defaultValue="medium">
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="small">Small (envelope · ≤1kg)</SelectItem>
              <SelectItem value="medium">Medium (box · ≤5kg)</SelectItem>
              <SelectItem value="large">Large (box · ≤15kg)</SelectItem>
            </SelectContent>
          </Select>
        </FieldRow>
        <SwitchField label="Require signature on delivery" description="Recommended for orders over ₦50,000." />
        <SwitchField label="Email tracking link to the customer" defaultChecked />
      </div>
    )
  }
  if (tabId === "cod") {
    return (
      <div className="flex flex-col gap-3">
        <div className="rounded-xl border border-dashed border-border bg-muted/30 p-3 text-xs">
          <p className="font-semibold">What is Cash-on-Delivery?</p>
          <p className="mt-1 text-muted-foreground">The courier collects cash from the buyer on delivery, then remits to your bank the next business day (less a fee). Lets you sell to customers who don't have cards.</p>
        </div>
        <SwitchField label="Accept COD at checkout" description="Shoppers see a 'Pay on delivery' option." defaultChecked />
        <FieldRow label="Maximum order value" hint="Higher = more risk if the buyer refuses delivery.">
          <Input defaultValue="₦50,000" />
        </FieldRow>
        <FieldRow label="COD fee passed to customer">
          <Select defaultValue="50">
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="0">0% (you absorb it)</SelectItem>
              <SelectItem value="50">50% split</SelectItem>
              <SelectItem value="100">100% (customer pays the full fee)</SelectItem>
            </SelectContent>
          </Select>
        </FieldRow>
      </div>
    )
  }
  if (tabId === "ratecard") {
    return (
      <div className="flex flex-col gap-3">
        <p className="text-xs text-muted-foreground">Last-quoted rates from {providerName}, by destination zone. Updated every 24 hours.</p>
        <div className="overflow-hidden rounded-xl border border-border">
          <table className="w-full text-xs">
            <thead className="bg-muted/40 text-left text-[10px] uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-3 py-2 font-medium">Zone</th>
                <th className="px-3 py-2 font-medium">Same-day</th>
                <th className="px-3 py-2 font-medium">Next-day</th>
                <th className="px-3 py-2 font-medium">Standard</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {[
                ["Lagos Island",    "₦1,800", "₦1,200", "₦900"],
                ["Lagos Mainland",  "₦2,200", "₦1,500", "₦1,100"],
                ["Abuja",            "—",      "₦2,800", "₦1,800"],
                ["Port Harcourt",    "—",      "₦3,200", "₦2,000"],
                ["Other states",     "—",      "₦4,800", "₦2,800"],
              ].map(([zone, sd, nd, std]) => (
                <tr key={zone}>
                  <td className="px-3 py-2 font-semibold">{zone}</td>
                  <td className="px-3 py-2 tabular-nums">{sd}</td>
                  <td className="px-3 py-2 tabular-nums">{nd}</td>
                  <td className="px-3 py-2 tabular-nums">{std}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Button size="sm" variant="outline"><RefreshCcw className="h-3.5 w-3.5" /> Refresh rates</Button>
      </div>
    )
  }
  return null
}

// ------------------ Commerce ------------------
function CommerceTab({ providerName, tabId }: { providerName: string; tabId: string }) {
  if (tabId === "sync") {
    return (
      <div className="flex flex-col gap-3">
        <SwitchField label="Push products → " description="Pallio is the source of truth. Any catalog edit publishes here." defaultChecked />
        <SwitchField label="Pull orders ← " description={`Orders placed on ${providerName} appear in Pallio Sales → Orders within 30 seconds.`} defaultChecked />
        <SwitchField label="Sync stock levels in real time" description="Avoids over-selling when the same SKU sells on Pallio + this channel simultaneously." defaultChecked />
        <FieldRow label="Stock buffer" hint="Reserve this many units to prevent edge-case oversells across channels.">
          <Input defaultValue="2" />
        </FieldRow>
        <Button size="sm" variant="outline"><RefreshCcw className="h-3.5 w-3.5" /> Resync now</Button>
      </div>
    )
  }
  if (tabId === "fulfilment") {
    return (
      <div className="flex flex-col gap-3">
        <FieldRow label="Fulfilled by" hint="Pallio always handles your direct sales. This sets who fulfils channel orders.">
          <Select defaultValue="pallio">
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="pallio">Pallio (ship from my stock)</SelectItem>
              <SelectItem value="channel">{providerName} (their fulfilment)</SelectItem>
              <SelectItem value="dropship">Dropship from supplier</SelectItem>
            </SelectContent>
          </Select>
        </FieldRow>
        <SwitchField label="Auto-acknowledge new orders" description="Marks the order as 'received' on the channel, gives the customer a confirmation faster." defaultChecked />
      </div>
    )
  }
  if (tabId === "webhook") {
    return (
      <div className="flex flex-col gap-3">
        <p className="text-xs text-muted-foreground">{providerName} fires events to Pallio. Already wired by the OAuth handshake; copy if you need to re-enter manually.</p>
        <CopyableField value={`https://api.pallio.app/hooks/${providerName.toLowerCase()}`} label="Webhook URL" />
        <TestButton label="Send test event" />
      </div>
    )
  }
  return null
}

// ------------------ Comms ------------------
function CommsTab({ providerName, tabId }: { providerName: string; tabId: string }) {
  if (tabId === "sender") {
    return (
      <div className="flex flex-col gap-3">
        <FieldRow label="From name" hint="What customers see in their inbox.">
          <Input defaultValue="Funke Apparel" />
        </FieldRow>
        <FieldRow label="From address" hint="Must be on a verified domain.">
          <Input defaultValue="hello@funkeapparel.com" />
        </FieldRow>
        <FieldRow label="Reply-to" hint="Where replies land. Often a CS inbox.">
          <Input defaultValue="support@funkeapparel.com" />
        </FieldRow>
        <div className="rounded-xl border border-dashed border-border bg-muted/30 p-3 text-xs">
          <p className="font-semibold">Domain verification</p>
          <p className="mt-1 text-muted-foreground">funkeapparel.com — SPF, DKIM, DMARC all configured. Last checked 2h ago.</p>
        </div>
      </div>
    )
  }
  if (tabId === "templates") {
    return (
      <div className="flex flex-col gap-3">
        <p className="text-xs text-muted-foreground">Default templates used by Pallio system emails. Custom-edit any in <span className="font-mono">Communications → Templates</span>.</p>
        <ul className="space-y-2">
          {[
            "Order confirmation", "Shipping update", "Delivery confirmation",
            "Payment receipt", "Refund processed", "Abandoned cart",
          ].map((t) => (
            <li key={t} className="flex items-center justify-between rounded-xl border border-border bg-background p-2.5">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-semibold">{t}</span>
              </div>
              <StatusBadge tone="success" withDot>active</StatusBadge>
            </li>
          ))}
        </ul>
      </div>
    )
  }
  if (tabId === "suppression") {
    return (
      <div className="flex flex-col gap-3">
        <p className="text-xs text-muted-foreground">Addresses that have unsubscribed, bounced, or marked Pallio mail as spam. Pallio will never send to these again.</p>
        <ul className="divide-y divide-border rounded-xl border border-border">
          {[
            { email: "ola@example.com", reason: "Unsubscribed", at: "3d ago" },
            { email: "bounce@dead.email", reason: "Hard bounce", at: "12d ago" },
            { email: "complainer@x.com", reason: "Marked spam", at: "1mo ago" },
          ].map((r) => (
            <li key={r.email} className="flex items-center justify-between gap-2 px-3 py-2 text-xs">
              <span className="truncate font-mono">{r.email}</span>
              <span className="shrink-0 text-muted-foreground">{r.reason} · {r.at}</span>
            </li>
          ))}
        </ul>
      </div>
    )
  }
  return null
}

// ------------------ Marketing ------------------
function MarketingTab({ providerName, tabId }: { providerName: string; tabId: string }) {
  if (tabId === "audience") {
    return (
      <div className="flex flex-col gap-3">
        <SwitchField label="Auto-add new customers" description={`Synced to ${providerName} the moment they make their first purchase.`} defaultChecked />
        <SwitchField label="Tag by tier" description="Adds VIP / Regular / Wholesale tags so segmentation works out of the box." defaultChecked />
        <FieldRow label="Audience refresh" hint="How often Pallio re-syncs the full list.">
          <Select defaultValue="daily">
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="realtime">Real-time</SelectItem>
              <SelectItem value="hourly">Hourly</SelectItem>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
            </SelectContent>
          </Select>
        </FieldRow>
        <div className="rounded-xl border border-dashed border-border bg-muted/30 p-3 text-xs">
          <p className="font-semibold">In sync</p>
          <p className="mt-1 text-muted-foreground">2,418 contacts synced. Next refresh in 4 hours.</p>
        </div>
      </div>
    )
  }
  if (tabId === "triggers") {
    return (
      <div className="flex flex-col gap-3">
        <p className="text-xs text-muted-foreground">Behaviour-based emails {providerName} fires on your behalf.</p>
        {[
          { name: "Abandoned cart", when: "1 hour after exit", active: true },
          { name: "Post-purchase upsell", when: "3 days after delivery", active: true },
          { name: "Win-back lapsed", when: "60 days inactive", active: false },
          { name: "Birthday discount", when: "On customer's birthday", active: true },
        ].map((t) => (
          <SwitchField
            key={t.name}
            label={t.name}
            description={`Fires ${t.when}.`}
            defaultChecked={t.active}
          />
        ))}
      </div>
    )
  }
  if (tabId === "compliance") {
    return (
      <div className="flex flex-col gap-3">
        <SwitchField label="Require double opt-in" description="Customers must click a confirmation link before they're added to marketing lists." defaultChecked />
        <SwitchField label="Honor unsubscribes app-wide" description="One unsubscribe blocks all Pallio marketing channels, not just this one." defaultChecked />
        <FieldRow label="NDPR / GDPR base" hint="The privacy regime your customers fall under.">
          <Select defaultValue="ndpr">
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ndpr">NDPR (Nigeria)</SelectItem>
              <SelectItem value="gdpr">GDPR (Europe)</SelectItem>
              <SelectItem value="mixed">Mixed (be safe — use both)</SelectItem>
            </SelectContent>
          </Select>
        </FieldRow>
      </div>
    )
  }
  return null
}

// ------------------ Accounting ------------------
function AccountingTab({ providerName, tabId }: { providerName: string; tabId: string }) {
  if (tabId === "mapping") {
    return (
      <div className="flex flex-col gap-3">
        <p className="text-xs text-muted-foreground">Which Pallio activity maps to which {providerName} account code. Get this right once and the books reconcile themselves.</p>
        {[
          { pallio: "Sales revenue",     def: "4000 · Sales" },
          { pallio: "COGS",              def: "5000 · Cost of goods sold" },
          { pallio: "Discounts",         def: "4100 · Discounts allowed" },
          { pallio: "Refunds",           def: "4200 · Refunds" },
          { pallio: "Payment fees",       def: "6800 · Payment processing fees" },
          { pallio: "Shipping income",   def: "4300 · Shipping income" },
        ].map((r) => (
          <div key={r.pallio} className="grid grid-cols-[1fr_1.5fr] items-center gap-2 rounded-xl border border-border bg-background p-2.5">
            <span className="text-xs font-semibold">{r.pallio}</span>
            <Input defaultValue={r.def} className="font-mono text-xs" />
          </div>
        ))}
      </div>
    )
  }
  if (tabId === "schedule") {
    return (
      <div className="flex flex-col gap-3">
        <FieldRow label="Sync cadence" hint="How often Pallio pushes journals.">
          <Select defaultValue="daily">
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="realtime">Real-time (every transaction)</SelectItem>
              <SelectItem value="hourly">Hourly</SelectItem>
              <SelectItem value="daily">Daily (overnight batch)</SelectItem>
              <SelectItem value="monthly">Monthly close batch</SelectItem>
            </SelectContent>
          </Select>
        </FieldRow>
        <SwitchField label="Pause sync at month-end" description="Skip the last two days of the month so your accountant can lock figures cleanly." />
        <SwitchField label="Include cash-on-delivery in receivables" description={`Treats COD as a debtor until the courier remits. Recommended for Nigerian operators using GIG / Sendbox.`} defaultChecked />
      </div>
    )
  }
  if (tabId === "tax") {
    return (
      <div className="flex flex-col gap-3">
        <FieldRow label="VAT account">
          <Input defaultValue="2200 · VAT payable" className="font-mono text-xs" />
        </FieldRow>
        <FieldRow label="WHT account" hint="Withholding tax deducted on services.">
          <Input defaultValue="2210 · WHT payable" className="font-mono text-xs" />
        </FieldRow>
        <SwitchField label="Post tax to liability accounts in real time" description="So your balance sheet always matches what you owe FIRS." defaultChecked />
      </div>
    )
  }
  return null
}

// ------------------ Team ------------------
function TeamTab({ providerName, tabId }: { providerName: string; tabId: string }) {
  if (tabId === "channels") {
    return (
      <div className="flex flex-col gap-3">
        <p className="text-xs text-muted-foreground">{providerName} channels Pallio can post into.</p>
        <ul className="space-y-2">
          {["#ops", "#sales", "#marketing", "#alerts", "#general"].map((c) => (
            <li key={c} className="flex items-center justify-between rounded-xl border border-border bg-background p-2.5">
              <span className="font-mono text-sm font-semibold">{c}</span>
              <StatusBadge tone="success" withDot>connected</StatusBadge>
            </li>
          ))}
        </ul>
        <Button size="sm" variant="outline"><Users className="h-3.5 w-3.5" /> Add channel</Button>
      </div>
    )
  }
  if (tabId === "events") {
    return (
      <div className="flex flex-col gap-3">
        {[
          { name: "Daily sales summary",    channel: "#sales",      active: true },
          { name: "Low-stock alerts",       channel: "#ops",        active: true },
          { name: "New customer signups",   channel: "#marketing",  active: false },
          { name: "Failed payments",        channel: "#alerts",     active: true },
        ].map((t) => (
          <SwitchField
            key={t.name}
            label={t.name}
            description={`Posts to ${t.channel}.`}
            defaultChecked={t.active}
          />
        ))}
      </div>
    )
  }
  return null
}

// ------------------ Analytics ------------------
function AnalyticsTab({ providerName, tabId }: { providerName: string; tabId: string }) {
  if (tabId === "events") {
    return (
      <div className="flex flex-col gap-3">
        <p className="text-xs text-muted-foreground">Pallio fires these events to {providerName} automatically.</p>
        <ul className="space-y-1.5">
          {[
            "page_view", "product_view", "add_to_cart", "checkout_start",
            "purchase", "refund_issued", "signup", "session_start",
          ].map((e) => (
            <li key={e} className="flex items-center justify-between rounded-lg border border-border bg-background px-3 py-2">
              <code className="font-mono text-xs">{e}</code>
              <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
            </li>
          ))}
        </ul>
      </div>
    )
  }
  if (tabId === "funnels") {
    return (
      <div className="flex flex-col gap-3">
        <p className="text-xs text-muted-foreground">Pre-built conversion funnels Pallio can read from {providerName}.</p>
        <ul className="space-y-2">
          {[
            { name: "Storefront checkout", rate: "6.4%", trend: "+0.4pp" },
            { name: "Cart → purchase",     rate: "62%",   trend: "+2pp" },
            { name: "Signup → first buy",   rate: "18%",   trend: "−1pp" },
          ].map((f) => (
            <li key={f.name} className="flex items-center justify-between rounded-xl border border-border bg-background p-2.5">
              <span className="text-sm font-semibold">{f.name}</span>
              <span className="text-xs font-bold tabular-nums">{f.rate} <span className="text-emerald-600 dark:text-emerald-400">{f.trend}</span></span>
            </li>
          ))}
        </ul>
      </div>
    )
  }
  return null
}

// Keep unused-icon-imports quiet — these are reserved for the next
// pass when each tab grows extra controls (notifications, biometric
// signoff on settings, etc).
void HelpCircle; void Bell; void CreditCard; void Pause; void Play; void RotateCcw
