import { kvJson } from "@/lib/storage/kv"

// Receipt + printer customization (POS-3). Just the handful of fields a
// shop actually changes — no WYSIWYG editor. Drives both the on-screen /
// browser receipt and the thermal (ESC/POS) print path.
export type ReceiptSettings = {
  /** Header business name; falls back to "Pallio" when blank. */
  businessName: string
  /** Address block under the name. */
  address: string
  /** Footer line — thanks / return policy. */
  footer: string
  /** Social handles / website line. */
  social: string
  /** Optional logo as a data URL (printed at the top on thermal + screen). */
  logoDataUrl?: string
  /** Thermal paper width. */
  paperSize: "Mm58" | "Mm80"
  /** Selected thermal printer name (from list_thermal_printers). */
  printerName?: string
  /** Kick the cash drawer automatically after a cash sale. */
  autoKickDrawer: boolean
  /** Days a gift receipt says the item can be returned within. */
  giftReturnDays: number
}

const KEY = "pos:receipt-settings:v1"

export const DEFAULT_RECEIPT_SETTINGS: ReceiptSettings = {
  businessName: "",
  address: "",
  footer: "Thank you for your business!",
  social: "",
  paperSize: "Mm80",
  autoKickDrawer: true,
  giftReturnDays: 30,
}

export function loadReceiptSettings(): ReceiptSettings {
  if (typeof window === "undefined") return DEFAULT_RECEIPT_SETTINGS
  return { ...DEFAULT_RECEIPT_SETTINGS, ...(kvJson.get<Partial<ReceiptSettings>>(KEY) ?? {}) }
}

export function saveReceiptSettings(next: Partial<ReceiptSettings>) {
  if (typeof window === "undefined") return
  void kvJson.set(KEY, { ...loadReceiptSettings(), ...next })
}
