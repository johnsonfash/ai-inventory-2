import * as React from "react"
import { Link } from "react-router-dom"
import { Plus } from "lucide-react"
import { cn } from "@/lib/utils"

type Props = {
  /** Where the FAB navigates to (Link mode). */
  href?: string
  /** Callback (button mode). One of href / onClick is required. */
  onClick?: () => void
  /** Accessible label + tooltip. Shows inline on tap-and-hold or via
   *  the optional `extended` variant. */
  label: string
  /** When true, renders as a wide pill with the label visible. */
  extended?: boolean
  /** Icon override. Defaults to a plus. */
  Icon?: React.ComponentType<{ className?: string }>
  /** Visual hide on non-mobile breakpoints. Defaults to true so a
   *  desktop primary button can live in the toolbar without
   *  duplication. */
  mobileOnly?: boolean
  className?: string
}

// Mobile floating action button — the universal "+ New X" pattern for
// list pages. Lives bottom-right, above the bottom nav + iOS home
// indicator. Brand-coloured circular fill with a subtle elevation glow.
// `extended` widens it to show the label inline (used on the page's
// first visit or when there are zero items in the list).
export function MobileFab({ href, onClick, label, extended, Icon = Plus, mobileOnly = true, className }: Props) {
  const inner = (
    <span className="flex items-center gap-2">
      <Icon className="h-5 w-5" />
      {extended && <span className="text-sm font-semibold">{label}</span>}
    </span>
  )

  const baseClass = cn(
    "pointer-events-auto inline-flex items-center justify-center rounded-full bg-gradient-to-br from-brand to-fuchsia-500 text-white shadow-xl shadow-brand/40 transition-all active:scale-[0.94]",
    extended ? "h-12 px-5" : "h-13 w-13 p-3.5",
    "dark:from-primary dark:to-fuchsia-600",
  )

  return (
    <div
      className={cn(
        "pointer-events-none fixed right-3 bottom-0 z-30 pb-[calc(env(safe-area-inset-bottom)+4.5rem)]",
        mobileOnly && "md:hidden",
        className,
      )}
    >
      {href ? (
        <Link to={href} aria-label={label} className={baseClass}>
          {inner}
        </Link>
      ) : (
        <button type="button" onClick={onClick} aria-label={label} className={baseClass}>
          {inner}
        </button>
      )}
    </div>
  )
}
