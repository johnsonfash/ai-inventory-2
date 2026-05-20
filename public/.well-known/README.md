# well-known/

Two files here unlock real **universal links** (iOS) + **App Links** (Android) for Pallio — tapping a `https://pallio.app/...` URL on a device with the app installed opens the native app and routes via `useDeepLinks` instead of bouncing through Safari/Chrome.

They're scaffolded with placeholders. Both need real values **before they do anything**, but they're harmless until then.

## `apple-app-site-association`

Update one thing:

- `TEAMID` → your Apple Developer Team ID (10-character alphanumeric, find it at developer.apple.com → Membership → Team ID).

The file is intentionally extensionless. `vercel.json` sets `Content-Type: application/json` so iOS accepts it.

To verify after deploying:

```bash
curl -I https://pallio.app/.well-known/apple-app-site-association
# Must return: HTTP/2 200 + content-type: application/json
```

Then in Xcode, **Signing & Capabilities → + Capability → Associated Domains → `applinks:pallio.app`** (the entitlements file at `ios/App/App/App.entitlements` is already prepared — just toggle the capability on in the project).

iOS rebuilds + reinstalls the app to re-verify the domain.

## `assetlinks.json`

Replace both placeholders with your **release-build SHA-256 fingerprints**.

For a debug keystore (local testing):
```bash
keytool -list -v -keystore ~/.android/debug.keystore \
  -alias androiddebugkey -storepass android -keypass android \
  | grep SHA256
```

For a release keystore:
```bash
keytool -list -v -keystore /path/to/release.keystore \
  -alias <your-key-alias> | grep SHA256
```

If you use Google Play App Signing (recommended), include **both**:
- the upload key fingerprint (what you ship to Play Store), and
- the app signing fingerprint Google generates (Play Console → Setup → App integrity → App signing).

`AndroidManifest.xml` already has `android:autoVerify="true"` on the `https://pallio.app` intent-filter. Android verifies this file on first install; if it doesn't match, the OS treats taps as ordinary browser links + shows the disambiguation chooser instead.

To verify after deploying:
```bash
curl https://pallio.app/.well-known/assetlinks.json
# Should round-trip valid JSON.

# Optional: feed it through Google's validator —
# https://developers.google.com/digital-asset-links/tools/generator
```

## Why these aren't in `vercel.json` rewrites

The SPA rewrite (`/(.*)` → `/`) only fires when no static file matches. Vite copies `public/.well-known/*` straight into `dist/` at build time, so Vercel serves them as actual files. The `vercel.json` `headers` block pins the right `Content-Type` since neither file has an extension Vercel can auto-detect (AASA has none; assetlinks.json gets the same headers for consistency + caching).
