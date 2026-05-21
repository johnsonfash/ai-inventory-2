import * as React from "react"
import { BottomSheet } from "@/components/mobile/bottom-sheet"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SwitchField } from "@/components/forms/switch-field"

type Mode = "retail" | "restaurant" | "services" | "auto"

type Props = {
  open: boolean
  onClose: () => void
  mode: Mode
  onModeChange: (m: Mode) => void
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
