import * as React from "react"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import { useLocation } from "react-router-dom"

// Wraps page output in a key'd fade so route changes cross-fade rather
// than blink. Respects prefers-reduced-motion. Keyed on pathname so
// query-param changes don't trigger transitions.
export function RouteTransition({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation()
  const reduce = useReducedMotion()
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        initial={reduce ? false : { opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        exit={reduce ? undefined : { opacity: 0, y: -3 }}
        transition={{ duration: reduce ? 0 : 0.14, ease: [0.32, 0.72, 0, 1] }}
        className="contents"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}
