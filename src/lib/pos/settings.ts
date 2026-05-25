import { kvJson } from "@/lib/storage/kv"

// Till-level configuration that isn't part of any single sale: the
// manager-override PIN and the thresholds that decide when an action
// needs that override. Lives here (not in component state) so every
// terminal in an org reads the same rules and so later waves can hang
// receipt customization, cash-drawer, and printer settings off the same
// object without another storage key. POS-1.
//
// NOTE: the PIN is a UX gate for the mocked, single-device build — it is
// NOT a security boundary. When the backend lands, override approval
// moves server-side and checks the approver's real `pos:override`
// permission (see lib/auth/rbac.ts) against their session, not a shared
// code typed at the till.
export type PosSettings = {
  /** Shared manager code that unlocks gated actions. Default "1234". */
  managerPin: string
  /** Discounts at or above this percent need manager approval. */
  discountApprovalPercent: number
  /** Voiding a line worth more than this needs manager approval. */
  voidApprovalAmount: number
  /** Whether a reason must be captured when a line is voided. */
  requireVoidReason: boolean
}

const KEY = "pos:settings:v1"

export const DEFAULT_POS_SETTINGS: PosSettings = {
  managerPin: "1234",
  discountApprovalPercent: 15,
  voidApprovalAmount: 50,
  requireVoidReason: true,
}

export function loadPosSettings(): PosSettings {
  if (typeof window === "undefined") return DEFAULT_POS_SETTINGS
  const stored = kvJson.get<Partial<PosSettings>>(KEY)
  // Merge so a settings shape added in a later wave still gets defaults.
  return { ...DEFAULT_POS_SETTINGS, ...(stored ?? {}) }
}

export function savePosSettings(next: Partial<PosSettings>) {
  if (typeof window === "undefined") return
  void kvJson.set(KEY, { ...loadPosSettings(), ...next })
}

export function verifyManagerPin(pin: string): boolean {
  return pin.trim() === loadPosSettings().managerPin
}

// A void is recorded against the live transaction even when it doesn't
// need approval, so the cashier audit (POS-2) and the returns/voids
// reporting (POS-5) have the data when those waves land. Transaction-
// scoped only for now — not persisted.
export type VoidReason = "mistake" | "customer-cancel" | "out-of-stock" | "other"

export const VOID_REASONS: { value: VoidReason; label: string }[] = [
  { value: "mistake", label: "Rung in by mistake" },
  { value: "customer-cancel", label: "Customer cancelled" },
  { value: "out-of-stock", label: "Out of stock" },
  { value: "other", label: "Other" },
]

export type VoidEntry = {
  sku: string
  name: string
  qty: number
  value: number
  reason: VoidReason
  approvedBy?: string
  at: number
}
