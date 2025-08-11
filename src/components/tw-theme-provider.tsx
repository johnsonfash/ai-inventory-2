"use client"

import * as React from "react"

type Theme = "light" | "dark" | "system"
type Ctx = { theme: Theme; resolvedTheme: "light" | "dark"; setTheme: (t: Theme) => void }
const ThemeContext = React.createContext<Ctx | null>(null)

function getSystemIsDark() {
  if (typeof window === "undefined") return false
  return window.matchMedia("(prefers-color-scheme: dark)").matches
}
function applyHtmlClass(isDark: boolean) {
  if (typeof document === "undefined") return
  const root = document.documentElement
  if (isDark) root.classList.add("dark")
  else root.classList.remove("dark")
}

export function TWThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = React.useState<Theme>(() => {
    if (typeof window === "undefined") return "system"
    const stored = window.localStorage.getItem("theme") as Theme | null
    return stored ?? "system"
  })
  const [resolvedTheme, setResolvedTheme] = React.useState<"light" | "dark">(() =>
    getSystemIsDark() ? "dark" : "light",
  )

  React.useEffect(() => {
    const isDark = theme === "dark" ? true : theme === "light" ? false : getSystemIsDark()
    setResolvedTheme(isDark ? "dark" : "light")
    applyHtmlClass(isDark)
    try {
      window.localStorage.setItem("theme", theme)
    } catch {}
  }, [theme])

  React.useEffect(() => {
    const mql = window.matchMedia?.("(prefers-color-scheme: dark)")
    if (!mql) return
    const onChange = () => {
      if (theme === "system") {
        const isDark = mql.matches
        setResolvedTheme(isDark ? "dark" : "light")
        applyHtmlClass(isDark)
      }
    }
    mql.addEventListener?.("change", onChange)
    return () => mql.removeEventListener?.("change", onChange)
  }, [theme])

  const setTheme = React.useCallback((t: Theme) => setThemeState(t), [])

  return <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>{children}</ThemeContext.Provider>
}

export function useTWTheme() {
  const ctx = React.useContext(ThemeContext)
  if (!ctx) throw new Error("useTWTheme must be used within TWThemeProvider")
  return ctx
}
