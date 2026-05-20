import { ArrowRight, Save, ShoppingCart, Trash2 } from "lucide-react"
import type { CartItem } from "@/lib/pos/storage"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useCurrency } from "@/contexts/currency"
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
  cart: CartItem[]
  customer: { name?: string; email?: string; phone?: string }
  onCustomerChange: (next: { name?: string; email?: string; phone?: string }) => void
  onUpdateQty: (sku: string, next: number) => void
  onRemove: (sku: string) => void
  onClearCart: () => void
  onHold: () => void
  onCharge: () => void
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
}

// Desktop / tablet cart panel. Sticky to the viewport so it stays
// visible while the catalog scrolls.
export function CartPanel({
  cart,
  customer,
  onCustomerChange,
  onUpdateQty,
  onRemove,
  onClearCart,
  onHold,
  onCharge,
  totals,
  ...rest
}: Props) {
  const itemCount = cart.reduce((s, c) => s + c.qty, 0)
  const { formatPrice } = useCurrency()

  return (
    <div className="sticky top-20 flex flex-col gap-3">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <CardTitle className="flex items-center gap-2 text-base">
                <ShoppingCart className="h-4 w-4 text-brand dark:text-primary" /> Cart
              </CardTitle>
              <CardDescription>
                {itemCount === 0 ? "No items yet" : `${itemCount} ${itemCount === 1 ? "item" : "items"}`}
              </CardDescription>
            </div>
            {cart.length > 0 && (
              <button
                type="button"
                onClick={onClearCart}
                className="inline-flex h-8 items-center gap-1 rounded-md px-2 text-xs font-medium text-muted-foreground hover:bg-accent hover:text-foreground"
              >
                <Trash2 className="h-3.5 w-3.5" /> Clear
              </button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-3 pt-0">
          <CartContent cart={cart} onUpdateQty={onUpdateQty} onRemove={onRemove} totals={totals} {...rest} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Customer</CardTitle>
          <CardDescription>Optional — attaches to receipt</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 pt-0">
          <Input
            placeholder="Name"
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
        </CardContent>
      </Card>

      <div className="flex items-center gap-2">
        <Button type="button" variant="outline" onClick={onHold} disabled={cart.length === 0} className="flex-1">
          <Save className="h-4 w-4" /> Hold
        </Button>
        <Button type="button" onClick={onCharge} disabled={cart.length === 0} className="flex-[2]">
          Charge {formatPrice(totals.total)} <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
