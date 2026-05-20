import * as React from "react"
import { motion } from "framer-motion"
import { Fingerprint, Lock, ScanFace } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  isBiometricLockEnabled,
  useBiometric,
  verify as verifyBiometric,
} from "@/hooks/use-biometric"
import { isNative } from "@/hooks/use-native"

// App-level lock screen. When the user has enabled biometric unlock
// in Settings → Security AND we're on a native build with biometry
// available, blocks the rest of the app behind a Face ID / fingerprint
// prompt until they verify. On web it short-circuits to unlocked so
// the same component tree works in both contexts.
//
// State machine:
//   * `locked`     — overlay shown, prompt fires once on mount and
//                    on every "Unlock" tap. App content is rendered
//                    behind it but hidden from screen readers.
//   * `unlocked`   — overlay removed, children render normally.
//
// We re-lock on cold launch only (we don't watch for backgrounding).
// That matches what users expect from Banking-style biometric locks
// and keeps the UX from re-prompting every time a notification fans
// the user out and back.
export function BiometricGate({ children }: { children: React.ReactNode }) {
  const bio = useBiometric()

  // Initial lock state — read synchronously from localStorage so the
  // first paint either shows the lock or the app, no flicker.
  const [locked, setLocked] = React.useState(() => {
    if (!isNative) return false
    return isBiometricLockEnabled()
  })

  // If the user toggled biometric off in settings, drop the lock.
  React.useEffect(() => {
    const sync = () => {
      if (!isBiometricLockEnabled()) setLocked(false)
    }
    window.addEventListener("storage", sync)
    window.addEventListener("pallio:biometric-lock-changed", sync)
    return () => {
      window.removeEventListener("storage", sync)
      window.removeEventListener("pallio:biometric-lock-changed", sync)
    }
  }, [])

  const prompt = React.useCallback(async () => {
    const ok = await verifyBiometric("Unlock Pallio")
    if (ok) setLocked(false)
  }, [])

  // Auto-prompt on first mount when locked + biometry ready. Wrapping
  // in an effect lets the lock UI paint before the system prompt
  // appears — without this the prompt can fire before the user sees
  // why it's asking.
  const promptedRef = React.useRef(false)
  React.useEffect(() => {
    if (!locked || !bio.ready || !bio.available || promptedRef.current) return
    promptedRef.current = true
    prompt()
  }, [locked, bio.ready, bio.available, prompt])

  if (!locked) return <>{children}</>

  const IconComp = bio.type === "face" ? ScanFace : bio.type === "fingerprint" || bio.type === "touch" ? Fingerprint : Lock
  const label = bio.type === "face" ? "Use Face ID" : bio.type === "fingerprint" ? "Use fingerprint" : bio.type === "touch" ? "Use Touch ID" : "Unlock"

  return (
    <>
      <div aria-hidden>{children}</div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.18 }}
        role="dialog"
        aria-modal="true"
        aria-label="Pallio is locked"
        className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background"
      >
        <div className="flex flex-col items-center gap-5 px-8 text-center">
          <span className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-brand to-fuchsia-500 text-white shadow-xl shadow-brand/30">
            <IconComp className="h-8 w-8" />
          </span>
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Pallio is locked</h1>
            <p className="mt-1 max-w-xs text-sm text-muted-foreground">
              {bio.available
                ? "Unlock with biometrics to continue."
                : "Biometric unlock is enabled but unavailable on this device. Disable it in Settings → Security to continue."}
            </p>
          </div>
          {bio.available && (
            <Button onClick={prompt} size="lg" className="min-w-40">
              {label}
            </Button>
          )}
        </div>
      </motion.div>
    </>
  )
}
