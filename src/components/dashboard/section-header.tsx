import { Link } from "react-router-dom"
import { ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"

type Props = {
  title: string
  subtitle?: string
  /** Optional right-aligned link. */
  href?: string
  hrefLabel?: string
  className?: string
}

export function SectionHeader({ title, subtitle, href, hrefLabel = "View all", className }: Props) {
  return (
    <div className={cn("flex items-end justify-between gap-3", className)}>
      <div className="min-w-0">
        <h2 className="text-base font-semibold tracking-tight md:text-lg">{title}</h2>
        {subtitle && <p className="mt-0.5 text-xs text-muted-foreground md:text-sm">{subtitle}</p>}
      </div>
      {href && (
        <Link
          to={href}
          className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground md:text-sm"
        >
          {hrefLabel} <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      )}
    </div>
  )
}
