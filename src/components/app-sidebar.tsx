"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  BarChart3,
  Bell,
  ClipboardList,
  FileText,
  Package2,
  Settings,
  ShoppingCart,
  CreditCard,
  Wallet,
  CalendarDays,
  Puzzle,
  Bot,
  Megaphone,
  ChevronDown,
  Receipt,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

type SubItem = { title: string; url: string }
type Item = { title: string; url?: string; icon: any; sub?: SubItem[] }

const nav: Item[] = [
  { title: "Dashboard", url: "/", icon: BarChart3 },

  // POS grouped so all sub-pages are reachable
  {
    title: "Point of Sale",
    icon: CreditCard,
    sub: [
      { title: "Current Sale", url: "/pos" },
      { title: "Drafts", url: "/pos/drafts" },
      { title: "Invoices", url: "/pos/invoices" },
      { title: "Transactions", url: "/pos/transactions" },
      { title: "Returns", url: "/pos/returns" },
      { title: "Start Return", url: "/pos/returns/new" },
    ],
  },

  { title: "Appointments", url: "/appointments", icon: CalendarDays },

  {
    title: "Inventory",
    icon: Package2,
    sub: [
      { title: "Items", url: "/inventory" },
      { title: "New Item", url: "/inventory/new" },
      { title: "Categories", url: "/inventory/categories" },
      { title: "Add Category", url: "/inventory/categories/new" },
      { title: "Units", url: "/inventory/units" },
      { title: "Add Unit", url: "/inventory/units/new" },
      { title: "Brands", url: "/inventory/brands" },
      { title: "Add Brand", url: "/inventory/brands/new" },
      { title: "Warranties", url: "/inventory/warranties" },
      { title: "Add Warranty", url: "/inventory/warranties/new" },
      { title: "Price Lists", url: "/inventory/price-lists" },
      { title: "New Price List", url: "/inventory/price-lists/new" },
      { title: "Composite Items", url: "/inventory/composite" },
      { title: "New Composite", url: "/inventory/composite/new" },
      { title: "Adjustments", url: "/inventory/adjustments" },
      { title: "Transfers", url: "/inventory/transfers" },
      { title: "Label Print", url: "/inventory/labels" },
      { title: "Receive Stock", url: "/inventory/receive" },
    ],
  },

  {
    title: "Sales",
    icon: ShoppingCart,
    sub: [
      { title: "Customers", url: "/sales/customers" },
      { title: "New Customer", url: "/sales/customers/new" },
      { title: "Orders", url: "/sales/orders" },
      { title: "New Order", url: "/sales/orders/new" },
      { title: "Invoices", url: "/sales/invoices" },
      { title: "New Invoice", url: "/sales/invoices/new" },
      { title: "Shipments", url: "/sales/shipments" },
      { title: "New Shipment", url: "/sales/shipments/new" },
      { title: "Returns", url: "/sales/returns" },
      { title: "New Return", url: "/sales/returns/new" },
      { title: "Discounts", url: "/sales/discounts" },
      { title: "New Discount", url: "/sales/discounts/new" },
      { title: "Team Performance", url: "/sales/team" },
      { title: "Team Chat", url: "/sales/team/chat" },
      { title: "Live Inventory (Sales)", url: "/sales/inventory" },
    ],
  },

  // Group Expenses and Add Expense together.
  {
    title: "Expenses",
    icon: Receipt,
    sub: [
      { title: "All Expenses", url: "/expenses" },
      { title: "Add Expense", url: "/expenses/new" },
    ],
  },

  {
    title: "Purchases",
    icon: ClipboardList,
    sub: [
      { title: "Vendors", url: "/purchasing/vendors" },
      { title: "Add Vendor", url: "/purchasing/vendors/new" },
      { title: "Purchase Orders", url: "/purchasing/pos" },
      { title: "New Purchase Order", url: "/purchasing/pos/new" },
      { title: "Receipts", url: "/purchasing/receipts" },
      { title: "New Receipt", url: "/purchasing/receipts/new" },
      { title: "Bills", url: "/purchasing/bills" },
      { title: "New Bill", url: "/purchasing/bills/new" },
      { title: "Vendor Credits", url: "/purchasing/vendor-credits" },
      { title: "New Vendor Credit", url: "/purchasing/vendor-credits/new" },
    ],
  },

  {
    title: "Reporting",
    icon: FileText,
    sub: [
      { title: "Profit & Loss", url: "/reporting/profit-loss" },
      { title: "Purchase & Sale", url: "/reporting/purchase-sale" },
      { title: "Tax", url: "/reporting/tax" },
      { title: "Supplier & Customer", url: "/reporting/supplier-customer" },
      { title: "Customer Group", url: "/reporting/customer-group" },
      { title: "Stock", url: "/reporting/stock" },
      { title: "Stock Expiry", url: "/reporting/stock-expiry" },
      { title: "Stock Adjustment", url: "/reporting/stock-adjustment" },
      { title: "Trending Product", url: "/reporting/trending-product" },
      { title: "Item", url: "/reporting/item" },
      { title: "Product Purchase", url: "/reporting/product-purchase" },
      { title: "Product Sell", url: "/reporting/product-sell" },
      { title: "Purchase Payment", url: "/reporting/purchase-payment" },
      { title: "Sell Payment", url: "/reporting/sell-payment" },
      { title: "Expense", url: "/reporting/expense" },
      { title: "Register", url: "/reporting/register" },
      { title: "Sales Representatives", url: "/reporting/sales-representatives" },
      { title: "Activity Log", url: "/reporting/activity-log" },
    ],
  },

  {
    title: "Accounting",
    icon: Wallet,
    sub: [{ title: "Balance Sheet", url: "/accounting/balance-sheet" }],
  },

  { title: "Notifications", url: "/notifications", icon: Bell },

  {
    title: "Settings",
    icon: Settings,
    sub: [
      { title: "Warehouses", url: "/settings/warehouses" },
      { title: "Users & Roles", url: "/settings/users" },
      { title: "Roles", url: "/settings/roles" },
      { title: "Payment Settings", url: "/settings/payments" },
      { title: "Preferences", url: "/settings/preferences" },
      { title: "Business Settings", url: "/settings/business" },
      { title: "Business Location", url: "/settings/locations" },
      { title: "Invoice Settings", url: "/settings/invoice" },
      { title: "Barcode Settings", url: "/settings/barcodes" },
      { title: "Receipt Printers", url: "/settings/printers" },
      { title: "Tax Rates", url: "/settings/taxes" },
      { title: "Notification Settings", url: "/settings/notifications" },
    ],
  },

  { title: "Integrations", url: "/settings/integrations", icon: Puzzle },

  { title: "AI Assistant", url: "/ai", icon: Bot },

  {
    title: "Marketing",
    icon: Megaphone,
    sub: [
      { title: "Overview", url: "/marketing" },
      { title: "Facebook Marketplace", url: "/marketing/facebook-marketplace" },
      { title: "Facebook Ads", url: "/marketing/facebook-ads" },
      { title: "Instagram Ads", url: "/marketing/instagram-ads" },
      { title: "YouTube & AdSense", url: "/marketing/youtube-adsense" },
      { title: "New Listing", url: "/marketing/listings/new" },
      { title: "Commissions", url: "/marketing/commissions" },
    ],
  },
]

