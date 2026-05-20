import { Link } from "react-router-dom"
import {
  Activity,
  Bell,
  Boxes,
  CheckCircle2,
  CreditCard,
  Megaphone,
  Package,
  RotateCcw,
  UserPlus,
  type LucideIcon,
} from "lucide-react"
import { InfoTooltip } from "@/components/info-tooltip"
import { formatPriceFor } from "@/contexts/currency"
import { cn } from "@/lib/utils"

type ActivityKind =
  | "sale"
  | "refund"
  | "restock"
  | "po-received"
  | "low-stock"
  | "customer"
  | "campaign"
  | "system"

type ActivityEntry = {
  id: string
  kind: ActivityKind
  /** Action sentence — "Mia closed a $86 sale to Aisha N." */
  text: string
  /** Minutes ago. Displayed as "12m" / "3h" / "Yesterday". */
  minutesAgo: number
  /** Optional route to drill in. */
  href?: string
}

// Mock activity feed. When a real backend lands, swap for
// api.get<Paginated<ActivityEntry>>('/activity'). Order matters —
// most recent first.
const ENTRIES: ActivityEntry[] = [
  { id: "a1", kind: "sale",        text: `Mia closed a ${formatPriceFor(86_000)} sale to Aisha N.`,                   minutesAgo: 2,   href: "/pos/transactions" },
  { id: "a2", kind: "low-stock",   text: "USB-C Hub crossed reorder threshold (18 left)",       minutesAgo: 14,  href: "/inventory" },
  { id: "a3", kind: "po-received", text: "PO‑1042 received in full from Cobalt (8 lines)",      minutesAgo: 38,  href: "/purchasing/pos" },
  { id: "a4", kind: "refund",      text: `Refund ${formatPriceFor(24_000)} issued on RT‑121 (defective)`,             minutesAgo: 56,  href: "/pos/returns" },
  { id: "a5", kind: "campaign",    text: "Holiday Tee Reel campaign hit 4.2× ROAS",             minutesAgo: 82,  href: "/marketing/instagram-ads" },
  { id: "a6", kind: "customer",    text: "New customer: BrightLane (Wholesale tier)",           minutesAgo: 140, href: "/sales/customers" },
  { id: "a7", kind: "restock",     text: "Adjusted +24 units on EL-1001 (manual recount)",      minutesAgo: 220, href: "/inventory/adjustments" },
  { id: "a8", kind: "system",      text: "Daily backup completed (3.4 MB)",                     minutesAgo: 540 },
]

const ICON: Record<ActivityKind, LucideIcon> = {
  sale: CreditCard,
  refund: RotateCcw,
  restock: Package,
  "po-received": CheckCircle2,
  "low-stock": Boxes,
  customer: UserPlus,
  campaign: Megaphone,
  system: Bell,
}

const TONE: Record<ActivityKind, string> = {
  sale: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  refund: "bg-rose-500/15 text-rose-700 dark:text-rose-300",
  restock: "bg-brand-soft text-brand dark:bg-primary/15 dark:text-primary",
  "po-received": "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  "low-stock": "bg-amber-500/15 text-amber-700 dark:text-amber-300",
  customer: "bg-sky-500/15 text-sky-700 dark:text-sky-300",
  campaign: "bg-fuchsia-500/15 text-fuchsia-700 dark:text-fuchsia-300",
  system: "bg-muted text-muted-foreground",
}

function rel(min: number): string {
  if (min < 1) return "now"
  if (min < 60) return `${min}m`
  const h = Math.round(min / 60)
  if (h < 24) return `${h}h`
  const d = Math.round(h / 24)
  return d === 1 ? "1d" : `${d}d`
}

// Live-style activity feed for the dashboard. Mobile gets a tight
// vertical list; desktop pairs it with the other side widgets in a
// 2-col grid (controlled by the parent).
export function ActivityFeedCard({ className }: { className?: string }) {
  return (
    <section className={cn("flex flex-col gap-3 rounded-2xl border border-border bg-card p-4", className)}>
      <header className="flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand dark:bg-primary/15 dark:text-primary">
          <Activity className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-1.5">
            <h3 className="text-sm font-semibold md:text-base">Activity</h3>
            <InfoTooltip label="Activity feed" size="xs">
              A real-time stream of everything happening across your
              business — sales, refunds, PO receipts, stock crossings,
              campaign milestones, new customers. Tap any line to drill
              into the source page.
            </InfoTooltip>
          </div>
          <p className="text-[11px] text-muted-foreground">Latest first · last {ENTRIES.length} events</p>
        </div>
      </header>

      <ul className="flex flex-col">
        {ENTRIES.map((e, idx) => {
          const Icon = ICON[e.kind]
          const Inner = (
            <div className="flex items-start gap-3 py-2">
              <span className={cn("flex h-7 w-7 shrink-0 items-center justify-center rounded-lg", TONE[e.kind])}>
                <Icon className="h-3.5 w-3.5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="line-clamp-2 text-xs leading-relaxed">{e.text}</p>
                <p className="mt-0.5 text-[10px] text-muted-foreground">{rel(e.minutesAgo)} ago</p>
              </div>
            </div>
          )
          return (
            <li
              key={e.id}
              className={cn(
                "relative pl-3 transition-colors hover:bg-accent/30",
                idx > 0 && "border-t border-border",
              )}
            >
              <span className="absolute left-0 top-0 h-full w-0.5 bg-border" aria-hidden="true" />
              {e.href ? (
                <Link to={e.href} className="-mx-2 block rounded-md px-2">
                  {Inner}
                </Link>
              ) : (
                <div className="-mx-2 px-2">{Inner}</div>
              )}
            </li>
          )
        })}
      </ul>
    </section>
  )
}
