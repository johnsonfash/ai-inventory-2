import * as React from "react"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import {
  Banknote,
  Bell,
  Building2,
  CalendarDays,
  ChevronRight,
  CreditCard,
  Download,
  FileText,
  Globe,
  KeyRound,
  Languages,
  MapPin,
  Lock,
  Printer,
  Puzzle,
  ScanLine,
  ScrollText,
  Settings as SettingsIcon,
  ShieldCheck,
  Tags,
  Users,
  Wand2,
  Warehouse,
  Webhook,
  Zap,
  type LucideIcon,
} from "lucide-react"
import { PageShell } from "@/components/page-shell"
import { Input } from "@/components/ui/input"
import { useRegisterPageRefresh } from "@/hooks/use-pull-to-refresh"
import { cn } from "@/lib/utils"

type Tile = {
  href: string
  title: string
  description: string
  Icon: LucideIcon
  tone: "violet" | "emerald" | "amber" | "rose" | "sky" | "fuchsia" | "neutral"
}

const TONES = {
  violet: "bg-brand-soft text-brand dark:bg-primary/15 dark:text-primary",
  emerald: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300",
  amber: "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-300",
  rose: "bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-300",
  sky: "bg-sky-50 text-sky-600 dark:bg-sky-500/10 dark:text-sky-300",
  fuchsia: "bg-fuchsia-50 text-fuchsia-600 dark:bg-fuchsia-500/10 dark:text-fuchsia-300",
  neutral: "bg-muted text-muted-foreground",
} as const

const GROUPS: { title: string; description: string; tiles: Tile[] }[] = [
  {
    title: "Workspace",
    description: "Identity, locations, and operating defaults",
    tiles: [
      { href: "/settings/business", title: "Business details", description: "Company name, address, currency, fiscal year.", Icon: Building2, tone: "violet" },
      { href: "/settings/locations", title: "Locations", description: "Storefronts and service areas.", Icon: MapPin, tone: "emerald" },
      { href: "/settings/warehouses", title: "Warehouses", description: "Storage facilities and stock points.", Icon: Warehouse, tone: "amber" },
      { href: "/settings/preferences", title: "Preferences", description: "Display, language, date format, theme defaults.", Icon: Languages, tone: "sky" },
    ],
  },
  {
    title: "People & access",
    description: "Who can do what",
    tiles: [
      { href: "/settings/users", title: "Users", description: "Invite team members, manage active sessions.", Icon: Users, tone: "violet" },
      { href: "/settings/roles", title: "Roles & permissions", description: "Per-role access scopes and policies.", Icon: ShieldCheck, tone: "rose" },
      { href: "/settings/security", title: "Security", description: "Biometric unlock, account password, sessions.", Icon: Lock, tone: "emerald" },
    ],
  },
  {
    title: "Billing & money",
    description: "Money in, money out",
    tiles: [
      { href: "/settings/billing", title: "Billing & credits", description: "Your plan, AI-credit balance, add-ons, invoices.", Icon: Zap, tone: "violet" },
      { href: "/settings/payments", title: "Payment methods", description: "Connected processors, payout accounts.", Icon: CreditCard, tone: "emerald" },
      { href: "/settings/payments/accounts", title: "Withdrawal accounts", description: "Where revenue lands.", Icon: Banknote, tone: "amber" },
      { href: "/settings/taxes", title: "Tax rates", description: "Default rates by region or product.", Icon: Tags, tone: "rose" },
      { href: "/settings/invoice", title: "Invoice settings", description: "Numbering, defaults, footer text.", Icon: FileText, tone: "sky" },
    ],
  },
  {
    title: "Developer & data",
    description: "Build on Pallio, and take your data with you",
    tiles: [
      { href: "/settings/api", title: "API keys", description: "Programmatic access for your own scripts + services.", Icon: KeyRound, tone: "violet" },
      { href: "/settings/webhooks", title: "Webhooks", description: "Signed event callbacks to your endpoints.", Icon: Webhook, tone: "sky" },
      { href: "/settings/automations", title: "Automations", description: "When this happens, do that — handled for you.", Icon: Wand2, tone: "fuchsia" },
      { href: "/settings/export", title: "Export data", description: "Download any dataset, or everything, any time.", Icon: Download, tone: "emerald" },
      { href: "/settings/audit", title: "Audit log", description: "Who did what, and when — append-only.", Icon: ScrollText, tone: "amber" },
    ],
  },
  {
    title: "Integrations & tools",
    description: "Connect Pallio to the rest of your stack",
    tiles: [
      { href: "/settings/integrations", title: "Integrations", description: "Stripe, PayPal, Shopify, Shippo, and more.", Icon: Puzzle, tone: "violet" },
      { href: "/settings/integrations/website", title: "Website", description: "Connect your online store.", Icon: Globe, tone: "emerald" },
      { href: "/settings/integrations/calendar", title: "Calendar", description: "Sync appointments with Google or Outlook.", Icon: CalendarDays, tone: "amber" },
    ],
  },
  {
    title: "Devices & hardware",
    description: "Printers, scanners, and labels",
    tiles: [
      { href: "/settings/printers", title: "Receipt printers", description: "Default printers per register.", Icon: Printer, tone: "neutral" },
      { href: "/settings/barcodes", title: "Barcodes", description: "Label formats and printer mapping.", Icon: ScanLine, tone: "fuchsia" },
    ],
  },
  {
    title: "Alerts",
    description: "When Pallio reaches out",
    tiles: [
      { href: "/settings/notifications", title: "Notification settings", description: "Email, push, and in-app alert channels.", Icon: Bell, tone: "rose" },
      { href: "/settings/integrations/google-workspace", title: "Single sign-on", description: "Sign in with Google Workspace.", Icon: KeyRound, tone: "sky" },
    ],
  },
]

