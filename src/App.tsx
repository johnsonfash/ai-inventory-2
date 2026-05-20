import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
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
import { useNative } from "@/hooks/use-native"
import { useBackButton } from "@/hooks/use-back-button"
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

// Suspense fallback that shows a centered, brand-tinted spinner.
// Used while a route chunk is still in flight.
function RouteLoader() {
  return (
    <div className="flex h-[100dvh] items-center justify-center bg-background" aria-hidden="true">
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
// hardware back button to React Router history + emits a toast hint on
// the first back press at a root route.
function RouterBootstrap() {
  useBackButton()
  useEffect(() => {
    const onHint = () => toast("Press back again to exit", { duration: 1800 })
    window.addEventListener("pallio:back-exit-hint", onHint)
    return () => window.removeEventListener("pallio:back-exit-hint", onHint)
  }, [])
  return null
}

// Splits the Routes render so Suspense + AnimatePresence keys off
// location. Required so the loader sits under the transition.
function AppRoutes() {
  const location = useLocation()
  return (
    <Suspense fallback={<RouteLoader />}>
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

export default function App() {
  return (
    <TWThemeProvider>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <NativeBootstrap />
          <RouterBootstrap />
          <NetworkBanner />
          <PageRefreshProvider>
            <AppRoutes />
          </PageRefreshProvider>
          <PWAInstaller />
          <Toaster position="bottom-right" richColors closeButton />
        </BrowserRouter>
      </QueryClientProvider>
    </TWThemeProvider>
  )
}
