import * as React from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Link, useLocation } from "react-router-dom"
import { ChevronLeft, ChevronRight, Search } from "lucide-react"
import { NAV } from "@/lib/nav"
import { Input } from "@/components/ui/input"
import { BottomSheet } from "@/components/mobile/bottom-sheet"
import { cn } from "@/lib/utils"

type Props = {
  open: boolean
  onClose: () => void
}

// Mobile "More" drawer — Stripe / Square pattern.
//
// Three modes:
//   1. ROOT: 3-col tile grid of section icons. Leaf items (no `sub`)
//      navigate directly; group items drill in.
//   2. SECTION: list of one group's sub-items with a back chevron.
//      Slide-left transition coming in, slide-right going out.
//   3. SEARCH: typing in the input flattens everything to a global
//      filtered list, independent of which view you were in.
//
// State resets on close so the next open always starts at ROOT.

const grid = {
  open:   { transition: { staggerChildren: 0.018, delayChildren: 0.04 } },
  closed: {},
}
const tile = {
  open:   { opacity: 1, y: 0, transition: { type: "spring" as const, damping: 22, stiffness: 280 } },
  closed: { opacity: 0, y: 8 },
}

export function MobileMoreDrawer({ open, onClose }: Props) {
  const [query, setQuery] = React.useState("")
  const [activeGroup, setActiveGroup] = React.useState<string | null>(null)
  const [direction, setDirection] = React.useState<1 | -1>(1) // 1 = drilling in, -1 = backing out
  const { pathname } = useLocation()

  // Reset both query + drill state when sheet closes so next open
  // is consistent (always root, no stale search).
  React.useEffect(() => {
    if (!open) {
      setQuery("")
      setActiveGroup(null)
      setDirection(1)
    }
  }, [open])

  const activeItem = React.useMemo(
    () => NAV.find((n) => n.title === activeGroup),
    [activeGroup],
  )

  const drillInto = (title: string) => {
    setDirection(1)
    setActiveGroup(title)
  }
  const backToRoot = () => {
    setDirection(-1)
    setActiveGroup(null)
  }

  // Flatten every nav target for global search.
  const allTargets = React.useMemo(() => {
    const out: { title: string; url: string; group: string; Icon: React.ElementType }[] = []
    for (const item of NAV) {
      const Icon = item.icon
      if (item.url) out.push({ title: item.title, url: item.url, group: item.title, Icon })
      if (item.sub) {
        for (const s of item.sub) {
          out.push({ title: s.title, url: s.url, group: item.title, Icon })
        }
      }
    }
    return out
  }, [])

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return null
    return allTargets.filter(
      (t) => t.title.toLowerCase().includes(q) || t.group.toLowerCase().includes(q),
    )
  }, [query, allTargets])

  // Slide variants — used by the AnimatePresence swap between ROOT
  // and SECTION views.
  const slide = {
    enter:  (dir: 1 | -1) => ({ x: dir > 0 ? 40 : -40, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit:   (dir: 1 | -1) => ({ x: dir > 0 ? -40 : 40, opacity: 0 }),
  }

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title={activeGroup ?? "All sections"}
      description={activeGroup ? `Inside ${activeGroup}` : "Tap a section to drill in · search to jump"}
      maxHeightVh={88}
    >
      {/* Sticky header: back button (when drilled in) + search */}
      <div className="sticky top-0 z-10 -mx-5 -mt-1 mb-3 bg-card px-5 pt-1 pb-2">
        <div className="flex items-center gap-2">
          {activeGroup && !filtered && (
            <button
              type="button"
              onClick={backToRoot}
              aria-label="Back to all sections"
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-foreground/80 hover:bg-accent active:bg-accent/70"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          )}
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={activeGroup ? `Search ${activeGroup}…` : "Search sections + sub-items…"}
              className="pl-9"
            />
          </div>
        </div>
      </div>

      {filtered ? (
        // ---- SEARCH: flat global results, ignores drill state ----
        <ul className="divide-y divide-border rounded-xl border border-border bg-muted/30">
          {filtered.length === 0 && (
            <li className="px-4 py-6 text-center text-sm text-muted-foreground">No matches</li>
          )}
          {filtered.map((t) => {
            const Icon = t.Icon
            const active = pathname === t.url
            return (
              <li key={t.url}>
                <Link
                  to={t.url}
                  onClick={onClose}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 text-sm transition-colors hover:bg-accent",
                    active && "bg-accent",
                  )}
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-soft text-brand dark:bg-primary/15 dark:text-primary">
                    <Icon className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-medium">{t.title}</div>
                    <div className="truncate text-xs text-muted-foreground">{t.group}</div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </Link>
              </li>
            )
          })}
        </ul>
      ) : (
        // ---- ROOT or SECTION view, animated via AnimatePresence ----
        <AnimatePresence mode="wait" custom={direction}>
          {activeGroup && activeItem?.sub ? (
            <motion.div
              key={`section-${activeItem.title}`}
              custom={direction}
              variants={slide}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: "spring", damping: 26, stiffness: 280 }}
            >
              {/* Hero card for this section */}
              <div className="mb-3 flex items-center gap-3 rounded-2xl border border-brand/30 bg-brand-soft/40 p-3 dark:bg-primary/10">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand to-fuchsia-500 text-white shadow-sm shadow-brand/30">
                  <activeItem.icon className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold">{activeItem.title}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {activeItem.sub.length} {activeItem.sub.length === 1 ? "item" : "items"} in this section
                  </p>
                </div>
              </div>
              <ul className="divide-y divide-border rounded-xl border border-border bg-card">
                {activeItem.sub.map((s) => {
                  const active = pathname === s.url || pathname.startsWith(s.url + "/")
                  return (
                    <li key={s.url}>
                      <Link
                        to={s.url}
                        onClick={onClose}
                        className={cn(
                          "flex items-center justify-between gap-3 px-4 py-3 text-sm transition-colors hover:bg-accent/40",
                          active && "bg-brand-soft/40 font-semibold text-brand dark:bg-primary/15 dark:text-primary",
                        )}
                      >
                        <span className="truncate">{s.title}</span>
                        <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </motion.div>
          ) : (
            <motion.div
              key="root"
              custom={direction}
              variants={slide}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: "spring", damping: 26, stiffness: 280 }}
            >
              <motion.ul
                className="grid grid-cols-3 gap-2.5 sm:grid-cols-4"
                variants={grid}
                initial="closed"
                animate="open"
              >
                {NAV.map((item) => {
                  const Icon = item.icon
                  const isGroup = item.sub && item.sub.length > 0
                  const active =
                    (item.url && pathname === item.url) ||
                    (item.sub && item.sub.some((s) => pathname.startsWith(s.url)))

                  // Leaf item (no sub-array) → navigate directly.
                  if (!isGroup) {
                    return (
                      <motion.li key={item.title} variants={tile}>
                        <Link
                          to={item.url ?? "/"}
                          onClick={onClose}
                          className={cn(
                            "flex h-24 flex-col items-center justify-center gap-1.5 rounded-2xl border border-border bg-card p-2 text-center text-[12px] font-medium transition-all hover:border-brand/40 hover:shadow-sm",
                            active && "border-brand/60 ring-1 ring-brand/30",
                          )}
                        >
                          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand/15 to-brand/0 text-brand dark:from-primary/25 dark:to-primary/0 dark:text-primary">
                            <Icon className="h-5 w-5" />
                          </span>
                          <span className="leading-tight">{item.title}</span>
                        </Link>
                      </motion.li>
                    )
                  }

                  // Group item → drill in.
                  return (
                    <motion.li key={item.title} variants={tile}>
                      <button
                        type="button"
                        onClick={() => drillInto(item.title)}
                        className={cn(
                          "relative flex h-24 w-full flex-col items-center justify-center gap-1.5 rounded-2xl border border-border bg-card p-2 text-center text-[12px] font-medium transition-all hover:border-brand/40 hover:shadow-sm",
                          active && "border-brand/60 ring-1 ring-brand/30",
                        )}
                      >
                        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand/15 to-brand/0 text-brand dark:from-primary/25 dark:to-primary/0 dark:text-primary">
                          <Icon className="h-5 w-5" />
                        </span>
                        <span className="leading-tight">{item.title}</span>
                        <span className="absolute right-1.5 top-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-muted px-1 text-[9px] font-bold tabular-nums text-muted-foreground">
                          {item.sub!.length}
                        </span>
                      </button>
                    </motion.li>
                  )
                })}
              </motion.ul>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </BottomSheet>
  )
}
