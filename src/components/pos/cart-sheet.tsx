import * as React from "react"
import { ArrowRight, Save, Trash2 } from "lucide-react"
import type { CartItem } from "@/lib/pos/storage"
import { BottomSheet } from "@/components/mobile/bottom-sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CartContent } from "./cart-content"

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
  open: boolean
  onClose: () => void
  cart: CartItem[]
  customer: { name?: string; email?: string; phone?: string }
  onCustomerChange: (next: { name?: string; email?: string; phone?: string }) => void
  onUpdateQty: (sku: string, next: number) => void
  onRemove: (sku: string) => void
  onClearCart: () => void
  onHold: () => void
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
  /** Called when user taps the primary "Charge" button. Sheet stays
      open — the parent should open CheckoutSheet on top. */
  onCharge: () => void
}

export function CartSheet({
  open,
  onClose,
  cart,
  customer,
  onCustomerChange,
  onUpdateQty,
  onRemove,
  onClearCart,
  onHold,
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
  onCharge,
}: Props) {
  const [showCustomer, setShowCustomer] = React.useState(false)

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title={`Cart · ${cart.reduce((s, c) => s + c.qty, 0)} items`}
      headerRight={
        cart.length > 0 ? (
          <button
            type="button"
            onClick={onClearCart}
            className="inline-flex h-8 items-center gap-1 rounded-md px-2 text-xs font-medium text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            <Trash2 className="h-3.5 w-3.5" /> Clear
          </button>
        ) : null
      }
      footer={
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onHold}
            disabled={cart.length === 0}
            className="shrink-0"
          >
            <Save className="h-4 w-4" /> Hold
          </Button>
          <Button
            type="button"
            onClick={onCharge}
            disabled={cart.length === 0}
            className="flex-1"
          >
            Charge ${totals.total.toFixed(2)} <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      }
    >
      <CartContent
        cart={cart}
        onUpdateQty={onUpdateQty}
        onRemove={onRemove}
        discount={discount}
        discountType={discountType}
        onDiscountChange={onDiscountChange}
        onDiscountTypeChange={onDiscountTypeChange}
        orderTaxPercent={orderTaxPercent}
        onOrderTaxPercentChange={onOrderTaxPercentChange}
        shipping={shipping}
        onShippingChange={onShippingChange}
        serviceFee={serviceFee}
        onServiceFeeChange={onServiceFeeChange}
        totals={totals}
      />

      {/* Customer section, collapsed by default */}
      <button
        type="button"
        onClick={() => setShowCustomer((v) => !v)}
        className="mt-3 inline-flex w-full items-center justify-between rounded-xl border border-dashed border-border bg-muted/30 px-3 py-2 text-xs"
      >
        <span className="font-medium">
          {customer.name ? `Customer: ${customer.name}` : "Add customer (optional)"}
        </span>
        <span className="text-muted-foreground">{showCustomer ? "Hide" : "Show"}</span>
      </button>

      {showCustomer && (
        <div className="mt-2 grid gap-2">
          <Input
            placeholder="Customer name"
            value={customer.name || ""}
            onChange={(e) => onCustomerChange({ ...customer, name: e.target.value })}
          />
          <Input
            type="email"
            placeholder="Email"
            value={customer.email || ""}
            onChange={(e) => onCustomerChange({ ...customer, email: e.target.value })}
          />
          <Input
            type="tel"
            placeholder="Phone"
            value={customer.phone || ""}
            onChange={(e) => onCustomerChange({ ...customer, phone: e.target.value })}
          />
        </div>
      )}
    </BottomSheet>
  )
}
