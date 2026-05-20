import * as React from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

// Pure-CSS iPhone-style frame. Dark bezel, sharp rounded corners,
// Dynamic Island stub. Inside, we render an inline mock of a Pallio
// surface — passed in as children. Sized for a typical 1170×2532
// portrait (1:2.16 aspect), scaled by the `width` prop.
//
// Lifts on hover with a soft tilt + light reflection sweep — keeps
// the landing-page heroes feeling alive without resorting to actual
// device PNGs.
type Props = {
  width?: number
  /** Tilt direction. `none` keeps it dead flat. */
  tilt?: "left" | "right" | "none"
  className?: string
  children: React.ReactNode
}

export function PhoneFrame({ width = 280, tilt = "none", className, children }: Props) {
  const height = Math.round(width * 2.05) // device + bezel
  const rotate = tilt === "left" ? -6 : tilt === "right" ? 6 : 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ type: "spring", damping: 24, stiffness: 220 }}
      style={{ width, height, rotate }}
      className={cn("relative shrink-0", className)}
    >
      {/* Glow behind the frame */}
      <div className="pointer-events-none absolute -inset-8 -z-10 bg-gradient-to-br from-brand/30 via-fuchsia-500/20 to-emerald-500/20 blur-3xl" aria-hidden="true" />

      {/* Outer bezel */}
      <div className="relative h-full w-full rounded-[2.6rem] bg-zinc-900 p-[6px] shadow-2xl shadow-black/60 ring-1 ring-black/40 dark:bg-black">
        {/* Edge highlight */}
        <div className="pointer-events-none absolute inset-0 rounded-[2.6rem] ring-1 ring-white/10" aria-hidden="true" />

        {/* Screen */}
        <div className="relative h-full w-full overflow-hidden rounded-[2.2rem] bg-background">
          {/* Dynamic-Island stub */}
          <div
            className="absolute left-1/2 top-1.5 z-10 h-5 w-[5.5rem] -translate-x-1/2 rounded-full bg-black/90"
            aria-hidden="true"
          />
          {/* Status-bar fake (just the time, right-aligned battery dot) */}
          <div className="absolute inset-x-0 top-0 z-0 flex items-center justify-between px-4 pt-2 text-[10px] font-semibold text-foreground/70">
            <span>9:41</span>
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
          </div>
          {/* Content */}
          <div className="absolute inset-0 pt-8">{children}</div>
        </div>
      </div>
    </motion.div>
  )
}
