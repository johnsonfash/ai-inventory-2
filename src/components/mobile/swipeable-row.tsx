import * as React from "react"
import { motion, useMotionValue, useTransform, type PanInfo } from "framer-motion"
import { cn } from "@/lib/utils"

type Action = {
  label: string
  icon?: React.ReactNode
  onPress: () => void
  /** Colour role for the action background. */
  tone?: "danger" | "primary" | "neutral" | "warning"
}

type Props = {
  children: React.ReactNode
  /** Actions revealed on swipe-left (so left-swipe → right-side actions). */
  rightActions?: Action[]
  /** Actions revealed on swipe-right (so right-swipe → left-side actions). */
  leftActions?: Action[]
  className?: string
}

const ACTION_WIDTH = 80

const toneClasses: Record<NonNullable<Action["tone"]>, string> = {
  danger: "bg-destructive text-destructive-foreground",
  primary: "bg-primary text-primary-foreground",
  warning: "bg-warning text-warning-foreground",
  neutral: "bg-muted text-foreground",
}

// iOS-style swipeable row. Drag horizontally to reveal a stack of
// actions on the trailing side. Snaps to a rest position on release.
export function SwipeableRow({ children, rightActions = [], leftActions = [], className }: Props) {
  const x = useMotionValue(0)
  const rightW = rightActions.length * ACTION_WIDTH
  const leftW = leftActions.length * ACTION_WIDTH

  const [target, setTarget] = React.useState(0)

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    const v = info.velocity.x
    const offset = info.offset.x + (target ?? 0)
    if (offset < -rightW / 2 || v < -500) setTarget(-rightW)
    else if (offset > leftW / 2 || v > 500) setTarget(leftW)
    else setTarget(0)
  }

  // Background actions sit behind the row. Use the absolute value of x
  // to grow each side's width as the row drags away.
  const rightWidth = useTransform(x, (v) => Math.max(0, -v))
  const leftWidth = useTransform(x, (v) => Math.max(0, v))

  return (
    <div className={cn("relative overflow-hidden rounded-xl border border-border bg-card", className)}>
      {/* Right-side actions (revealed by swiping LEFT). */}
      {rightActions.length > 0 && (
        <motion.div
          className="absolute inset-y-0 right-0 flex"
          style={{ width: rightWidth }}
        >
          {rightActions.map((a, i) => (
            <button
              key={i}
              onClick={() => {
                a.onPress()
                setTarget(0)
              }}
              className={cn(
                "flex h-full w-20 flex-col items-center justify-center gap-1 text-xs font-medium",
                toneClasses[a.tone ?? "primary"],
              )}
            >
              {a.icon}
              {a.label}
            </button>
          ))}
        </motion.div>
      )}

      {/* Left-side actions (revealed by swiping RIGHT). */}
      {leftActions.length > 0 && (
        <motion.div
          className="absolute inset-y-0 left-0 flex"
          style={{ width: leftWidth }}
        >
          {leftActions.map((a, i) => (
            <button
              key={i}
              onClick={() => {
                a.onPress()
                setTarget(0)
              }}
              className={cn(
                "flex h-full w-20 flex-col items-center justify-center gap-1 text-xs font-medium",
                toneClasses[a.tone ?? "primary"],
              )}
            >
              {a.icon}
              {a.label}
            </button>
          ))}
        </motion.div>
      )}

      {/* The row itself. */}
      <motion.div
        drag="x"
        style={{ x }}
        dragConstraints={{ left: -rightW, right: leftW }}
        dragElastic={0.15}
        animate={{ x: target }}
        transition={{ type: "spring", damping: 30, stiffness: 320 }}
        onDragEnd={handleDragEnd}
        className="relative z-10 bg-card"
      >
        {children}
      </motion.div>
    </div>
  )
}
