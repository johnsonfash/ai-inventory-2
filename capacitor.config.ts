import type { CapacitorConfig } from "@capacitor/cli"

// Capacitor 8 config. The bundle id `app.pallio` is reverse-DNS of our
// owned `pallio.app` domain. Change here AND in the native projects
// (Xcode signing + AndroidManifest) if you ever rename.
const config: CapacitorConfig = {
  appId: "app.pallio",
  appName: "Pallio",
  webDir: "dist",

  // Force BOTH platforms to serve the bundled web build over an
  // `https://` origin (vs iOS's default `capacitor://`). This matters
  // for three things that bite us otherwise:
  //   1. Image loading — third-party CDN responses (Stripe, Mapbox,
  //      product CDNs) check the Origin/Referer; a `capacitor://`
  //      origin trips CORS + bot-detection and the images 404.
  //   2. Cookies / fetch — a `capacitor://` origin is treated as
  //      cross-site relative to any `https://` API, so cookies don't
  //      round-trip without manual wiring.
  //   3. The service worker scope. With injectManifest the SW
  //      registers under the page's origin; on `https://localhost`
  //      everything works the same way it does in a browser, so we
  //      don't need a parallel native-only caching layer.
  // No `url:` override — we ship the bundled web build via `cap sync`.
  // Pointing `url` at a remote origin is a useful debug trick but
  // should never land on main.
  server: {
    androidScheme: "https",
    iosScheme: "https",
  },

  plugins: {
    SplashScreen: {
      // Don't auto-hide — we hide programmatically once React has
      // mounted (see useNative()).
      launchAutoHide: false,
      backgroundColor: "#0a0a0a",
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    },
    StatusBar: {
      style: "DARK",
      backgroundColor: "#7c3aed",
      // Overlay the WebView so full-bleed pages (POS catalog hero,
      // marketing channel pages) sit flush to the top edge. Headers
      // that need to clear the status-bar icons use the `pwa-top`
      // Tailwind utility, which resolves to a real
      // `env(safe-area-inset-top)` value when overlaysWebView is on.
      overlaysWebView: true,
    },
    Keyboard: {
      // Native keyboard handling — iOS's UIScrollView contentInsets
      // do the right thing for app-shell layouts (h-[100dvh] +
      // sticky bottom composers). `resize: 'body'` shrinks the body
      // but doesn't always scroll the focused input into view.
      resize: "native",
      resizeOnFullScreen: true,
    },
  },

  ios: {
    // Edge-to-edge — let the WebView ignore the system safe-area and
    // flow content under the Dynamic Island / notch. Pages that need
    // to clear the status bar use the `pwa-top` utility, which now
    // resolves to a real safe-area-inset-top value.
    contentInset: "never",
    // Allow image hosts + future API origins outside the app's bundle
    // ID. Required for product photos from third-party CDNs.
    limitsNavigationsToAppBoundDomains: false,
    scrollEnabled: true,
  },

  android: {
    // Block HTTP-over-HTTPS mixed content — we never need it and it
    // closes off a category of MITM vulnerability.
    allowMixedContent: false,
    // Capture input events at the WebView level so the soft keyboard
    // behaviour stays consistent with iOS.
    captureInput: true,
    // Disable Chrome DevTools remote debugging in shipped builds.
    // Flip to `true` locally if you need to inspect a real device.
    webContentsDebuggingEnabled: false,
  },
}

export default config
