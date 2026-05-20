import {
  Banknote,
  Bot,
  Boxes,
  CreditCard,
  Megaphone,
  PackagePlus,
  Receipt,
  ShoppingCart,
  Sparkles,
  Store,
  Truck,
  Users,
  type LucideIcon,
} from "lucide-react"

export type StepDefinition = {
  /** Stable key — used to persist completion in kv. */
  key: string
  title: string
  description: string
  /** Route the "Go to step" button navigates to. */
  href: string
  Icon: LucideIcon
  /** Tone class for the icon tile (when not done). */
  tone: string
  /** Some steps can't be auto-detected by route visits alone
   *  (e.g. "Invite a teammate" needs server confirmation). When true,
   *  the user marks them done manually. With dummy data, every step
   *  is manual-mark for now. */
  manualMarkOnly?: boolean
}

// Two groups: organization-wide setup (only Admin / Manager roles
// would see in a real auth world), and personal hands-on exercises
// the individual user does to build muscle memory. Both groups are
// shown to every user in the dummy-data world.

export const ORG_STEPS: StepDefinition[] = [
  {
    key: "business",
    title: "Set up your business",
    description:
      "Tell Pallio your business name, address, currency, and tax registration. Powers every invoice + report.",
    href: "/settings/business",
    Icon: Store,
    tone: "bg-brand-soft text-brand dark:bg-primary/15 dark:text-primary",
    manualMarkOnly: true,
  },
  {
    key: "warehouses",
    title: "Add your locations",
    description:
      "List each store, warehouse, or pop-up. Stock + sales attribute to whichever location they belong to.",
    href: "/settings/warehouses",
    Icon: Truck,
    tone: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
    manualMarkOnly: true,
  },
  {
    key: "payments",
    title: "Connect a payment processor",
    description:
      "Wire up Stripe / PayPal / Bank Transfer so the POS can accept cards + the storefront can take orders.",
    href: "/settings/integrations/stripe",
    Icon: CreditCard,
    tone: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
    manualMarkOnly: true,
  },
  {
    key: "tax",
    title: "Configure tax rates",
    description:
      "Set the rates that apply at the register — single rate, multi-rate by location, or zero‑rated.",
    href: "/settings/taxes",
    Icon: Receipt,
    tone: "bg-sky-500/15 text-sky-700 dark:text-sky-300",
    manualMarkOnly: true,
  },
  {
    key: "users",
    title: "Invite your team",
    description:
      "Add staff, cashiers, sales reps, marketers, or affiliates. Each gets a role with the right access scopes.",
    href: "/settings/users",
    Icon: Users,
    tone: "bg-fuchsia-500/15 text-fuchsia-700 dark:text-fuchsia-300",
    manualMarkOnly: true,
  },
]

export const PERSONAL_STEPS: StepDefinition[] = [
  {
    key: "first-item",
    title: "Add your first item",
    description:
      "Create one product so you can see how categories, units, pricing, and stock fit together.",
    href: "/inventory/new",
    Icon: PackagePlus,
    tone: "bg-brand-soft text-brand dark:bg-primary/15 dark:text-primary",
    manualMarkOnly: true,
  },
  {
    key: "first-sale",
    title: "Run a practice sale at the POS",
    description:
      "Open the register, scan or tap items into the cart, take cash or card, and print the receipt.",
    href: "/pos",
    Icon: ShoppingCart,
    tone: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
    manualMarkOnly: true,
  },
  {
    key: "first-po",
    title: "Create your first purchase order",
    description:
      "Order stock from a vendor. Pallio tracks delivery, receipts, and bills against this PO from here on.",
    href: "/purchasing/pos/new",
    Icon: Boxes,
    tone: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
    manualMarkOnly: true,
  },
  {
    key: "first-campaign",
    title: "Spin up your first campaign",
    description:
      "Launch an Instagram or Facebook ad from inside Pallio. Catalog price + stock stay in sync automatically.",
    href: "/marketing",
    Icon: Megaphone,
    tone: "bg-fuchsia-500/15 text-fuchsia-700 dark:text-fuchsia-300",
    manualMarkOnly: true,
  },
  {
    key: "talk-to-ai",
    title: "Ask Pallio AI a question",
    description:
      "Try something like 'Which SKUs need reordering?' or 'How much did Mia sell last week?'.",
    href: "/ai",
    Icon: Bot,
    tone: "bg-sky-500/15 text-sky-700 dark:text-sky-300",
    manualMarkOnly: true,
  },
  {
    key: "first-withdrawal",
    title: "Set up withdrawals",
    description:
      "Tell Pallio where to send your money — a bank account, virtual account, or wallet — and on what schedule.",
    href: "/settings/payments/accounts",
    Icon: Banknote,
    tone: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
    manualMarkOnly: true,
  },
]

export const ALL_STEP_KEYS = [...ORG_STEPS, ...PERSONAL_STEPS].map((s) => s.key)

// Just a marker for the welcome icon — the milestone card uses
// a gradient brand tile.
export const WELCOME_ICON = Sparkles
