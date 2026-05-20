import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { Suspense } from "react"
import { Loader2 } from "lucide-react"
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom"
import { TWThemeProvider } from "@/components/tw-theme-provider"
import { Toaster } from "@/components/ui/sonner"
import { PageRefreshProvider } from "@/hooks/use-pull-to-refresh"
import { RouteTransition } from "@/components/route-transition"
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
          <PageRefreshProvider>
            <AppRoutes />
          </PageRefreshProvider>
          <Toaster position="bottom-right" richColors closeButton />
        </BrowserRouter>
      </QueryClientProvider>
    </TWThemeProvider>
  )
}