export default function SettingsIndex() {
  const [query, setQuery] = React.useState("")
  useRegisterPageRefresh(React.useCallback(async () => { await new Promise((r) => setTimeout(r, 400)) }, []))

  const filteredGroups = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return GROUPS
    return GROUPS.map((g) => ({
      ...g,
      tiles: g.tiles.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          g.title.toLowerCase().includes(q),
      ),
    })).filter((g) => g.tiles.length > 0)
  }, [query])

  const totalCount = GROUPS.reduce((s, g) => s + g.tiles.length, 0)

  return (
    <PageShell
      title="Settings"
      withToolbar={false}
      titleTooltip={
        <>
          The control room for Pallio. Business identity, currency,
          tax rates, locations, the team that can sign in, hardware
          (printers + scanners), and a row of toggles for the small
          stuff. Most of what's here is set once and forgotten.
        </>
      }
    >
      <div className="flex flex-col gap-6">
        {/* Hero */}
        <div className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-brand-soft via-card to-sky-50/50 p-5 dark:from-primary/10 dark:via-card dark:to-sky-950/15">
          <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-brand/20 blur-3xl dark:bg-primary/20" aria-hidden />
          <div className="relative flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-brand dark:text-primary">
                <SettingsIcon className="h-3.5 w-3.5" /> Settings
              </p>
              <h2 className="mt-1 text-xl font-bold tracking-tight md:text-2xl">
                {totalCount} configurable areas across {GROUPS.length} groups
              </h2>
              <p className="mt-0.5 text-sm text-muted-foreground">
                Workspace identity, people, billing, integrations, hardware, and alerts.
              </p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <SettingsIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search settings…" className="pl-9" />
        </div>

        {/* Groups */}
        {filteredGroups.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-muted/30 p-8 text-center text-sm text-muted-foreground">
            No settings match. Try a different keyword.
          </div>
        ) : (
          filteredGroups.map((g, gi) => (
            <section key={g.title} className="flex flex-col gap-3">
              <div className="flex items-end justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="text-base font-semibold tracking-tight md:text-lg">{g.title}</h3>
                  <p className="text-xs text-muted-foreground md:text-sm">{g.description}</p>
                </div>
                <span className="text-[11px] font-medium text-muted-foreground">{g.tiles.length}</span>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {g.tiles.map((t, ti) => {
                  const Icon = t.Icon
                  return (
                    <motion.div
                      key={t.href}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ type: "spring", damping: 24, stiffness: 240, delay: (gi * 6 + ti) * 0.015 }}
                    >
                      <Link
                        to={t.href}
                        className="group block rounded-2xl border border-border bg-card p-4 transition-all hover:border-brand/40 hover:shadow-sm"
                      >
                        <div className="flex items-start gap-3">
                          <span className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl", TONES[t.tone])}>
                            <Icon className="h-4 w-4" />
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-2">
                              <p className="truncate text-sm font-semibold">{t.title}</p>
                              <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                            </div>
                            <p className="mt-0.5 line-clamp-2 text-[11px] text-muted-foreground">{t.description}</p>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  )
                })}
              </div>
            </section>
          ))
        )}
      </div>
    </PageShell>
  )
}
