import * as React from "react"
import { Minus, Plus, Trash2 } from "lucide-react"
import type { CartItem } from "@/lib/pos/storage"
import { Input } from "@/components/ui/input"
import { useCurrency } from "@/contexts/currency"
import { cn } from "@/lib/utils"

type Totals = {
  subtotal: number
  itemTax: number
  orderTax: number
  shipping: number
  serviceFee: number
  discountValue: number
  total: number
}

type Props = {
  cart: CartItem[]
  onUpdateQty: (sku: string, next: number) => void
  onRemove: (sku: string) => void
  discount: number
  discountType: "flat" | "percent"
  onDiscountChange: (v: number) => void
  onDiscountTypeChange: (t: "flat" | "percent") => void
  orderTaxPercent: number
  onOrderTaxPercentChange: (v: number) => void
  shipping: number
  onShippingChange: (v: number) => void
  serviceFee: number
  onServiceFeeChange: (v: number) => void
  totals: Totals
  className?: string
}

// Cart body — used inside both the mobile CartSheet and the desktop
// CartPanel. Lines on top, adjustments and totals below.
export function CartContent({
  cart,
  onUpdateQty,
  onRemove,
  discount,
  discountType,
  onDiscountChange,
  onDiscountTypeChange,
  orderTaxPercent,
  onOrderTaxPercentChange,
  shipping,
  onShippingChange,
  serviceFee,
  onServiceFeeChange,
  totals,
  className,
}: Props) {
  const [showExtras, setShowExtras] = React.useState(false)
  const { formatPrice, symbol } = useCurrency()

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {/* Lines */}
      <ul className="space-y-2">
        {cart.length === 0 ? (
          <li className="rounded-xl border border-dashed border-border bg-muted/30 p-6 text-center text-sm text-muted-foreground">
            No items yet — tap a product in the catalog to add it.
          </li>
        ) : (
          cart.map((c) => (
            <li key={c.sku} className="rounded-xl border border-border bg-background p-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{c.name}</p>
                  <p className="truncate font-mono text-[11px] text-muted-foreground">{c.sku}</p>
                </div>
                <button
                  type="button"
                  onClick={() => onRemove(c.sku)}
                  className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground"
                  aria-label={`Remove ${c.name}`}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="mt-2 flex items-center justify-between gap-2">
                <div className="inline-flex items-center gap-1 rounded-lg border border-border">
                  <button
                    type="button"
                    onClick={() => onUpdateQty(c.sku, c.qty - 1)}
                    className="inline-flex h-8 w-8 items-center justify-center text-muted-foreground hover:bg-accent"
                    aria-label="Decrease"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <input
                    type="number"
                    placeholder="0"
                    value={c.qty === 0 ? "" : c.qty}
                    min={0}
                    onChange={(e) => onUpdateQty(c.sku, e.target.value === "" ? 0 : Number(e.target.value) || 0)}
                    className="h-8 w-12 border-0 bg-transparent text-center text-sm tabular-nums outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => onUpdateQty(c.sku, c.qty + 1)}
                    className="inline-flex h-8 w-8 items-center justify-center text-muted-foreground hover:bg-accent"
                    aria-label="Increase"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold tabular-nums">{formatPrice(c.qty * c.price)}</p>
                  <p className="text-[10px] tabular-nums text-muted-foreground">{formatPrice(c.price)} ea</p>
                </div>
              </div>
            </li>
          ))
        )}
      </ul>

      {/* Totals */}
      <div className="rounded-xl border border-border bg-background p-3">
        <Row label="Subtotal" value={formatPrice(totals.subtotal)} muted />

        {/* Discount inline */}
        <div className="mt-2 flex items-center justify-between gap-2">
          <span className="text-xs text-muted-foreground">Discount</span>
          <div className="flex items-center gap-1.5">
            <div className="inline-flex h-8 rounded-md border border-input">
              <button
                type="button"
                onClick={() => onDiscountTypeChange("flat")}
                className={cn(
                  "px-2 text-xs",
                  discountType === "flat" ? "bg-accent font-semibold" : "text-muted-foreground",
                )}
              >
                {symbol}
              </button>
              <button
                type="button"
                onClick={() => onDiscountTypeChange("percent")}
                className={cn(
                  "px-2 text-xs border-l border-input",
                  discountType === "percent" ? "bg-accent font-semibold" : "text-muted-foreground",
                )}
              >
                %
              </button>
            </div>
            <Input
              className="h-8 w-20 text-right text-xs"
              type="number"
              placeholder="0"
              value={discount === 0 ? "" : discount}
              onChange={(e) => onDiscountChange(e.target.value === "" ? 0 : Math.max(0, Number(e.target.value) || 0))}
              min={0}
              step="0.01"
            />
          </div>
        </div>

        {totals.discountValue > 0 && (
          <Row label="Discount applied" value={`−${formatPrice(totals.discountValue)}`} muted />
        )}
        <Row label="Item tax" value={formatPrice(totals.itemTax)} muted />

        <button
          type="button"
          onClick={() => setShowExtras((v) => !v)}
          className="mt-2 text-[11px] font-medium text-brand hover:underline dark:text-primary"
        >
          {showExtras ? "Hide" : "Add"} order tax / shipping / service fee
        </button>

        {showExtras && (
          <div className="mt-2 space-y-2">
            <ExtraRow
              label="Order tax %"
              value={orderTaxPercent}
              onChange={(v) => onOrderTaxPercentChange(Math.max(0, v))}
              step="0.1"
            />
            <ExtraRow
              label="Shipping"
              prefix={symbol}
              value={shipping}
              onChange={(v) => onShippingChange(Math.max(0, v))}
              step="0.01"
            />
            <ExtraRow
              label="Service fee"
              prefix={symbol}
              value={serviceFee}
              onChange={(v) => onServiceFeeChange(Math.max(0, v))}
              step="0.01"
            />
          </div>
        )}

        <div className="mt-3 flex items-baseline justify-between border-t border-border pt-2.5">
          <span className="text-sm font-semibold">Total</span>
          <span className="text-xl font-bold tabular-nums">{formatPrice(totals.total)}</span>
        </div>
      </div>
    </div>
  )
}

function Row({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return (
    <div className="flex items-center justify-between text-xs">
      <span className={muted ? "text-muted-foreground" : "font-medium"}>{label}</span>
      <span className="tabular-nums">{value}</span>
    </div>
  )
}

function ExtraRow({
  label,
  value,
  onChange,
  prefix,
  step,
}: {
  label: string
  value: number
  onChange: (n: number) => void
  prefix?: string
  step?: string
}) {
  return (
    <div className="flex items-center justify-between gap-2 text-xs">
      <span className="text-muted-foreground">{label}</span>
      <div className="inline-flex items-center gap-1">
        {prefix && <span className="text-muted-foreground">{prefix}</span>}
        <Input
          type="number"
          placeholder="0"
          value={value === 0 ? "" : value}
          onChange={(e) => onChange(e.target.value === "" ? 0 : Number(e.target.value) || 0)}
          min={0}
          step={step}
          className="h-8 w-20 text-right text-xs"
        />
      </div>
    </div>
  )
}
