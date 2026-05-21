import type { StatusTone } from "@/components/lists/status-badge"
import { StatusBadge } from "@/components/lists/status-badge"

export type SummaryTile = {
  label: string
  value: string | number
  tone: StatusTone
  hint: string
}

type Props = { tiles: SummaryTile[]; className?: string }

// 4-tile horizontal-scroll-on-mobile / grid-on-desktop strip. Used on
// nearly every list page so the heavy markup is now in one place.
export function SummaryStrip({ tiles, className }: Props) {
  return (
    <div
      className={
        "-mx-4 flex gap-2.5 overflow-x-auto px-4 pb-1 scrollbar-hide snap-x snap-mandatory md:mx-0 md:grid md:gap-3 md:overflow-visible md:px-0 " +
        (tiles.length === 4
          ? "md:grid-cols-4"
          : tiles.length === 3
            ? "md:grid-cols-3"
            : tiles.length === 2
              ? "md:grid-cols-2"
              : "md:grid-cols-4") +
        (className ? ` ${className}` : "")
      }
    >
      {tiles.map((t) => (
        <div
          key={t.label}
          className="min-w-[140px] snap-start rounded-xl border border-border bg-card px-3 py-2.5 md:min-w-0"
        >
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            {t.label}
          </p>
          <p className="mt-0.5 text-lg font-bold tabular-nums leading-tight">{t.value}</p>
          <div className="mt-1">
            <StatusBadge tone={t.tone} withDot>
              {t.hint}
            </StatusBadge>
          </div>
        </div>
      ))}
    </div>
  )
}
