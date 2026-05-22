import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Building2, Check, ChevronDown, MapPin } from "lucide-react"
import { useOrgLocation } from "@/hooks/use-org-location"
import { cn } from "@/lib/utils"

// In-drawer org + location switcher. Rendered at the TOP of
// UserMenu's body so multi-store operators can switch in one tap
// (avatar) → one tap (row) → one tap (option). Accordion expansion
// avoids nested popovers / sheets which feel cramped on mobile.
//
// Shares state with the desktop top-bar OrgLocationSwitch via
// useOrgLocation — flipping in either surface updates both live.

export function WorkspaceSwitcher({ onSelect }: { onSelect?: () => void }) {
  const { org, loc, setOrg, setLoc, currentOrg, currentLoc, orgs, locs } = useOrgLocation()
  const [expanded, setExpanded] = React.useState<"org" | "loc" | null>(null)

  // Selecting a value collapses the section and (optionally) notifies
  // the parent. The optional onSelect lets UserMenu close its drawer
  // after a switch — feels more decisive than leaving it open.
  const pickOrg = (v: string) => {
    setOrg(v)
    setExpanded(null)
    onSelect?.()
  }
  const pickLoc = (v: string) => {
    setLoc(v)
    setExpanded(null)
    onSelect?.()
  }

  return (
    <div className="border-b border-border bg-muted/40 p-2 dark:bg-muted/20">
      <p className="px-2 pb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        Workspace
      </p>

      <Row
        Icon={Building2}
        label={currentOrg.label}
        sub={currentOrg.sub}
        expanded={expanded === "org"}
        onClick={() => setExpanded(expanded === "org" ? null : "org")}
      />
      <OptionList
        open={expanded === "org"}
        items={orgs}
        active={org}
        onPick={pickOrg}
      />

      <Row
        Icon={MapPin}
        label={currentLoc.label}
        sub={currentLoc.sub}
        expanded={expanded === "loc"}
        onClick={() => setExpanded(expanded === "loc" ? null : "loc")}
      />
      <OptionList
        open={expanded === "loc"}
        items={locs}
        active={loc}
        onPick={pickLoc}
      />
    </div>
  )
}

function Row({
  Icon,
  label,
  sub,
  expanded,
  onClick,
}: {
  Icon: React.ComponentType<{ className?: string }>
  label: string
  sub: string
  expanded: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-expanded={expanded}
      className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition-colors hover:bg-accent/60"
    >
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-background text-muted-foreground">
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold">{label}</p>
        <p className="truncate text-[11px] text-muted-foreground">{sub}</p>
      </div>
      <ChevronDown
        className={cn(
          "h-4 w-4 shrink-0 text-muted-foreground transition-transform",
          expanded && "rotate-180",
        )}
      />
    </button>
  )
}

function OptionList({
  open,
  items,
  active,
  onPick,
}: {
  open: boolean
  items: { value: string; label: string; sub: string }[]
  active: string
  onPick: (v: string) => void
}) {
  return (
    <AnimatePresence initial={false}>
      {open && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          className="overflow-hidden"
        >
          <ul className="ml-3 mt-0.5 mb-1 border-l border-border pl-2">
            {items.map((it) => {
              const isActive = it.value === active
              return (
                <li key={it.value}>
                  <button
                    type="button"
                    onClick={() => onPick(it.value)}
                    className={cn(
                      "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left transition-colors",
                      isActive ? "bg-brand-soft/60 dark:bg-primary/15" : "hover:bg-accent/60",
                    )}
                  >
                    <span className="flex h-4 w-4 shrink-0 items-center justify-center">
                      {isActive ? (
                        <Check className="h-3.5 w-3.5 text-brand dark:text-primary" />
                      ) : null}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className={cn(
                        "truncate text-sm",
                        isActive ? "font-semibold text-foreground" : "font-medium text-foreground/90",
                      )}>
                        {it.label}
                      </p>
                      <p className="truncate text-[11px] text-muted-foreground">{it.sub}</p>
                    </div>
                  </button>
                </li>
              )
            })}
          </ul>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
