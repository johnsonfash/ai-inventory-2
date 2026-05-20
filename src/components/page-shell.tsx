import * as React from "react"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { Loader2, ChevronDown } from "lucide-react"
import { Input } from "@/components/ui/input"
import { ModeToggle } from "@/components/mode-toggle"
import { OrgLocationSwitch } from "@/components/org-location-switch"
import { AppSidebar } from "@/components/app-sidebar"
import { Button } from "@/components/ui/button"
import { MobileTopBar } from "@/components/mobile/mobile-top-bar"
import { MobileBottomNav } from "@/components/mobile/mobile-bottom-nav"
import { MobileMoreDrawer } from "@/components/mobile/mobile-more-drawer"
import { usePullToRefresh, usePageRefreshHandler } from "@/hooks/use-pull-to-refresh"
import { useIsMobile } from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"

type PageShellProps = {
  title: string
  children: React.ReactNode
  /** Show the contextual quick-action toolbar (desktop only). */
  withToolbar?: boolean
  /** Right-aligned slot in the mobile top bar (e.g., a filter button). */
  mobileTrailing?: React.ReactNode
  /** Override the page-level CTAs in the desktop toolbar. */
  toolbarActions?: React.ReactNode
}

export function PageShell({ title, children, withToolbar = true, mobileTrailing, toolbarActions }: PageShellProps) {
  const isMobile = useIsMobile()
  const [moreOpen, setMoreOpen] = React.useState(false)
  const pageRefresh = usePageRefreshHandler()
  const { bind, pull, armed, refreshing } = usePullToRefresh({
    onRefresh: pageRefresh,
    enabled: isMobile,
  })

  if (isMobile) {
    return (
      <div className="flex h-[100dvh] min-h-0 flex-col overflow-hidden bg-background">
        <MobileTopBar title={title} trailing={mobileTrailing} />

        {/* Pull-to-refresh indicator. Anchored to top of scroll
            container, opacity scales with pull distance. */}
        <div
          className="pointer-events-none relative z-10 -mb-px flex justify-center"
          style={{ height: pull }}
        >
          <div
            className="mt-1 flex h-7 w-7 items-center justify-center rounded-full bg-card text-brand shadow-sm transition-opacity"
            style={{ opacity: Math.min(1, pull / 32) }}
          >
            {refreshing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <motion.span
                animate={{ rotate: armed ? 180 : 0 }}
                transition={{ type: "spring", damping: 22, stiffness: 320 }}
              >
                <ChevronDown className="h-4 w-4" />
              </motion.span>
            )}
          </div>
        </div>

        <div
          {...bind}
          className="flex-1 overflow-y-auto overscroll-contain pb-mobile-nav"
          style={{
            transform: `translateY(${pull * 0.4}px)`,
            transition: refreshing ? "none" : pull === 0 ? "transform 200ms ease" : "none",
          }}
        >
          <div className="px-4 pt-3 pb-2">{children}</div>
        </div>

        <MobileBottomNav onMoreClick={() => setMoreOpen(true)} />
        <MobileMoreDrawer open={moreOpen} onClose={() => setMoreOpen(false)} />
      </div>
    )
  }

  // Desktop / tablet shell.
  return (
    <div className="flex h-[100dvh] overflow-hidden">
      <AppSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background/80 px-5 backdrop-blur">
          <h1 className="text-base font-semibold tracking-tight">{title}</h1>
          <div className="ml-auto flex items-center gap-2">
            <OrgLocationSwitch />
            <div className="hidden md:block">
              <Input placeholder="Search items, orders…" className="w-[260px]" />
            </div>
            <ModeToggle />
            <div className="ml-1 flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-brand to-fuchsia-500 text-xs font-semibold text-white shadow-sm shadow-brand/30">
              P
            </div>
          </div>
        </header>

        {withToolbar && (
          <div
            className={cn(
              "border-b border-border px-5 py-3",
              "bg-gradient-to-r from-brand-soft/60 via-background to-emerald-50/40",
              "dark:from-primary/10 dark:via-background dark:to-emerald-950/15",
            )}
          >
            <div className="flex flex-wrap items-center gap-2">
              {toolbarActions ?? (
                <>
                  <Link to="/inventory/new" className="inline-flex">
                    <Button>New Item</Button>
                  </Link>
                  <Link to="/purchasing/pos/new" className="inline-flex">
                    <Button variant="outline">Create Purchase Order</Button>
                  </Link>
                  <Link to="/inventory/receive" className="inline-flex">
                    <Button variant="outline">Receive Stock</Button>
                  </Link>
                  <Link to="/notifications" className="ml-2 inline-flex">
                    <Button variant="ghost">Notifications</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-5">{children}</div>
      </div>
    </div>
  )
}
