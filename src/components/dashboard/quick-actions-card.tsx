import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import {
  CalendarPlus,
  CreditCard,
  FileText,
  PackagePlus,
  Receipt,
  Truck,
  UserPlus,
  type LucideIcon,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { loadBusinessProfile } from "@/lib/profile/business-profile"
import { cn } from "@/lib/utils"

type Action = { title: string; sub: string; href: string; Icon: LucideIcon; tone: string }

// Quick actions adapt to the business profile so the set stays the SIX
// most-common flows for THIS operator. Service-led businesses get
// "New booking" where a goods business gets "Receive stock". Everything
// is still reachable from the nav — this is just emphasis, never gating.
function buildActions(): Action[] {
  const profile = loadBusinessProfile()
  const serviceLed = profile?.industry === "services" || profile?.sells === "services"

  const newSale: Action = {
    title: "New sale", sub: "Open POS", href: "/pos",
    Icon: CreditCard, tone: "from-violet-500/20 to-violet-500/0 text-brand dark:text-primary",
  }
  const addItem: Action = {
    title: "Add item", sub: "Create SKU", href: "/inventory/new",
    Icon: PackagePlus, tone: "from-emerald-500/20 to-emerald-500/0 text-emerald-600 dark:text-emerald-300",
  }
  const newCustomer: Action = {
    title: "New customer", sub: "Add to CRM", href: "/sales/customers/new",
    Icon: UserPlus, tone: "from-amber-500/20 to-amber-500/0 text-amber-600 dark:text-amber-300",
  }
  const newInvoice: Action = {
    title: "New invoice", sub: "Bill a customer", href: "/sales/invoices/new",
    Icon: FileText, tone: "from-fuchsia-500/20 to-fuchsia-500/0 text-fuchsia-600 dark:text-fuchsia-300",
  }
  const addExpense: Action = {
    title: "Add expense", sub: "Log a cost", href: "/expenses/new",
    Icon: Receipt, tone: "from-rose-500/20 to-rose-500/0 text-rose-600 dark:text-rose-300",
  }
  const receiveStock: Action = {
    title: "Receive stock", sub: "Inbound goods", href: "/inventory/receive",
    Icon: Truck, tone: "from-sky-500/20 to-sky-500/0 text-sky-600 dark:text-sky-300",
  }
  const newBooking: Action = {
    title: "New booking", sub: "Schedule a visit", href: "/appointments",
    Icon: CalendarPlus, tone: "from-sky-500/20 to-sky-500/0 text-sky-600 dark:text-sky-300",
  }

  return [
    newSale,
    addItem,
    newCustomer,
    serviceLed ? newBooking : receiveStock,
    newInvoice,
    addExpense,
  ]
}

const grid = {
  open: { transition: { staggerChildren: 0.025, delayChildren: 0.05 } },
  closed: {},
}
const tile = {
  open: { opacity: 1, y: 0, transition: { type: "spring" as const, damping: 22, stiffness: 280 } },
  closed: { opacity: 0, y: 8 },
}

export function QuickActionsCard() {
  const actions = buildActions()
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Quick actions</CardTitle>
        <CardDescription>Jump straight into the most common flows</CardDescription>
      </CardHeader>
      <CardContent>
        <motion.ul
          variants={grid}
          initial="closed"
          animate="open"
          className="grid grid-cols-3 gap-2.5 sm:grid-cols-3 lg:grid-cols-3"
        >
          {actions.map((a) => {
            const Icon = a.Icon
            return (
              <motion.li key={a.title} variants={tile}>
                <Link
                  to={a.href}
                  className={cn(
                    "group flex h-full flex-col items-start gap-2 rounded-xl border border-border bg-card p-3 transition-all",
                    "hover:border-brand/40 hover:shadow-sm",
                  )}
                >
                  <span
                    className={cn(
                      "flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br",
                      a.tone,
                    )}
                  >
                    <Icon className="h-4 w-4" strokeWidth={2.2} />
                  </span>
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold leading-tight">{a.title}</div>
                    <div className="truncate text-[11px] text-muted-foreground">{a.sub}</div>
                  </div>
                </Link>
              </motion.li>
            )
          })}
        </motion.ul>
      </CardContent>
    </Card>
  )
}
