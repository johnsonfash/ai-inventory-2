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
//
// Why two contexts (value + setter): the publisher (PageShell) only
// needs the setter, not the value. The reader (AppFrame) only needs
// the value, not the setter. Splitting prevents the publisher from
// re-rendering on every value change — which combined with the
// `setMeta(currentMeta)` call inside useLayoutEffect would otherwise
// create an infinite loop:
//   render → publish → setState → context value changes → publisher
//   re-renders (because it subscribed to the value) → publish again.
// React's useState setter is referentially stable, so the setter
// context never changes, so PageShell never re-renders from meta
// updates.

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

const PageMetaValueContext = React.createContext<PageMeta>(DEFAULT_META)
// Default setter is a no-op so consumers don't have to null-check
// when there's no provider mounted (tests, Storybook, etc.).
const PageMetaSetterContext = React.createContext<(meta: PageMeta) => void>(() => {})

export function PageMetaProvider({ children }: { children: React.ReactNode }) {
  const [meta, setMeta] = React.useState<PageMeta>(DEFAULT_META)
  return (
    <PageMetaSetterContext.Provider value={setMeta}>
      <PageMetaValueContext.Provider value={meta}>
        {children}
      </PageMetaValueContext.Provider>
    </PageMetaSetterContext.Provider>
  )
}

/** Read the current page meta. Used by AppFrame to render the
 *  header + toolbar slots. Re-renders the caller whenever meta
 *  changes (which is what AppFrame wants). */
export function usePageMeta(): PageMeta {
  return React.useContext(PageMetaValueContext)
}

/** Publish page meta. Subscribes to the SETTER context only — the
 *  setter is the React useState stable function, so PageShell
 *  doesn't re-render every time `meta` is updated. */
export function useSetPageMeta(meta: PageMeta): void {
  const setMeta = React.useContext(PageMetaSetterContext)
  React.useLayoutEffect(() => {
    setMeta(meta)
  }, [setMeta, meta.title, meta.withToolbar, meta.toolbarActions, meta.mobileTrailing])
}
