import * as React from "react"
import { createPortal } from "react-dom"
import { useNavigate } from "react-router-dom"
import { AnimatePresence, motion } from "framer-motion"
import { ChevronRight, CornerDownLeft, Search } from "lucide-react"
import { useCommandPaletteOpen, useSetCommandPalette } from "@/contexts/command-palette"
import { useIsMobile } from "@/hooks/use-mobile"
import { useTWTheme } from "@/components/tw-theme-provider"
import { kvJson } from "@/lib/storage/kv"
import {
  buildCommandSources,
  fuzzyScore,
  type CommandGroup,
  type CommandItem,
} from "./sources"
import { cn } from "@/lib/utils"

const GROUP_ORDER: CommandGroup[] = [
  "Recent",
  "Quick actions",
  "Navigate",
  "Inventory",
  "Customers",
  "Settings",
  "Help",
]

const RECENTS_KEY = "pallio:cmd-recents"
const MAX_RECENTS = 6

type Scored = { item: CommandItem; score: number }

// The palette itself — overlay (desktop) or bottom-sheet (mobile).
// Keyboard-driven: ↑/↓ moves the highlight, Enter selects, Esc
// closes. Cmd+K toggle is wired at the provider level.
export function CommandPalette() {
  const open = useCommandPaletteOpen()
  const setOpen = useSetCommandPalette()
  const isMobile = useIsMobile()
  const navigate = useNavigate()
  const { setTheme } = useTWTheme()

  const [query, setQuery] = React.useState("")
  const [highlight, setHighlight] = React.useState(0)
  const [recents, setRecents] = React.useState<string[]>(() => kvJson.get<string[]>(RECENTS_KEY) ?? [])
  const inputRef = React.useRef<HTMLInputElement>(null)
  const listRef = React.useRef<HTMLDivElement>(null)

  // Build (and memoise) the full source list. Lazy — built once per
  // palette mount, not once per render.
  const sources = React.useMemo(() => buildCommandSources(), [])
  const sourcesById = React.useMemo(() => {
    const m = new Map<string, CommandItem>()
    for (const s of sources) m.set(s.id, s)
    return m
  }, [sources])

  // Reset state every time the palette opens. Focus the input so
  // typing starts immediately.
  React.useEffect(() => {
    if (!open) return
    setQuery("")
    setHighlight(0)
    // requestAnimationFrame so the modal exists before .focus()
    requestAnimationFrame(() => inputRef.current?.focus())
  }, [open])

  // Body scroll lock while open.
  React.useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  // Filter + score + group. When there's no query, the visible list
  // is Recent (if any) + Quick actions + Navigate (a curated home
  // page), so the palette is useful before the user types.
  const groups = React.useMemo(() => {
    const trimmed = query.trim()
    const out: Record<CommandGroup, Scored[]> = {
      Recent: [],
      "Quick actions": [],
      Navigate: [],
      Inventory: [],
      Customers: [],
      Settings: [],
      Help: [],
    }

    if (!trimmed) {
      // No query — show Recents at top + curated home.
      for (const id of recents) {
        const item = sourcesById.get(id)
        if (item) out.Recent.push({ item, score: 1 })
      }
      for (const item of sources) {
        if (item.group === "Quick actions" || item.group === "Navigate") {
          out[item.group].push({ item, score: 1 })
        }
      }
    } else {
      // Scored search across everything.
      for (const item of sources) {
        const score = fuzzyScore(`${item.title} ${item.subtitle ?? ""} ${item.searchTerms}`, trimmed)
        if (score > 0) out[item.group].push({ item, score })
      }
      for (const k of GROUP_ORDER) {
        out[k].sort((a, b) => b.score - a.score)
      }
    }

    return out
  }, [query, sources, sourcesById, recents])

  const flatList = React.useMemo(() => {
    const flat: Scored[] = []
    for (const g of GROUP_ORDER) {
      for (const r of groups[g]) flat.push(r)
    }
    return flat
  }, [groups])

  // Cap highlight to current list length.
  React.useEffect(() => {
    if (highlight >= flatList.length) setHighlight(Math.max(0, flatList.length - 1))
  }, [flatList.length, highlight])

  // Keep the highlighted row scrolled into view.
  React.useEffect(() => {
    if (!open) return
    const el = listRef.current?.querySelector<HTMLElement>(`[data-row-idx="${highlight}"]`)
    el?.scrollIntoView({ block: "nearest" })
  }, [highlight, open])

  const close = React.useCallback(() => setOpen(false), [setOpen])

  const runItem = React.useCallback(
    async (item: CommandItem) => {
      // Persist to Recent (most-recent first, dedup, cap at MAX_RECENTS).
      const nextRecents = [item.id, ...recents.filter((r) => r !== item.id)].slice(0, MAX_RECENTS)
      setRecents(nextRecents)
      void kvJson.set(RECENTS_KEY, nextRecents)

      close()
      // Defer the action one tick so the close animation can start.
      requestAnimationFrame(async () => {
        if (item.onSelect) {
          await item.onSelect({ navigate, setTheme })
        } else if (item.href) {
          navigate(item.href)
        }
      })
    },
    [recents, close, navigate, setTheme],
  )

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setHighlight((h) => Math.min(flatList.length - 1, h + 1))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setHighlight((h) => Math.max(0, h - 1))
    } else if (e.key === "Enter") {
      e.preventDefault()
      const item = flatList[highlight]?.item
      if (item) void runItem(item)
    }
  }

  if (typeof document === "undefined") return null

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          key="cmd"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.12 }}
          className={cn(
            "fixed inset-0 z-[90] flex bg-black/60 backdrop-blur-md",
            // Top-anchored Spotlight-style on desktop, with breathing
            // room above so it feels balanced; bottom-sheet on mobile.
            isMobile ? "items-end" : "items-start justify-center p-4 pt-[10vh] sm:p-6 sm:pt-[10vh]",
          )}
          role="dialog"
          aria-modal="true"
          aria-label="Command palette"
          onClick={close}
        >
          <motion.div
            initial={isMobile ? { y: "100%" } : { y: -16, opacity: 0, scale: 0.98 }}
            animate={isMobile ? { y: 0 } : { y: 0, opacity: 1, scale: 1 }}
            exit={isMobile ? { y: "100%" } : { y: -16, opacity: 0, scale: 0.98 }}
            transition={{ type: "spring", damping: 26, stiffness: 320 }}
            onClick={(e) => e.stopPropagation()}
            className={cn(
              "flex w-full flex-col overflow-hidden border border-border bg-card shadow-2xl shadow-black/40",
              // Constrain the desktop modal height so the inner results
              // list can actually scroll instead of spilling past the
              // viewport. Mobile already capped at 85dvh.
              isMobile ? "max-h-[85dvh] rounded-t-3xl" : "max-h-[min(80vh,640px)] max-w-2xl rounded-2xl",
            )}
          >
            {/* Search input */}
            <div className="flex items-center gap-2 border-b border-border px-4 py-3">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value)
                  setHighlight(0)
                }}
                onKeyDown={onKey}
                placeholder="Search items, customers, pages, actions…"
                className="flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground"
                aria-label="Search commands"
                spellCheck={false}
                autoComplete="off"
              />
              <kbd className="hidden rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground sm:inline-flex">
                Esc
              </kbd>
            </div>

            {/* Results */}
            <div
              ref={listRef}
              className="flex-1 overflow-y-auto p-2"
              onKeyDown={onKey}
            >
              {flatList.length === 0 ? (
                <div className="px-3 py-12 text-center text-sm text-muted-foreground">
                  No commands match <span className="font-mono">"{query}"</span>.
                </div>
              ) : (
                GROUP_ORDER.map((g) => {
                  const items = groups[g]
                  if (items.length === 0) return null
                  return (
                    <section key={g} className="mb-1.5 last:mb-0">
                      <p className="px-3 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                        {g}
                      </p>
                      <ul>
                        {items.map((row) => {
                          const idx = flatList.indexOf(row)
                          const active = idx === highlight
                          const Icon = row.item.Icon
                          return (
                            <li key={row.item.id}>
                              <button
                                type="button"
                                data-row-idx={idx}
                                onMouseEnter={() => setHighlight(idx)}
                                onClick={() => void runItem(row.item)}
                                className={cn(
                                  "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors",
                                  active
                                    ? "bg-brand-soft text-brand dark:bg-primary/15 dark:text-primary"
                                    : "hover:bg-accent/40",
                                )}
                              >
                                <Icon className={cn("h-4 w-4 shrink-0", active ? "" : "text-muted-foreground")} />
                                <div className="min-w-0 flex-1">
                                  <p className={cn("truncate font-medium", active ? "" : "text-foreground")}>
                                    {row.item.title}
                                  </p>
                                  {row.item.subtitle && (
                                    <p className="truncate text-[11px] text-muted-foreground">{row.item.subtitle}</p>
                                  )}
                                </div>
                                {active ? (
                                  <CornerDownLeft className="h-3.5 w-3.5 text-muted-foreground" />
                                ) : (
                                  <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/60" />
                                )}
                              </button>
                            </li>
                          )
                        })}
                      </ul>
                    </section>
                  )
                })
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between gap-2 border-t border-border bg-muted/30 px-4 py-2 text-[10px] text-muted-foreground">
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center gap-1">
                  <kbd className="rounded border border-border bg-card px-1 py-0.5 font-mono">↑↓</kbd> navigate
                </span>
                <span className="inline-flex items-center gap-1">
                  <kbd className="rounded border border-border bg-card px-1 py-0.5 font-mono">↵</kbd> select
                </span>
                <span className="hidden items-center gap-1 sm:inline-flex">
                  <kbd className="rounded border border-border bg-card px-1 py-0.5 font-mono">⌘K</kbd> toggle
                </span>
              </div>
              <span>
                {flatList.length === 0 ? "0" : flatList.length} result{flatList.length === 1 ? "" : "s"}
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
