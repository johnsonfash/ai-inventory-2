
import * as React from "react"
import { createPortal } from "react-dom"
import { AnimatePresence, motion } from "framer-motion"
import { Link, useLocation } from "react-router-dom"
import {
  BarChart3,
  Bell,
  Bot,
  CalendarDays,
  ChevronDown,
  ClipboardList,
  CreditCard,
  FileText,
  Megaphone,
  Package2,
  PanelLeftClose,
  PanelLeftOpen,
  Puzzle,
  Receipt,
  Settings,
  ShoppingCart,
  Wallet,
  type LucideIcon,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

type SubItem = { title: string; url: string }
type Item = { title: string; url?: string; icon: LucideIcon; sub?: SubItem[] }

const nav: Item[] = [
  { title: "Dashboard", url: "/", icon: BarChart3 },

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
      { title: "Security", url: "/settings/security" },
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

const COLLAPSED_KEY = "pallio:sidebar-collapsed"

export function AppSidebar() {
  const pathname = useLocation().pathname

  // Persist collapsed state. Read sync so the first paint matches
  // whatever the user picked last session — no resize flash.
  const [collapsed, setCollapsed] = React.useState<boolean>(() => {
    if (typeof window === "undefined") return false
    try { return localStorage.getItem(COLLAPSED_KEY) === "1" } catch { return false }
  })
  React.useEffect(() => {
    try { localStorage.setItem(COLLAPSED_KEY, collapsed ? "1" : "0") } catch { /* ignore */ }
  }, [collapsed])

  // Cmd/Ctrl + B toggle. The tip text in the footer promised this
  // shortcut for two waves before any handler existed.
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && (e.key === "b" || e.key === "B")) {
        // Don't steal focus from inputs / contentEditables where the
        // user might be trying to bold text.
        const tag = (e.target as HTMLElement | null)?.tagName?.toLowerCase()
        const editable = (e.target as HTMLElement | null)?.isContentEditable
        if (tag === "input" || tag === "textarea" || editable) return
        e.preventDefault()
        setCollapsed((c) => !c)
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

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

  // -------- Collapsed-mode flyout --------
  // When the sidebar is collapsed, hovering / clicking a group icon
  // pops a fixed-positioned panel with the sub-items, anchored to
  // the right of the icon. Replaces the previous "click expands the
  // whole sidebar" behaviour which was disorienting.
  type FlyoutState = { title: string; top: number } | null
  const [flyout, setFlyout] = React.useState<FlyoutState>(null)
  const closeTimerRef = React.useRef<number | null>(null)

  const cancelClose = React.useCallback(() => {
    if (closeTimerRef.current != null) {
      clearTimeout(closeTimerRef.current)
      closeTimerRef.current = null
    }
  }, [])

  const scheduleClose = React.useCallback(() => {
    cancelClose()
    closeTimerRef.current = window.setTimeout(() => {
      setFlyout(null)
      closeTimerRef.current = null
    }, 140)
  }, [cancelClose])

  const openFlyout = React.useCallback((title: string, anchor: HTMLElement) => {
    cancelClose()
    const rect = anchor.getBoundingClientRect()
    setFlyout({ title, top: rect.top })
  }, [cancelClose])

  // Close on Escape; close on route change (sub-item nav fires
  // pathname update, which we already key effects off).
  React.useEffect(() => {
    if (!flyout) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setFlyout(null)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [flyout])

  React.useEffect(() => { setFlyout(null) }, [pathname])

  // If the user expands the sidebar, drop the flyout so it doesn't
  // hang in space at the wrong position.
  React.useEffect(() => { if (!collapsed) setFlyout(null) }, [collapsed])

  // Clean up the timer on unmount.
  React.useEffect(() => () => cancelClose(), [cancelClose])

  const flyoutItem = flyout ? nav.find((n) => n.title === flyout.title) : null

  // When the route changes, re-expand the matching group so deep
  // links open into the right tree.
  React.useEffect(() => {
    setOpenStates((prev) => {
      const next = { ...prev }
      for (const item of nav) {
        if (item.sub?.some((s) => pathname.startsWith(s.url))) next[item.title] = true
      }
      return next
    })
  }, [pathname])

  return (
    <aside
      className={cn(
        "flex h-svh flex-col border-r border-border bg-background transition-[width] duration-200 ease-out",
        collapsed ? "w-16" : "w-64",
      )}
      aria-label="Primary navigation"
    >
      {/* Brand + collapse toggle */}
      <div
        className={cn(
          "flex items-center gap-2 border-b border-border px-2 py-3",
          collapsed && "justify-center px-0",
        )}
      >
        {!collapsed && (
          <Link to="/" className="flex flex-1 items-center gap-2 px-1.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand to-fuchsia-500 text-sm font-bold text-white shadow-sm shadow-brand/30">
              P
            </span>
            <span className="text-sm font-semibold tracking-tight">Pallio</span>
          </Link>
        )}
        <button
          type="button"
          onClick={() => setCollapsed((c) => !c)}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-keyshortcuts="Meta+B Control+B"
          title={collapsed ? "Expand sidebar (⌘B)" : "Collapse sidebar (⌘B)"}
          className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
        >
          {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
        </button>
      </div>

      {/* Search — only visible when expanded. */}
      {!collapsed && (
        <div className="px-2 py-2">
          <Input placeholder="Search…" className="h-9" />
        </div>
      )}

      <nav aria-label="Primary" className="flex-1 overflow-y-auto px-2 py-2">
        <ul className="space-y-0.5">
          {nav.map((item) => {
            const active = item.url ? pathname === item.url : item.sub?.some((s) => pathname.startsWith(s.url))
            if (item.sub) {
              const isOpen = openStates[item.title]
              return (
                <li key={item.title}>
                  <button
                    type="button"
                    onClick={(e) => {
                      // Collapsed: clicking the icon opens the flyout
                      // (touch devices have no hover; click is the
                      // fallback). Expanded: toggles the inline tree.
                      if (collapsed) {
                        openFlyout(item.title, e.currentTarget)
                        return
                      }
                      toggle(item.title)
                    }}
                    onMouseEnter={collapsed ? (e) => openFlyout(item.title, e.currentTarget) : undefined}
                    onMouseLeave={collapsed ? scheduleClose : undefined}
                    onFocus={collapsed ? (e) => openFlyout(item.title, e.currentTarget) : undefined}
                    aria-expanded={collapsed ? flyout?.title === item.title : isOpen}
                    aria-controls={!collapsed ? `nav-${slug(item.title)}` : undefined}
                    aria-label={collapsed ? item.title : undefined}
                    title={collapsed ? item.title : undefined}
                    className={cn(
                      "flex w-full items-center rounded-md text-sm transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand",
                      collapsed ? "h-10 justify-center px-0" : "gap-2 px-2 py-2",
                      active && "bg-accent",
                      collapsed && flyout?.title === item.title && "bg-accent",
                    )}
                  >
                    <item.icon className={cn("shrink-0", collapsed ? "h-5 w-5" : "h-4 w-4")} aria-hidden="true" />
                    {!collapsed && (
                      <>
                        <span className="truncate">{item.title}</span>
                        <ChevronDown
                          className={cn(
                            "ml-auto h-4 w-4 opacity-60 transition-transform",
                            isOpen ? "rotate-180" : "rotate-0",
                          )}
                          aria-hidden="true"
                        />
                      </>
                    )}
                  </button>
                  {!collapsed && (
                    <div
                      id={`nav-${slug(item.title)}`}
                      className={cn(
                        "grid overflow-hidden pl-6 transition-all",
                        isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
                      )}
                    >
                      <ul className="min-h-0 space-y-0.5 border-l border-border pl-2">
                        {item.sub.map((s) => {
                          const subActive = pathname === s.url
                          return (
                            <li key={s.url}>
                              <Link
                                aria-current={subActive ? "page" : undefined}
                                to={s.url}
                                className={cn(
                                  "block rounded-md px-2 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand",
                                  subActive && "bg-brand-soft text-brand dark:bg-primary/15 dark:text-primary",
                                )}
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
                  aria-current={active ? "page" : undefined}
                  aria-label={collapsed ? item.title : undefined}
                  title={collapsed ? item.title : undefined}
                  to={item.url!}
                  onMouseEnter={collapsed ? () => { cancelClose(); setFlyout(null) } : undefined}
                  className={cn(
                    "flex items-center rounded-md text-sm transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand",
                    collapsed ? "h-10 justify-center px-0" : "gap-2 px-2 py-2",
                    active && "bg-accent",
                  )}
                >
                  <item.icon className={cn("shrink-0", collapsed ? "h-5 w-5" : "h-4 w-4")} aria-hidden="true" />
                  {!collapsed && <span className="truncate">{item.title}</span>}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {!collapsed && (
        <div className="border-t border-border px-3 py-2.5 text-[10px] text-muted-foreground">
          <kbd className="rounded border border-border bg-muted px-1 py-0.5 font-mono text-[10px]">⌘B</kbd> to toggle
        </div>
      )}

      {/* Collapsed-mode flyout. Portaled to body so the aside's
          overflow-auto on <nav> doesn't clip it. Positioned with
          `fixed` against the hovered button's bounding rect. The
          panel itself owns max-height + overflow so a 13-item group
          (Settings) doesn't get its tail clipped by the viewport. */}
      {typeof document !== "undefined" && collapsed && createPortal(
        <AnimatePresence>
          {flyout && flyoutItem && (() => {
            // Anchor: icon's top. But if there isn't enough room
            // below the icon for a useful panel, push the panel up
            // so it still fits. The internal overflow-y-auto on the
            // list takes care of anything taller than the remaining
            // viewport.
            const vh = typeof window === "undefined" ? 800 : window.innerHeight
            const MIN_PANEL = 200 // ensure at least 200px visible panel even near the bottom edge
            const top = clamp(flyout.top, 8, vh - MIN_PANEL - 8)
            const maxHeight = vh - top - 12
            return (
              <motion.div
                key={flyout.title}
                initial={{ opacity: 0, x: -4 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -4 }}
                transition={{ duration: 0.12 }}
                role="menu"
                aria-label={flyoutItem.title}
                onMouseEnter={cancelClose}
                onMouseLeave={scheduleClose}
                style={{
                  position: "fixed",
                  left: 64 + 6,
                  top,
                  maxHeight,
                  zIndex: 60,
                }}
                className="flex w-60 flex-col rounded-xl border border-border bg-popover text-popover-foreground shadow-xl shadow-black/10 dark:shadow-black/40"
              >
                <div className="shrink-0 border-b border-border px-3 py-2">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {flyoutItem.title}
                  </p>
                </div>
                <ul className="min-h-0 flex-1 overflow-y-auto p-1.5">
                  {flyoutItem.sub?.map((s) => {
                    const subActive = pathname === s.url
                    return (
                      <li key={s.url}>
                        <Link
                          to={s.url}
                          onClick={() => setFlyout(null)}
                          aria-current={subActive ? "page" : undefined}
                          role="menuitem"
                          className={cn(
                            "block rounded-md px-2.5 py-1.5 text-xs transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand",
                            subActive
                              ? "bg-brand-soft text-brand dark:bg-primary/15 dark:text-primary"
                              : "text-foreground",
                          )}
                        >
                          {s.title}
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              </motion.div>
            )
          })()}
        </AnimatePresence>,
        document.body,
      )}
    </aside>
  )
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

function slug(s: string): string {
  return s.replace(/\s+/g, "-").toLowerCase()
}
