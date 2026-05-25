import * as React from "react"
import { cn } from "@/lib/utils"

// Product thumbnail with an honest fallback.
//
// If an item has a real photo, show it. If it doesn't (or the photo fails
// to load), render a deterministic **monogram tile** — the item's initials
// on a stable, hashed brand-adjacent colour — instead of a generic
// placeholder or a misleading stock photo. This is the Square / Shopify
// pattern: a catalogue of letter tiles reads as "real items without photos
// yet", not as broken images. Same item → same colour every render.

const TILE_TONES = [
  "bg-brand-soft text-brand dark:bg-primary/20 dark:text-primary",
  "bg-emerald-500/15 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
  "bg-amber-500/15 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
  "bg-sky-500/15 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300",
  "bg-fuchsia-500/15 text-fuchsia-700 dark:bg-fuchsia-500/15 dark:text-fuchsia-300",
  "bg-rose-500/15 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300",
]

function hashString(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (Math.imul(h, 31) + s.charCodeAt(i)) | 0
  return Math.abs(h)
}

function initials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean)
  if (words.length === 0) return "?"
  if (words.length === 1) return words[0]!.slice(0, 2).toUpperCase()
  return (words[0]![0]! + words[1]![0]!).toUpperCase()
}

export function ProductThumb({
  name,
  image,
  seed,
  className,
  textClassName = "text-sm",
}: {
  name: string
  image?: string
  /** Stable colour seed — defaults to the name. Pass the SKU when names
   *  can collide (e.g. two "Regular" sizes) so colours stay distinct. */
  seed?: string
  /** Sizing + radius for the tile box (e.g. "h-16 w-16 rounded-xl"). */
  className?: string
  /** Monogram text size; scale it up for larger tiles. */
  textClassName?: string
}) {
  // Reset the failed flag if the image source actually changes.
  const [failed, setFailed] = React.useState(false)
  React.useEffect(() => setFailed(false), [image])

  const showImg = !!image && !failed
  const tone = TILE_TONES[hashString(seed || name) % TILE_TONES.length]!

  return (
    <div className={cn("relative overflow-hidden bg-muted", !showImg && tone, className)}>
      {showImg ? (
        <img
          src={image}
          alt={name}
          loading="lazy"
          crossOrigin="anonymous"
          onError={() => setFailed(true)}
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        <span
          aria-hidden
          className={cn("absolute inset-0 flex items-center justify-center font-bold leading-none", textClassName)}
        >
          {initials(name)}
        </span>
      )}
    </div>
  )
}
