import * as React from "react"
import { motion } from "framer-motion"
import { Link, useLocation } from "react-router-dom"
import { ChevronRight, Search } from "lucide-react"
import { NAV } from "@/lib/nav"
import { Input } from "@/components/ui/input"
import { BottomSheet } from "@/components/mobile/bottom-sheet"
import { cn } from "@/lib/utils"

type Props = {
  open: boolean
  onClose: () => void
}

// Stagger fade-in for the tile grid so it feels alive on open.
const grid = {
  open: { transition: { staggerChildren: 0.018, delayChildren: 0.04 } },
  closed: {},
}
const tile = {
  open: { opacity: 1, y: 0, transition: { type: "spring" as const, damping: 22, stiffness: 280 } },
  closed: { opacity: 0, y: 8 },
}

export function MobileMoreDrawer({ open, onClose }: Props) {
  const [query, setQuery] = React.useState("")
  const { pathname } = useLocation()

  // Reset query when sheet closes so it's fresh next open.
  React.useEffect(() => {
    if (!open) setQuery("")
  }, [open])

  // Flatten every nav target so search hits sub-items too. The user
  // probably knows "where to go" by name, not by parent.
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
    if (!q) return null // signal: render grouped, not flat
    return allTargets.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.group.toLowerCase().includes(q),
    )
  }, [query, allTargets])

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title="All sections"
      description="Jump to any part of Pallio"
      maxHeightVh={88}
    >
      <div className="sticky top-0 z-10 -mx-5 -mt-1 mb-3 bg-card px-5 pt-1 pb-2">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search sections…"
            className="pl-9"
          />
        </div>
      </div>

      {filtered ? (
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
        <motion.ul
          className="grid grid-cols-3 gap-2.5 sm:grid-cols-4"
          variants={grid}
          initial="closed"
          animate="open"
        >
          {NAV.map((item) => {
            const Icon = item.icon
            const target = item.url ?? item.sub?.[0]?.url ?? "/"
            const active =
              (item.url && pathname === item.url) ||
              (item.sub && item.sub.some((s) => pathname.startsWith(s.url)))
            return (
              <motion.li key={item.title} variants={tile}>
                <Link
                  to={target}
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
          })}
        </motion.ul>
      )}
    </BottomSheet>
  )
}
