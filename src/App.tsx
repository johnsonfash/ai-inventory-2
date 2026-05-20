import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { Suspense } from "react"
import { BrowserRouter, Route, Routes } from "react-router-dom"
import { TWThemeProvider } from "@/components/tw-theme-provider"
import { Toaster } from "@/components/ui/sonner"
import { PageRefreshProvider } from "@/hooks/use-pull-to-refresh"
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

function RouteLoader() {
  return <div className="min-h-svh bg-background" aria-hidden="true" />
}

export default function App() {
  return (
    <TWThemeProvider>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <PageRefreshProvider>
            <Suspense fallback={<RouteLoader />}>
              <Routes>
                {routes.map((r) => (
                  <Route key={r.path} path={r.path} Component={r.Component} />
                ))}
              </Routes>
            </Suspense>
          </PageRefreshProvider>
          <Toaster position="bottom-right" richColors closeButton />
        </BrowserRouter>
      </QueryClientProvider>
    </TWThemeProvider>
  )
}
