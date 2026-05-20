import * as React from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

// Pure-CSS MacBook-style frame. Body + screen bezel + camera notch +
// keyboard hinge — no PNG dependency. Sized for a typical 16:10
// screen plus a small base; the `width` prop scales the whole rig.
//
// Lifts on viewport entry with a soft tilt + brand-tinted glow
// behind it. Renders any React child as the screen content; the
// landing page passes a DesktopDashboardMock.
type Props = {
  width?: number
  className?: string
  children: React.ReactNode
}

export function LaptopFrame({ width = 720, className, children }: Props) {
  // 16:10 screen + ~5% of height for the base. Adjust the divisor
  // if the screen ever needs to be more "Pro-style" wider.
  const screenHeight = Math.round((width / 16) * 10)
  const baseHeight = Math.round(screenHeight * 0.06)

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ type: "spring", damping: 24, stiffness: 200 }}
      style={{ width }}
      className={cn("relative shrink-0", className)}
    >
      {/* Glow behind the frame — same gradient as PhoneFrame so
          phone + laptop feel like one device family on the landing. */}
      <div className="pointer-events-none absolute -inset-10 -z-10 bg-gradient-to-br from-brand/30 via-fuchsia-500/20 to-emerald-500/15 blur-3xl" aria-hidden />

      {/* Screen + bezel */}
      <div
        className="relative w-full rounded-t-2xl bg-zinc-900 p-[10px] shadow-2xl shadow-black/60 ring-1 ring-black/40 dark:bg-black"
        style={{ height: screenHeight }}
      >
        {/* FaceTime camera dot */}
        <div className="absolute left-1/2 top-1.5 z-10 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-zinc-700" aria-hidden />

        {/* Screen */}
        <div className="relative h-full w-full overflow-hidden rounded-lg bg-background ring-1 ring-white/5">
          {/* Subtle reflective sheen on the top edge */}
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-1/4 bg-gradient-to-b from-white/[0.04] to-transparent"
            aria-hidden
          />
          {children}
        </div>
      </div>

      {/* Keyboard base — trapezoid shape via clip-path. Includes the
          notch in the front edge for the trackpad lip. */}
      <div
        className="relative mx-auto bg-gradient-to-b from-zinc-700 to-zinc-900 shadow-lg shadow-black/40 dark:from-zinc-800 dark:to-zinc-950"
        style={{
          height: baseHeight,
          width: "104%",
          marginLeft: "-2%",
          clipPath: "polygon(1.5% 0%, 98.5% 0%, 100% 100%, 0% 100%)",
        }}
      >
        {/* Trackpad notch */}
        <div className="absolute left-1/2 top-1/2 h-1 w-12 -translate-x-1/2 -translate-y-1/2 rounded-full bg-zinc-950/70" aria-hidden />
      </div>

      {/* Soft shadow underneath the laptop */}
      <div
        className="mx-auto h-3 max-w-[80%] rounded-full bg-black/40 blur-xl"
        aria-hidden
      />
    </motion.div>
  )
}
