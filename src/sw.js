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
//
// Update model: pairs with vite-plugin-pwa's `registerType: "autoUpdate"`.
// On install we `skipWaiting()` and on activate we `clients.claim()` so
// a freshly-deployed SW takes over open tabs immediately instead of
// idling in "waiting" state. The runtime caches are namespaced by the
// build id (injected via Vite `define`) so each deploy gets clean
// caches — old caches from previous deploys are dropped in activate.

import { precacheAndRoute, cleanupOutdatedCaches } from "workbox-precaching"
import { registerRoute, setDefaultHandler, setCatchHandler } from "workbox-routing"
import { CacheFirst, NetworkFirst, StaleWhileRevalidate } from "workbox-strategies"
import { ExpirationPlugin } from "workbox-expiration"

// Build-time constant from vite.config.ts `define`. Falls back to
// "dev" so the SW still compiles in standalone tooling.
const BUILD_ID = typeof __PALLIO_BUILD_ID__ !== "undefined" ? __PALLIO_BUILD_ID__ : "dev"

// Per-deploy cache names. Old caches (from previous deploys) get
// dropped in the activate handler below.
const CACHES = {
  staticAssets: `pallio-static-${BUILD_ID}`,
  images:       `pallio-images-${BUILD_ID}`,
  navigations:  `pallio-nav-${BUILD_ID}`,
  api:          `pallio-api-${BUILD_ID}`,
  fallback:     `pallio-default-${BUILD_ID}`,
}

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
    cacheName: CACHES.staticAssets,
    plugins: [new ExpirationPlugin({ maxEntries: 80, maxAgeSeconds: 60 * 60 * 24 * 30 })],
  }),
)

// Images (product photos, icons) — cache-first with a soft cap.
registerRoute(
  ({ request }) => request.destination === "image",
  new CacheFirst({
    cacheName: CACHES.images,
    plugins: [new ExpirationPlugin({ maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 14 })],
  }),
)

// Document navigations — stale-while-revalidate. The SPA shell is the
// same for every route, so this keeps the app instantly available
// offline while pulling fresh HTML in the background.
registerRoute(
  ({ request }) => request.mode === "navigate",
  new StaleWhileRevalidate({ cacheName: CACHES.navigations }),
)

// Live API (when the backend lands). Network-first so users see fresh
// data when online, cached response when offline.
registerRoute(
  ({ url }) => url.pathname.startsWith("/api/"),
  new NetworkFirst({
    cacheName: CACHES.api,
    networkTimeoutSeconds: 6,
    plugins: [new ExpirationPlugin({ maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 })],
  }),
)

// Anything else (fonts.googleapis, third-party CDNs): SWR.
setDefaultHandler(new StaleWhileRevalidate({ cacheName: CACHES.fallback }))

// Offline fallback. When a navigation can't be served from cache or
// network, fall back to the cached root document (the SPA renders an
// offline message at the data layer if a fetch fails).
setCatchHandler(async ({ request }) => {
  if (request.destination === "document") {
    return (await caches.match("/index.html")) || Response.error()
  }
  return Response.error()
})

// ---- Update lifecycle ----
//
// Take over open tabs as soon as a new SW lands so users don't have
// to close every tab to get the new version. Combined with the
// chunk-load reload fallback in src/routes.ts, deploys are
// effectively transparent: a tab that's been open for hours either
// (a) gets the new SW, picks up new asset URLs from the
// `autoUpdate` flow, or (b) hits a stale chunk on next navigation
// and the reload guard pulls the fresh index.html.

self.addEventListener("install", () => {
  self.skipWaiting()
})

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      // Drop caches that aren't on this build's whitelist — old
      // runtime caches from previous deploys (which would otherwise
      // serve stale chunk URLs forever).
      const wanted = new Set(Object.values(CACHES))
      const all = await caches.keys()
      await Promise.all(
        all
          .filter((name) => name.startsWith("pallio-") && !wanted.has(name))
          .map((name) => caches.delete(name)),
      )
      await self.clients.claim()
    })(),
  )
})

// Manual SKIP_WAITING channel kept for backwards compat with any
// older client code still posting it. New code shouldn't need this
// since install → skipWaiting fires automatically.
self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") self.skipWaiting()
})
