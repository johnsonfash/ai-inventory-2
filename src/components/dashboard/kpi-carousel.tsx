import { KpiStatCard, type KpiStatCardProps } from "./kpi-stat-card"
import { cn } from "@/lib/utils"

type Props = {
  items: Omit<KpiStatCardProps, "carouselSized" | "index">[]
  className?: string
}

// Snap-scroll KPI row for mobile. On md+ collapses to a 4-column grid.
export function KpiCarousel({ items, className }: Props) {
  return (
    <>
      {/* Mobile: snap-x carousel that bleeds to viewport edges. */}
      <div
        className={cn(
          "-mx-4 flex gap-3 overflow-x-auto px-4 pb-2 md:hidden snap-x snap-mandatory scrollbar-hide",
          className,
        )}
      >
        {items.map((it, i) => (
          <KpiStatCard key={i} {...it} index={i} carouselSized />
        ))}
      </div>

      {/* Desktop / tablet: responsive grid. */}
      <div className={cn("hidden gap-4 md:grid md:grid-cols-2 lg:grid-cols-4", className)}>
        {items.map((it, i) => (
          <KpiStatCard key={i} {...it} index={i} />
        ))}
      </div>
    </>
  )
}
