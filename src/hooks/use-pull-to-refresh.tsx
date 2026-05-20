import * as React from "react"

const MAX_PULL = 96
const TRIGGER = 64

type Options = {
  onRefresh: () => Promise<unknown> | void
  /** Disable entirely (e.g. when not mobile). */
  enabled?: boolean
}

// Gesture hook for native-feeling pull-to-refresh. Bind `bind` to a
// scroll container. Returns `pull` (0..MAX_PULL) and `armed`
// (true once the pull crossed the trigger threshold).
export function usePullToRefresh({ onRefresh, enabled = true }: Options) {
  const startY = React.useRef<number | null>(null)
  const [pull, setPull] = React.useState(0)
  const [refreshing, setRefreshing] = React.useState(false)
  const armed = pull >= TRIGGER

  const bind = React.useMemo(
    () => ({
      onTouchStart: (e: React.TouchEvent<HTMLDivElement>) => {
        if (!enabled || refreshing) return
        const el = e.currentTarget
        if (el.scrollTop > 0) return
        startY.current = e.touches[0]!.clientY
      },
      onTouchMove: (e: React.TouchEvent<HTMLDivElement>) => {
        if (!enabled || refreshing || startY.current == null) return
        const dy = e.touches[0]!.clientY - startY.current
        if (dy <= 0) {
          setPull(0)
          return
        }
        // Asymptotic damping toward MAX_PULL so it feels rubber-band-y.
        const damped = MAX_PULL * (1 - Math.exp(-dy / (MAX_PULL * 1.4)))
        setPull(damped)
      },
      onTouchEnd: async () => {
        if (!enabled) return
        const wasArmed = pull >= TRIGGER
        startY.current = null
        if (!wasArmed) {
          setPull(0)
          return
        }
        setRefreshing(true)
        setPull(TRIGGER) // hold at trigger position while refreshing
        try {
          await onRefresh()
        } finally {
          setRefreshing(false)
          setPull(0)
        }
      },
    }),
    [enabled, onRefresh, pull, refreshing],
  )

  return { bind, pull, armed, refreshing, maxPull: MAX_PULL }
}

// ------------------------------------------------------------------
// Page-level refresh registration
// ------------------------------------------------------------------
// Pages opt into pull-to-refresh by calling `useRegisterPageRefresh(fn)`
// inside their component. The PageShell reads from this context to
// route the gesture to the active page's refetch function.
type RefreshFn = () => Promise<unknown> | void
type RefreshCtx = {
  set: (fn: RefreshFn | null) => void
  get: () => RefreshFn | null
}
const Ctx = React.createContext<RefreshCtx | null>(null)

export function PageRefreshProvider({ children }: { children: React.ReactNode }) {
  const ref = React.useRef<RefreshFn | null>(null)
  const value = React.useMemo<RefreshCtx>(
    () => ({
      set: (fn) => {
        ref.current = fn
      },
      get: () => ref.current,
    }),
    [],
  )
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function usePageRefreshHandler(): RefreshFn {
  const ctx = React.useContext(Ctx)
  return async () => {
    const fn = ctx?.get()
    if (fn) await fn()
  }
}

export function useRegisterPageRefresh(fn: RefreshFn | null) {
  const ctx = React.useContext(Ctx)
  React.useEffect(() => {
    ctx?.set(fn)
    return () => ctx?.set(null)
  }, [ctx, fn])
}
