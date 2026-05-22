import { ChevronLeft } from "lucide-react"
import { useNavigate, useLocation } from "react-router-dom"
import { BrandMark } from "@/components/brand-mark"
import { InfoTooltip } from "@/components/info-tooltip"
import { cn } from "@/lib/utils"

type Props = {
  title: string
  /** Force a back button even on root-like pages. */
  showBack?: boolean
  /** Slot rendered between the title and the trailing actions (search, etc). */
  trailing?: React.ReactNode
  /** Optional explanation rendered as an info button next to the
   *  title — published by PageShell as `titleTooltip`. */
  titleTooltip?: React.ReactNode
  className?: string
}

export function MobileTopBar({ title, showBack, trailing, titleTooltip, className }: Props) {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const isRoot = pathname === "/"
  const canBack = showBack ?? !isRoot

  return (
    <header
      className={cn(
        "sticky top-0 z-30 flex items-center gap-2 border-b border-border bg-background/85 px-3 pwa-top backdrop-blur-md",
        "h-14",
        className,
      )}
    >
      {canBack ? (
        <button
          aria-label="Back"
          onClick={() => navigate(-1)}
          className="inline-flex h-9 w-9 items-center justify-center rounded-full text-foreground/80 hover:bg-accent active:bg-accent/70 transition-colors"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
      ) : (
        <div className="ml-1.5 flex items-center gap-2">
          <BrandMark className="h-8 w-8 shrink-0 shadow-sm shadow-violet-500/20" />
        </div>
      )}

      <h1 className="flex min-w-0 flex-1 items-center gap-1 truncate text-base font-semibold tracking-tight">
        <span className="truncate">{title}</span>
        {titleTooltip && (
          <InfoTooltip label={title} size="sm">
            {titleTooltip}
          </InfoTooltip>
        )}
      </h1>

      {/* Theme toggle intentionally omitted — UserMenu (rendered in
          the `trailing` slot's avatar dropdown) has its own theme
          switcher. Showing a standalone moon/sun icon here would
          duplicate the affordance. */}
      {trailing}
    </header>
  )
}
