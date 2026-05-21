import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import * as React from "react"
import { Suspense, useEffect } from "react"
import { Loader2 } from "lucide-react"
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom"
import { toast } from "sonner"
import { Toaster } from "@/components/ui/sonner"
import { TWThemeProvider } from "@/components/tw-theme-provider"
import { PageRefreshProvider } from "@/hooks/use-pull-to-refresh"
import { RouteTransition } from "@/components/route-transition"
import { PWAInstaller } from "@/components/pwa-installer"
import { NetworkBanner } from "@/components/network-banner"
import { BiometricGate } from "@/components/biometric-gate"
import { AppFrame } from "@/components/app-frame"
import { MarketingFrame } from "@/components/marketing/marketing-frame"
import { CommandPalette } from "@/components/command/command-palette"
import { CommandPaletteProvider } from "@/contexts/command-palette"
import { CurrencyProvider } from "@/contexts/currency"
import { PageMetaProvider } from "@/contexts/page-meta"
import { useNative } from "@/hooks/use-native"
import { useBackButton } from "@/hooks/use-back-button"
import { useDeepLinks } from "@/hooks/use-deep-links"
import { useKeyboardHeightCapture } from "@/hooks/use-chat-keyboard"
import { routes } from "./routes"

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      retry: 1,
    },
  },
})

// Content-area suspense fallback — a small inline spinner that
// occupies only the page content slot (inside AppFrame's <main>).
// The chrome (sidebar, mobile top bar, bottom nav, header, toolbar)
// stays mounted, so navigations don't flash the whole UI.
function ContentLoader() {
  return (
    <div className="flex h-full min-h-[40vh] items-center justify-center" aria-hidden="true">
      <div className="flex flex-col items-center gap-3 text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin text-brand dark:text-primary" />
        <span className="text-xs uppercase tracking-wider">Loading</span>
      </div>
    </div>
  )
}

// Bootstraps Capacitor wiring (status bar, splash hide, keyboard,
// haptics) once the provider tree is mounted. No-op on web.
function NativeBootstrap() {
  useNative()
  // Cache-warm the kb-height from any input focused anywhere in the
  // app, so the first /ai or /sales/team/chat visit doesn't show a
  // fallback-then-correct jump on its first composer focus.
  useKeyboardHeightCapture()
  return null
}

// Lives inside the Router so useNavigate is available. Wires Android's
// hardware back button to React Router history, routes deep links
// + app-icon shortcuts via appUrlOpen, and emits a toast hint on the
// first back press at a root route.
function RouterBootstrap() {
  useBackButton()
  useDeepLinks()
  useEffect(() => {
    const onHint = () => toast("Press back again to exit", { duration: 1800 })
    window.addEventListener("pallio:back-exit-hint", onHint)
    return () => window.removeEventListener("pallio:back-exit-hint", onHint)
  }, [])
  return null
}

// Public marketing routes use a completely different shell (top
// nav + footer + sign-in modal). Everything else gets the AppFrame
// (sidebar / mobile chrome). Listed here, not on each route, so the
// shell-switch logic stays in one place.
const MARKETING_PATHS = new Set<string>([
  "/", "/pricing", "/about", "/faq", "/contact", "/privacy", "/terms", "/login",
])

function isMarketingPath(pathname: string): boolean {
  return MARKETING_PATHS.has(pathname)
}

// React Router doesn't reset scroll position when the URL changes —
// it inherits from the browser's scroll-restoration. That's wrong for
// SPAs: tapping "Pricing" from a deep-scrolled "/" lands you halfway
// down the new page. This effect resets both the window scroll (for
// marketing pages, which scroll the body) and the AppFrame `#main`
// container (for app pages, where `<main>` is the scrolling element).
function ScrollToTop() {
  const { pathname } = useLocation()
  React.useEffect(() => {
    // Use `auto` (instant) on route change — `smooth` is jarring when
    // the new page paints in below the still-scrolling viewport.
    window.scrollTo({ top: 0, left: 0, behavior: "auto" })
    const main = document.getElementById("main")
    if (main) main.scrollTo({ top: 0, left: 0, behavior: "auto" })
  }, [pathname])
  return null
}

// Suspense + AnimatePresence wraps ONLY the routes — the frame
// above stays mounted across navigations. The fallback is a small
// content-area spinner instead of a full-screen one.
function AppRoutes() {
  const location = useLocation()
  return (
    <Suspense fallback={<ContentLoader />}>
      <RouteTransition>
        <Routes location={location}>
          {routes.map((r) => (
            <Route key={r.path} path={r.path} Component={r.Component} />
          ))}
        </Routes>
      </RouteTransition>
    </Suspense>
  )
}

// Picks the right shell for the current route. Lives just above the
// Suspense so when the user transitions from a marketing page into
// an app page (e.g. clicking "Get started" → /dashboard), the
// shell swaps cleanly instead of trying to render the wrong chrome.
function ShellRouter() {
  const { pathname } = useLocation()
  if (isMarketingPath(pathname)) {
    return (
      <MarketingFrame>
        <AppRoutes />
      </MarketingFrame>
    )
  }
  return (
    <PageMetaProvider>
      <PageRefreshProvider>
        <AppFrame>
          <AppRoutes />
        </AppFrame>
      </PageRefreshProvider>
    </PageMetaProvider>
  )
}

export default function App() {
  return (
    <TWThemeProvider>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <NativeBootstrap />
          <RouterBootstrap />
          <ScrollToTop />
          <BiometricGate>
            <NetworkBanner />
            <CurrencyProvider>
              <CommandPaletteProvider>
                <ShellRouter />
                <CommandPalette />
              </CommandPaletteProvider>
            </CurrencyProvider>
            <PWAInstaller />
          </BiometricGate>
          <Toaster position="bottom-right" richColors closeButton />
        </BrowserRouter>
      </QueryClientProvider>
    </TWThemeProvider>
  )
}