export function AppSidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = React.useState(false)
  const [openStates, setOpenStates] = React.useState<Record<string, boolean>>(() =>
    nav.reduce(
      (acc, item) => {
        const active = item.url ? pathname === item.url : item.sub?.some((s) => pathname.startsWith(s.url))
        acc[item.title] = !!active
        return acc
      },
      {} as Record<string, boolean>,
    ),
  )

  const toggle = (title: string) => setOpenStates((p) => ({ ...p, [title]: !p[title] }))

  return (
    <aside className={cn("flex h-svh flex-col border-r bg-background transition-all", collapsed ? "w-14" : "w-64")}>
      <div className="flex items-center gap-2 px-2 py-3">
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="inline-flex h-8 w-8 items-center justify-center rounded-md border bg-transparent"
          aria-label="Toggle sidebar"
        >
          <div className="h-3 w-3 border-b-2 border-t-2" />
        </button>
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-gradient-to-br from-violet-500 to-emerald-500 text-white font-bold">
              IV
            </div>
            <span className="font-semibold">Inventory</span>
          </div>
        )}
      </div>

      {!collapsed && (
        <div className="px-2 pb-3">
          <Input placeholder="Search..." />
        </div>
      )}

      <nav className="flex-1 overflow-y-auto px-2 pb-4">
        <ul className="space-y-1">
          {nav.map((item) => {
            const active = item.url ? pathname === item.url : item.sub?.some((s) => pathname.startsWith(s.url))
            if (item.sub) {
              const isOpen = openStates[item.title]
              return (
                <li key={item.title}>
                  <button
                    onClick={() => toggle(item.title)}
                    className={cn(
                      "flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm hover:bg-accent",
                      active && "bg-accent",
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {!collapsed && <span>{item.title}</span>}
                    <ChevronDown
                      className={cn(
                        "ml-auto h-4 w-4 opacity-60 transition-transform",
                        isOpen ? "rotate-180" : "rotate-0",
                      )}
                    />
                  </button>
                  {!collapsed && (
                    <div
                      className={cn(
                        "grid overflow-hidden pl-6 transition-all",
                        isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
                      )}
                    >
                      <ul className="min-h-0 space-y-1">
                        {item.sub.map((s) => {
                          const subActive = pathname === s.url
                          return (
                            <li key={s.url}>
                              <Link
                                className={cn(
                                  "block rounded-md px-2 py-1.5 text-sm hover:bg-accent",
                                  subActive && "bg-accent",
                                )}
                                href={s.url}
                              >
                                {s.title}
                              </Link>
                            </li>
                          )
                        })}
                      </ul>
                    </div>
                  )}
                </li>
              )
            }
            return (
              <li key={item.title}>
                <Link
                  className={cn(
                    "flex items-center gap-2 rounded-md px-2 py-2 text-sm hover:bg-accent",
                    active && "bg-accent",
                  )}
                  href={item.url!}
                >
                  <item.icon className="h-4 w-4" />
                  {!collapsed && <span>{item.title}</span>}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {!collapsed && <div className="px-2 pb-3 text-xs text-muted-foreground">Tip: Cmd/Ctrl + B to toggle sidebar</div>}
    </aside>
  )
}
