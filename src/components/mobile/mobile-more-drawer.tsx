import * as React from "react"
import { Link, useLocation } from "react-router-dom"
import { ChevronRight, ChevronDown, Search } from "lucide-react"
import { NAV } from "@/lib/nav"
import { Input } from "@/components/ui/input"
import { BottomSheet } from "@/components/mobile/bottom-sheet"
import { cn } from "@/lib/utils"

type Props = {
  open: boolean
  onClose: () => void
}

// Mobile "More" drawer — renders every navigation target the desktop
// sidebar has, organised as collapsible groups with their sub-items.
//
// Layout choices:
//   - Search at the top flattens to a single filtered list.
//   - Each group with `sub` items renders as an accordion section:
//     tap the header to expand/collapse. The user's CURRENT group
//     auto-opens so they're already looking at where they are.
//   - Leaf items (Dashboard, AI Assistant, Notifications, etc. —
//     no sub array) render as direct links with the same row chrome
//     so the eye doesn't have to switch modes.

export function MobileMoreDrawer({ open, onClose }: Props) {
  const [query, setQuery] = React.useState("")
  const { pathname } = useLocation()

  // Reset query when sheet closes so it's fresh next open.
  React.useEffect(() => {
    if (!open) setQuery("")
  }, [open])

  // Auto-expand the group containing the current page on each open.
  const currentGroupKey = React.useMemo(() => {
    for (const item of NAV) {
      if (!item.sub) continue
      if (item.sub.some((s) => pathname.startsWith(s.url))) return item.title
    }
    return null
  }, [pathname])

  const [expanded, setExpanded] = React.useState<Set<string>>(new Set())
  React.useEffect(() => {
    if (!open) return
    setExpanded(currentGroupKey ? new Set([currentGroupKey]) : new Set())
  }, [open, currentGroupKey])

  const toggle = (title: string) => {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(title)) next.delete(title)
      else next.add(title)
      return next
    })
  }

  // Flatten every nav target for search — the user probably knows
  // "where to go" by name, not by parent.
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

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title="All sections"
      description="Tap a section to expand · tap an item to jump"
      maxHeightVh={88}
    >
      {/* Sticky search */}
      <div className="sticky top-0 z-10 -mx-5 -mt-1 mb-3 bg-card px-5 pt-1 pb-2">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search sections + sub-items…"
            className="pl-9"
          />
        </div>
      </div>

      {filtered ? (
        // ---- Search results: flat list ----
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
        // ---- Default: accordion groups + leaf links ----
        <ul className="flex flex-col gap-1.5">
          {NAV.map((item) => {
            const Icon = item.icon
            // Leaf item (no sub-array) — render as a direct link row.
            if (!item.sub || item.sub.length === 0) {
              const active = item.url ? pathname === item.url : false
              return (
                <li key={item.title}>
                  <Link
                    to={item.url ?? "/"}
                    onClick={onClose}
                    className={cn(
                      "flex items-center gap-3 rounded-xl border border-border bg-card px-3 py-2.5 transition-colors hover:border-brand/40 hover:bg-accent/40",
                      active && "border-brand/60 bg-brand-soft/40 dark:bg-primary/10",
                    )}
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-soft text-brand dark:bg-primary/15 dark:text-primary">
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="flex-1 truncate text-sm font-semibold">{item.title}</span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </Link>
                </li>
              )
            }

            // Group item — accordion header + collapsible children.
            const isExpanded = expanded.has(item.title)
            const groupActive = item.sub.some((s) => pathname.startsWith(s.url))
            const activeCount = item.sub.filter((s) => pathname.startsWith(s.url)).length
            return (
              <li key={item.title} className="overflow-hidden rounded-xl border border-border bg-card">
                <button
                  type="button"
                  onClick={() => toggle(item.title)}
                  aria-expanded={isExpanded}
                  className={cn(
                    "flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-accent/40",
                    groupActive && !isExpanded && "border-l-2 border-l-brand dark:border-l-primary",
                  )}
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-soft text-brand dark:bg-primary/15 dark:text-primary">
                    <Icon className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold">{item.title}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {item.sub.length} {item.sub.length === 1 ? "item" : "items"}
                      {activeCount > 0 ? " · currently here" : ""}
                    </p>
                  </div>
                  <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", isExpanded && "rotate-180")} />
                </button>
                {isExpanded && (
                  <ul className="border-t border-border bg-muted/30">
                    {item.sub.map((s) => {
                      const active = pathname === s.url
                      return (
                        <li key={s.url}>
                          <Link
                            to={s.url}
                            onClick={onClose}
                            className={cn(
                              "flex items-center justify-between gap-3 px-4 py-2.5 pl-14 text-sm transition-colors hover:bg-accent/40",
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
                )}
              </li>
            )
          })}
        </ul>
      )}
    </BottomSheet>
  )
}
