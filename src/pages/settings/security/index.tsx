import * as React from "react"
import { Fingerprint, KeyRound, Lock, ScanFace, ShieldCheck } from "lucide-react"
import { PageShell } from "@/components/page-shell"
import { FormSection } from "@/components/forms/form-section"
import { SwitchField } from "@/components/forms/switch-field"
import { StatusBadge } from "@/components/lists/status-badge"
import { useRegisterPageRefresh } from "@/hooks/use-pull-to-refresh"
import {
  isBiometricLockEnabled,
  setBiometricLockEnabled,
  useBiometric,
  verify as verifyBiometric,
} from "@/hooks/use-biometric"
import { isNative } from "@/hooks/use-native"

export default function SecuritySettings() {
  useRegisterPageRefresh(React.useCallback(async () => { await new Promise((r) => setTimeout(r, 400)) }, []))
  const bio = useBiometric()
  const [lockEnabled, setLockEnabled] = React.useState(() => isBiometricLockEnabled())

  // Toggle handler. Verifies before enabling so we don't trap the
  // user behind a prompt they can't pass. Disabling is unconditional.
  const onToggleLock = async (next: boolean) => {
    if (!next) {
      setBiometricLockEnabled(false)
      setLockEnabled(false)
      window.dispatchEvent(new CustomEvent("pallio:biometric-lock-changed"))
      return
    }
    // Enabling — verify first.
    const ok = await verifyBiometric("Confirm to enable biometric unlock")
    if (!ok) return
    setBiometricLockEnabled(true)
    setLockEnabled(true)
    window.dispatchEvent(new CustomEvent("pallio:biometric-lock-changed"))
  }

  const BioIcon = bio.type === "face" ? ScanFace : bio.type === "fingerprint" || bio.type === "touch" ? Fingerprint : Lock
  const bioLabel = bio.type === "face" ? "Face ID" : bio.type === "touch" ? "Touch ID" : bio.type === "fingerprint" ? "Fingerprint" : "Biometrics"

  return (
    <PageShell title="Security" withToolbar={false}>
      <div className="flex flex-col gap-5">
        {/* Hero */}
        <div className="rounded-2xl border border-border bg-gradient-to-br from-brand-soft via-card to-card p-5 dark:from-primary/15">
          <div className="flex items-start gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-soft text-brand dark:bg-primary/15 dark:text-primary">
              <ShieldCheck className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Account</p>
              <h2 className="mt-0.5 text-xl font-bold tracking-tight md:text-2xl">Security</h2>
              <p className="mt-1 max-w-prose text-sm text-muted-foreground">
                Control how Pallio verifies it's you. Biometric unlock keeps your inventory + finance data private if the device leaves your hands.
              </p>
            </div>
          </div>
        </div>

        {/* Biometric unlock */}
        <FormSection title="Biometric unlock" description="Require Face ID, Touch ID, or fingerprint to open Pallio." Icon={BioIcon}>
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-background p-3">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-soft text-brand dark:bg-primary/15 dark:text-primary">
                <BioIcon className="h-4 w-4" />
              </span>
              <div>
                <p className="text-sm font-semibold">{bioLabel}</p>
                <p className="text-[11px] text-muted-foreground">
                  {!isNative
                    ? "Available on the iOS / Android build only."
                    : !bio.ready
                      ? "Checking device support…"
                      : bio.available
                        ? "Device supports biometric authentication."
                        : "No biometric set up on this device — enroll one in Settings."}
                </p>
              </div>
            </div>
            <StatusBadge tone={!isNative ? "neutral" : bio.available ? "success" : "warning"}>
              {!isNative ? "web" : bio.available ? "available" : "unavailable"}
            </StatusBadge>
          </div>

          <div className="mt-3">
            <SwitchField
              label="Require biometric to open Pallio"
              description={
                lockEnabled
                  ? "On — you'll be prompted every cold launch."
                  : "Off — anyone with this device can open Pallio."
              }
              checked={lockEnabled}
              onCheckedChange={onToggleLock}
              disabled={!isNative || !bio.available}
            />
          </div>
        </FormSection>

        {/* Future: passcode, 2FA, active sessions, login alerts — wired
            when a real auth backend lands. Surfacing the section now
            so the IA is correct + users see it's coming. */}
        <FormSection title="Account password" description="Coming with the v2 auth release." Icon={KeyRound}>
          <p className="text-xs text-muted-foreground">
            When a real backend is wired, this will surface change-password, 2FA, active sessions, and login alerts.
          </p>
        </FormSection>
      </div>
    </PageShell>
  )
}
