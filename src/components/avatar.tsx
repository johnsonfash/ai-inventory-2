import * as React from "react"
import { cn } from "@/lib/utils"

type Props = {
  /** Seed string — usually the user's email or stable id. Same seed
   *  always returns the same face from pravatar. */
  seed: string
  /** Override the actual photo URL — pass a customer's uploaded
   *  profile picture, etc. Falls back to pravatar if omitted. */
  src?: string
  /** Full display name, used to compute initials for the fallback. */
  name: string
  /** Render size in px. Image is requested at 2× for crisp rendering. */
  size?: number
  className?: string
  /** Title attribute / aria-label override. */
  title?: string
  /** Background colour class for the initials fallback. */
  fallbackBg?: string
}

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return "?"
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

// Loads a real avatar photo (Unsplash via pravatar.cc, seeded by
// email/id) and falls back to a coloured initials tile if the image
// errors or hasn't loaded yet. One avatar primitive used by the
// user-menu, customer/vendor lists, team rosters, and anywhere else
// a person is shown.
export function Avatar({
  seed,
  src,
  name,
  size = 36,
  className,
  title,
  fallbackBg = "bg-gradient-to-br from-brand to-fuchsia-500 text-white",
}: Props) {
  const [errored, setErrored] = React.useState(false)
  const url =
    src ??
    // pravatar.cc serves real Unsplash people photos seeded by `?u=`.
    // Requesting 2× for retina sharpness.
    `https://i.pravatar.cc/${size * 2}?u=${encodeURIComponent(seed)}`
  const initials = initialsOf(name)
  const label = title ?? name

  if (errored || !url) {
    return (
      <span
        aria-label={label}
        title={label}
        style={{ width: size, height: size }}
        className={cn(
          "inline-flex shrink-0 items-center justify-center rounded-full text-[11px] font-bold shadow-sm shadow-black/10",
          fallbackBg,
          className,
        )}
      >
        {initials}
      </span>
    )
  }

  return (
    <img
      src={url}
      alt={label}
      title={label}
      width={size}
      height={size}
      loading="lazy"
      crossOrigin="anonymous"
      referrerPolicy="no-referrer"
      onError={() => setErrored(true)}
      style={{ width: size, height: size }}
      className={cn(
        "inline-flex shrink-0 rounded-full bg-muted object-cover shadow-sm shadow-black/10",
        className,
      )}
    />
  )
}
