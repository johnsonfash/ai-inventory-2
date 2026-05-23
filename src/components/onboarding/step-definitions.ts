import {
  Banknote,
  Bot,
  Boxes,
  CreditCard,
  Globe,
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
    title: "Get paid by customers",
    description:
      "Connect Paystack, Flutterwave, Opay, or a bank transfer option so customers can pay you at the till and on your storefront.",
    href: "/settings/integrations",
    Icon: CreditCard,
    tone: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
    manualMarkOnly: true,
  },
  {
    key: "tax",
    title: "Set your tax rates",
    description:
      "Tell Pallio what tax to add at the till — one flat rate, different rates per location, or zero if your items are tax-exempt.",
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
    title: "Make a practice sale",
    description:
      "Open the till, drop items into the cart, take cash or card, and print the receipt — your first end-to-end run.",
    href: "/pos",
    Icon: ShoppingCart,
    tone: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
    manualMarkOnly: true,
  },
  {
    key: "first-po",
    title: "Order stock from a supplier",
    description:
      "Place an order with a supplier. Pallio then tracks the delivery, the receipt, and the bill — so you can see what arrived vs what you paid for.",
    href: "/purchasing/pos/new",
    Icon: Boxes,
    tone: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
    manualMarkOnly: true,
  },
  {
    key: "launch-storefront",
    title: "Launch your online storefront",
    description:
      "Pick from our gallery of hand-tuned templates and Pallio publishes a real shop at your-name.pallio.shop — customers can browse, buy, and track delivery.",
    href: "/storefront/templates",
    Icon: Globe,
    tone: "bg-fuchsia-500/15 text-fuchsia-700 dark:text-fuchsia-300",
    manualMarkOnly: true,
  },
  {
    key: "first-campaign",
    title: "Run your first ad",
    description:
      "Promote an item on Instagram or Facebook without leaving Pallio. Your prices and stock stay in sync automatically.",
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
    title: "Connect a bank account",
    description:
      "Add the bank, virtual account, or wallet Pallio should send your money to — and choose how often (daily, weekly, or on demand).",
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
