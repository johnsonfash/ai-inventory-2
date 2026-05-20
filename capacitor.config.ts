import type { CapacitorConfig } from "@capacitor/cli"

const config: CapacitorConfig = {
  appId: "app.pallio",
  appName: "Pallio",
  // Built Vite SPA — `npm run build` produces this.
  webDir: "dist",

  // Server.androidScheme is required for things like the SW + cookie-
  // auth on Android; `https` makes the in-app webview's origin
  // match the deployed PWA's origin so the SW + localStorage are
  // shared between contexts.
  server: {
    androidScheme: "https",
  },

  plugins: {
    SplashScreen: {
      // Don't auto-hide — we hide programmatically once React has
      // mounted (see useNative()).
      launchAutoHide: false,
      backgroundColor: "#0a0a0a",
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
    },
    StatusBar: {
      style: "DARK",
      backgroundColor: "#7c3aed",
      overlaysWebView: false,
    },
    Keyboard: {
      // Resize the webview when the keyboard appears so inputs stay
      // visible. `native` is the recommended default for input-heavy
      // apps; `ionic` is the alternative.
      resize: "native",
      resizeOnFullScreen: true,
    },
  },

  ios: {
    contentInset: "automatic",
    // Allow the webview to scroll into the safe area we already
    // handle via pwa-top/pwa-bottom CSS utilities.
    scrollEnabled: true,
  },

  android: {
    // Allow cookies for cross-site requests (matches the iOS default).
    allowMixedContent: false,
  },
}

export default config
