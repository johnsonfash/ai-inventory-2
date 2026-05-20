import { ChevronLeft } from "lucide-react"
import { useNavigate, useLocation } from "react-router-dom"
import { ModeToggle } from "@/components/mode-toggle"
import { cn } from "@/lib/utils"

type Props = {
  title: string
  /** Force a back button even on root-like pages. */
  showBack?: boolean
  /** Slot rendered between the title and the trailing actions (search, etc). */
  trailing?: React.ReactNode
  className?: string
}

export function MobileTopBar({ title, showBack, trailing, className }: Props) {
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
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-gradient-to-br from-brand to-fuchsia-500 text-white font-bold shadow-sm shadow-brand/30">
            P
          </div>
        </div>
      )}

      <h1 className="min-w-0 flex-1 truncate text-base font-semibold tracking-tight">{title}</h1>

      {trailing}
      <ModeToggle />
    </header>
  )
}
