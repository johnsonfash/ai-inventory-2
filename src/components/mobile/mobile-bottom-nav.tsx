import { Link, useLocation } from "react-router-dom"
import { MoreHorizontal } from "lucide-react"
import { BOTTOM_NAV_PRIMARY } from "@/lib/nav"
import { haptic } from "@/hooks/use-native"
import { cn } from "@/lib/utils"

type Props = {
  onMoreClick: () => void
}

export function MobileBottomNav({ onMoreClick }: Props) {
  const { pathname } = useLocation()

  const isActive = (url: string) => {
    if (url === "/") return pathname === "/"
    return pathname === url || pathname.startsWith(url + "/")
  }

  return (
    <nav
      className={cn(
        "fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/90 pwa-bottom backdrop-blur-md",
        "shadow-[0_-4px_24px_rgba(0,0,0,0.06)] dark:shadow-[0_-4px_24px_rgba(0,0,0,0.4)]",
      )}
      aria-label="Primary"
    >
      <ul className="grid grid-cols-5 px-1 pb-1 pt-0.5">
        {BOTTOM_NAV_PRIMARY.map((it) => {
          const Icon = it.icon
          const active = isActive(it.url)
          return (
            <li key={it.url} className="flex">
              <Link
                to={it.url}
                onClick={() => haptic.light()}
                aria-current={active ? "page" : undefined}
                aria-label={it.title}
                className="group relative flex flex-1 flex-col items-center justify-center rounded-xl py-0.5 text-[10px] font-medium leading-tight tracking-tight focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                <span
                  className={cn(
                    "inline-flex h-7 w-11 items-center justify-center rounded-xl transition-all",
                    active
                      ? "bg-brand-soft text-brand dark:bg-primary/20 dark:text-primary"
                      : "text-muted-foreground group-hover:text-foreground",
                  )}
                >
                  <Icon className="h-[18px] w-[18px]" strokeWidth={active ? 2.4 : 1.9} />
                </span>
                <span className={cn("transition-colors", active ? "text-foreground" : "text-muted-foreground")}>
                  {it.title}
                </span>
              </Link>
            </li>
          )
        })}
        <li className="flex">
          <button
            type="button"
            onClick={() => { haptic.light(); onMoreClick() }}
            aria-label="More navigation"
            aria-haspopup="dialog"
            className="group relative flex flex-1 flex-col items-center justify-center rounded-xl py-0.5 text-[10px] font-medium leading-tight tracking-tight focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <span className="inline-flex h-7 w-11 items-center justify-center rounded-xl text-muted-foreground transition-colors group-hover:text-foreground">
              <MoreHorizontal className="h-[18px] w-[18px]" />
            </span>
            <span className="text-muted-foreground">More</span>
          </button>
        </li>
      </ul>
    </nav>
  )
}
