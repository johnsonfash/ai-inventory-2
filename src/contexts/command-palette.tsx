import * as React from "react"

// Global open/close state for the Cmd+K command palette. Lives at
// App.tsx level so any component (header search button, mobile top
// bar, future help docs) can trigger the palette without prop
// drilling.
//
// Two contexts (value + setter) to mirror the page-meta pattern —
// the publisher (App's top bar) only needs the setter, the reader
// (the palette component itself) only needs the value. Splitting
// avoids re-rendering the trigger every time the palette opens.

type PaletteValue = { open: boolean }
const PaletteValueCtx = React.createContext<PaletteValue>({ open: false })
const PaletteSetterCtx = React.createContext<(next: boolean) => void>(() => {})

export function CommandPaletteProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false)
  const value = React.useMemo(() => ({ open }), [open])

  // Global hotkey. Cmd/Ctrl+K toggles; "/" opens unless the user is
  // already typing into an input / textarea / contentEditable. Esc
  // closes.
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const meta = e.metaKey || e.ctrlKey
      const target = e.target as HTMLElement | null
      const isTextInput =
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.isContentEditable

      if (meta && (e.key === "k" || e.key === "K")) {
        e.preventDefault()
        setOpen((o) => !o)
        return
      }
      // "/" works as a quick opener — same convention as GitHub /
      // Linear / etc. Suppress when the user is typing into an input.
      if (e.key === "/" && !meta && !isTextInput) {
        e.preventDefault()
        setOpen(true)
        return
      }
      if (e.key === "Escape") {
        setOpen(false)
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  return (
    <PaletteSetterCtx.Provider value={setOpen}>
      <PaletteValueCtx.Provider value={value}>{children}</PaletteValueCtx.Provider>
    </PaletteSetterCtx.Provider>
  )
}

/** Read open state. Used by <CommandPalette /> itself. */
export function useCommandPaletteOpen(): boolean {
  return React.useContext(PaletteValueCtx).open
}

/** Read the setter without subscribing to open-state changes —
 *  useful for trigger buttons that shouldn't re-render on toggle. */
export function useSetCommandPalette(): (next: boolean) => void {
  return React.useContext(PaletteSetterCtx)
}
