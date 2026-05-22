import * as React from "react"
import { cn } from "@/lib/utils"

type Props = {
  className?: string
  /** Override the rounded square background. Defaults to the lavender
   *  card behind the price-tag mark from `/public/favicon.svg`. */
  bgClassName?: string
  /** Hide the lavender card and render the mark on a transparent
   *  background — handy when the mark sits inside an already-tinted
   *  tile (e.g. the gradient hero on landing). */
  bare?: boolean
  /** Make the title decoration-only so it doesn't clutter screen
   *  readers when wrapped by a labelled parent. */
  ariaHidden?: boolean
}

// Pallio brand mark — a tilted price tag with a white "P" inside.
// Mirrors `/public/favicon.svg` so the in-app icon and the browser
// favicon stay in lockstep. Inlined here as a React component so we
// can colour-tweak with currentColor + dark-mode swaps without
// shipping a separate raster.
export function BrandMark({ className, bgClassName, bare = false, ariaHidden = false }: Props) {
  return (
    <span
      aria-hidden={ariaHidden || undefined}
      className={cn(
        "inline-flex items-center justify-center overflow-hidden",
        !bare && "rounded-lg bg-violet-50 dark:bg-violet-500/10",
        !bare && bgClassName,
        className,
      )}
    >
      <svg
        viewBox="0 0 512 512"
        role={ariaHidden ? undefined : "img"}
        aria-label={ariaHidden ? undefined : "Pallio"}
        className={bare ? "h-full w-full" : "h-[92%] w-[92%]"}
      >
        <defs>
          <linearGradient id="pallio-brand-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#7c3aed" />
            <stop offset="100%" stopColor="#4c1d95" />
          </linearGradient>
        </defs>
        <g transform="rotate(-12 256 256)">
          {/* scale(1.30) matches favicon.svg — gives the mark ~10%
              padding inside the lavender, same proportions as
              VS Code / Chrome / Compass app icons. mark.svg keeps
              its tighter scale because it renders standalone on
              dark backgrounds (splash, marketing hero) where no
              container is competing for space. */}
          <g transform="translate(256 256) scale(1.30) translate(-256 -256)">
            <path
              d="M 112 144 L 320 144 L 432 256 L 320 368 L 112 368 Z"
              fill="url(#pallio-brand-grad)"
            />
            <circle cx="370" cy="256" r="22" className="fill-violet-50 dark:fill-violet-500/10" />
            <path
              d="M 156 184 L 156 328 L 196 328 L 196 286 L 232 286 Q 296 286 296 235 Q 296 184 232 184 Z M 196 218 L 230 218 Q 256 218 256 235 Q 256 252 230 252 L 196 252 Z"
              fill="#ffffff"
            />
          </g>
        </g>
      </svg>
    </span>
  )
}
