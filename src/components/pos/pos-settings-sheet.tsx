import * as React from "react"
import { BottomSheet } from "@/components/mobile/bottom-sheet"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SwitchField } from "@/components/forms/switch-field"
import { loadPosSettings, savePosSettings, type PosSettings } from "@/lib/pos/settings"
import type { PriceTier } from "@/lib/pos/pricing-tiers"

type Mode = "retail" | "restaurant" | "services" | "auto"

type Props = {
  open: boolean
  onClose: () => void
  mode: Mode
  onModeChange: (m: Mode) => void
  /** Price tier for this sale (POS-2). */
  tier?: string
  tiers?: PriceTier[]
  onTierChange?: (id: string) => void
  salesperson: string
  onSalespersonChange: (s: string) => void
  channel: string
  onChannelChange: (c: string) => void
  location: string
  locations: string[]
  onLocationChange: (l: string) => void
  cashier: string
  cashiers: string[]
  onCashierChange: (c: string) => void
  globalScan: boolean
  onGlobalScanChange: (v: boolean) => void
}

export function PosSettingsSheet({
  open,
  onClose,
  mode,
  onModeChange,
  tier,
  tiers,
  onTierChange,
  salesperson,
  onSalespersonChange,
  channel,
  onChannelChange,
  location,
  locations,
  onLocationChange,
  cashier,
  cashiers,
  onCashierChange,
  globalScan,
  onGlobalScanChange,
}: Props) {
  // Manager-override rules persist across sessions (lib/pos/settings).
  // Local mirror so edits feel instant; each change writes through.
  const [pos, setPos] = React.useState<PosSettings>(() => loadPosSettings())
  const patchPos = (part: Partial<PosSettings>) => {
    setPos((p) => ({ ...p, ...part }))
    savePosSettings(part)
  }

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title="POS settings"
      description="Mode, location, and cashier for this session"
    >
      <div className="flex flex-col gap-3 pb-3">
        <FieldRow label="Business mode">
          <Select value={mode} onValueChange={(v) => v && onModeChange(v as Mode)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="retail">Retail</SelectItem>
              <SelectItem value="restaurant">Restaurant</SelectItem>
              <SelectItem value="services">Services / Salon</SelectItem>
              <SelectItem value="auto">Auto / Parts</SelectItem>
            </SelectContent>
          </Select>
        </FieldRow>

        {tiers && onTierChange && (
          <FieldRow label="Price tier">
            <Select value={tier} onValueChange={(v) => v && onTierChange(v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {tiers.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.name}
                    {t.adjustPercent !== 0 ? ` (${t.adjustPercent > 0 ? "+" : ""}${t.adjustPercent}%)` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FieldRow>
        )}

        <FieldRow label="Location">
          <Select value={location} onValueChange={(v) => v && onLocationChange(v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {locations.map((l) => (
                <SelectItem key={l} value={l}>{l}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FieldRow>

        <FieldRow label="Cashier">
          <Select value={cashier} onValueChange={(v) => v && onCashierChange(v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {cashiers.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FieldRow>

        <FieldRow label="Salesperson">
          <Input
            value={salesperson}
            onChange={(e) => onSalespersonChange(e.target.value)}
            placeholder="Name"
          />
        </FieldRow>

        <FieldRow label="Channel">
          <Select value={channel} onValueChange={(v) => v && onChannelChange(v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="In-Store">In-Store</SelectItem>
              <SelectItem value="Phone">Phone</SelectItem>
              <SelectItem value="Online">Online</SelectItem>
            </SelectContent>
          </Select>
        </FieldRow>

        <div className="pt-2">
          <SwitchField
            label="Global barcode capture"
            description="Listen for keyboard-wedge scanner input anywhere on the page."
            checked={globalScan}
            onCheckedChange={onGlobalScanChange}
          />
        </div>

        {/* Manager overrides — when the till asks for a manager's PIN. */}
        <div className="mt-2 rounded-xl border border-border bg-muted/30 p-3">
          <p className="text-xs font-semibold">Manager overrides</p>
          <p className="mb-3 text-[11px] text-muted-foreground">
            When a cashier action needs a manager's OK. The PIN is a quick gate for now —
            real per-person approval arrives with accounts.
          </p>
          <div className="flex flex-col gap-3">
            <FieldRow label="Manager PIN">
              <Input
                inputMode="numeric"
                value={pos.managerPin}
                onChange={(e) => patchPos({ managerPin: e.target.value.replace(/\D/g, "").slice(0, 6) })}
                placeholder="4-6 digits"
              />
            </FieldRow>
            <FieldRow label="Ask for approval above this discount %">
              <Input
                type="number"
                min={0}
                value={pos.discountApprovalPercent}
                onChange={(e) => patchPos({ discountApprovalPercent: Math.max(0, Number(e.target.value) || 0) })}
              />
            </FieldRow>
            <FieldRow label="Ask for approval to void a line worth more than">
              <Input
                type="number"
                min={0}
                value={pos.voidApprovalAmount}
                onChange={(e) => patchPos({ voidApprovalAmount: Math.max(0, Number(e.target.value) || 0) })}
              />
            </FieldRow>
            <SwitchField
              label="Capture a reason on void"
              description="Cashier picks why a line was removed (typo, customer cancelled, out of stock…)."
              checked={pos.requireVoidReason}
              onCheckedChange={(v) => patchPos({ requireVoidReason: v })}
            />
          </div>
        </div>
      </div>
    </BottomSheet>
  )
}

function FieldRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      {children}
    </div>
  )
}
