import * as React from "react"

// PageMeta is the per-page chrome data the stable AppFrame renders —
// title in the header, optional desktop toolbar overrides, optional
// mobile top-bar trailing slot. Each PageShell publishes its values
// into this context via useLayoutEffect, and AppFrame reads them.
//
// Why context (not props): PageShell is rendered inside lazy-loaded
// route components, AppFrame is mounted ONCE at the top of the tree.
// Props don't cross the Suspense boundary. The context survives
// route changes because the provider lives in App.tsx, above the
// Suspense.
//
// Why useLayoutEffect (in PageShell): we want the new title to land
// before the browser paints the new route. useEffect would cause a
// one-frame flash of the previous route's title. useLayoutEffect
// also handles the React StrictMode double-render safely.

export type PageMeta = {
  title: string
  /** Show the desktop quick-action toolbar under the header. */
  withToolbar: boolean
  /** Override the default desktop toolbar actions (new item, new
   *  PO, receive stock, notifications). */
  toolbarActions?: React.ReactNode
  /** Right-aligned slot on the mobile top bar (e.g. a filter or
   *  settings icon button). */
  mobileTrailing?: React.ReactNode
}

const DEFAULT_META: PageMeta = {
  title: "",
  withToolbar: false,
}

type Ctx = {
  meta: PageMeta
  setMeta: (m: PageMeta) => void
}

const PageMetaContext = React.createContext<Ctx | null>(null)

export function PageMetaProvider({ children }: { children: React.ReactNode }) {
  const [meta, setMeta] = React.useState<PageMeta>(DEFAULT_META)
  const value = React.useMemo(() => ({ meta, setMeta }), [meta])
  return <PageMetaContext.Provider value={value}>{children}</PageMetaContext.Provider>
}

/** Read the current page meta. Used by AppFrame to render the
 *  header + toolbar slots. */
export function usePageMeta(): PageMeta {
  const ctx = React.useContext(PageMetaContext)
  return ctx?.meta ?? DEFAULT_META
}

/** Publish page meta — call from PageShell. Mounted via
 *  useLayoutEffect so the title swap happens before paint. */
export function useSetPageMeta(meta: PageMeta): void {
  const ctx = React.useContext(PageMetaContext)
  React.useLayoutEffect(() => {
    if (!ctx) return
    ctx.setMeta(meta)
  }, [ctx, meta.title, meta.withToolbar, meta.toolbarActions, meta.mobileTrailing])
}
