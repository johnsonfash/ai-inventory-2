/// <reference lib="webworker" />
/* global self */

// Pallio service worker (built via vite-plugin-pwa `injectManifest`).
// Strategy:
//   * Precache the build manifest (HTML/JS/CSS/icons/fonts/SVG).
//   * Cache-first for static assets — they're versioned in the build.
//   * Stale-while-revalidate for the page shell so the catalog renders
//     instantly while we refresh in the background.
//   * Network-first for any /api/* call (when a real backend lands) so
//     fresh data wins, but we still fall back to cache offline.

import { precacheAndRoute, cleanupOutdatedCaches } from "workbox-precaching"
import { registerRoute, setDefaultHandler, setCatchHandler } from "workbox-routing"
import { CacheFirst, NetworkFirst, StaleWhileRevalidate } from "workbox-strategies"
import { ExpirationPlugin } from "workbox-expiration"

// Precache the build output. The manifest is injected at build time.
precacheAndRoute(self.__WB_MANIFEST || [])
cleanupOutdatedCaches()

// ---- Runtime caching ----

// Long-lived static assets keyed by hash in the filename.
registerRoute(
  ({ request }) =>
    request.destination === "script" ||
    request.destination === "style" ||
    request.destination === "font",
  new CacheFirst({
    cacheName: "static-assets",
    plugins: [new ExpirationPlugin({ maxEntries: 80, maxAgeSeconds: 60 * 60 * 24 * 30 })],
  }),
)

// Images (product photos, icons) — cache-first with a soft cap.
registerRoute(
  ({ request }) => request.destination === "image",
  new CacheFirst({
    cacheName: "images",
    plugins: [new ExpirationPlugin({ maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 14 })],
  }),
)

// Document navigations — stale-while-revalidate. The SPA shell is the
// same for every route, so this keeps the app instantly available
// offline while pulling fresh HTML in the background.
registerRoute(
  ({ request }) => request.mode === "navigate",
  new StaleWhileRevalidate({ cacheName: "navigations" }),
)

// Live API (when the backend lands). Network-first so users see fresh
// data when online, cached response when offline.
registerRoute(
  ({ url }) => url.pathname.startsWith("/api/"),
  new NetworkFirst({
    cacheName: "api",
    networkTimeoutSeconds: 6,
    plugins: [new ExpirationPlugin({ maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 })],
  }),
)

// Anything else (fonts.googleapis, third-party CDNs): SWR.
setDefaultHandler(new StaleWhileRevalidate({ cacheName: "default" }))

// Offline fallback. When a navigation can't be served from cache or
// network, fall back to the cached root document (the SPA renders an
// offline message at the data layer if a fetch fails).
setCatchHandler(async ({ request }) => {
  if (request.destination === "document") {
    return (await caches.match("/index.html")) || Response.error()
  }
  return Response.error()
})

// ---- SKIP_WAITING wiring ----
// The PWA register hook posts a SKIP_WAITING message when the user
// accepts the update toast. The waiting SW then takes over immediately.
self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") {
    self.skipWaiting()
  }
})

self.addEventListener("install", () => {
  // Wait for the user to accept before taking over (see SKIP_WAITING).
})
