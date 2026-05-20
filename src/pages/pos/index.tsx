import * as React from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import {
  Barcode,
  CheckCircle2,
  ClipboardList,
  FileText,
  Layers,
  Printer,
  RotateCcw,
  Settings2,
} from "lucide-react"
import { PageShell } from "@/components/page-shell"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { BarcodeScannerInput } from "@/components/pos/barcode-scanner-input"
import { InvoicePreview, ReceiptPreview, printInvoiceNode } from "@/components/pos/invoice-print"
import { CatalogGrid } from "@/components/pos/catalog-grid"
import { FloatingCart } from "@/components/pos/floating-cart"
import { CartSheet } from "@/components/pos/cart-sheet"
import { CartPanel } from "@/components/pos/cart-panel"
import { CheckoutSheet } from "@/components/pos/checkout-sheet"
import { PosSettingsSheet } from "@/components/pos/pos-settings-sheet"
import { useIsMobile } from "@/hooks/use-mobile"
import {
  findVirtualAccount,
  listCashiersForLocation,
  listLocations,
} from "@/lib/payments/virtual-accounts"
import {
  genId,
  genInvoiceNumber,
  getDraft,
  loadCatalog,
  saveDraft,
  saveInvoice,
  seedPosDemo,
  type CartItem,
  type CatalogItem,
  type Invoice,
  type PaymentLine,
} from "@/lib/pos/storage"
import { cn } from "@/lib/utils"
import { useCurrency } from "@/contexts/currency"

type Mode = "retail" | "restaurant" | "services" | "auto"

export default function PointOfSale() {
  const navigate = useNavigate()
  const [search] = useSearchParams()
  const draftIdFromUrl = search.get("draftId")
  const isMobile = useIsMobile()
  const { formatPrice } = useCurrency()

  React.useEffect(() => {
    seedPosDemo()
  }, [])

  // ----- Session settings -----
  const [mode, setMode] = React.useState<Mode>("retail")
  const [salesperson, setSalesperson] = React.useState("Alice")
  const [channel, setChannel] = React.useState("In-Store")
  const [globalScan, setGlobalScan] = React.useState(true)
  const [location, setLocation] = React.useState(() => listLocations()[0] || "HQ")
  const [cashier, setCashier] = React.useState(() => listCashiersForLocation(location)[0] || "Alice")

  const catalog = React.useMemo(() => loadCatalog(mode), [mode])

  // ----- Cart + customer -----
  const [cart, setCart] = React.useState<CartItem[]>([])
  const [customer, setCustomer] = React.useState<{ name?: string; email?: string; phone?: string }>({})

  // ----- Pricing adjustments -----
  const [discount, setDiscount] = React.useState(0)
  const [discountType, setDiscountType] = React.useState<"flat" | "percent">("flat")
  const [orderTaxPercent, setOrderTaxPercent] = React.useState(0)
  const [shipping, setShipping] = React.useState(0)
  const [serviceFee, setServiceFee] = React.useState(0)

  // ----- Payments -----
  const [payments, setPayments] = React.useState<PaymentLine[]>([{ method: "cash", amount: 0 }])

  // ----- Sheets / dialogs -----
  const [cartOpen, setCartOpen] = React.useState(false)
  const [checkoutOpen, setCheckoutOpen] = React.useState(false)
  const [settingsOpen, setSettingsOpen] = React.useState(false)
  const [previewOpen, setPreviewOpen] = React.useState(false)
  const [receiptOpen, setReceiptOpen] = React.useState(false)
  const [lastInvoice, setLastInvoice] = React.useState<Invoice | null>(null)

  // ----- Restore draft if `?draftId=...` was passed in -----
  React.useEffect(() => {
    if (!draftIdFromUrl) return
    const d = getDraft(draftIdFromUrl)
    if (!d) return
    setCart(d.items)
    setDiscount(d.discount || 0)
    setDiscountType(d.discountType || "flat")
    setOrderTaxPercent(d.orderTaxPercent || 0)
    setShipping(d.shipping || 0)
    setServiceFee(d.serviceFee || 0)
    setCustomer(d.customer || {})
    if (d.meta?.location) setLocation(d.meta.location)
    if (d.meta?.salesperson) setSalesperson(d.meta.salesperson)
    if (d.meta?.channel) setChannel(d.meta.channel)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draftIdFromUrl])

  // ----- Cart mutations -----
  const addItem = React.useCallback((item: CatalogItem, qty = 1) => {
    setCart((prev) => {
      const idx = prev.findIndex((p) => p.sku === item.sku)
      if (idx === -1) {
        return [
          { id: item.id, sku: item.sku, name: item.name, price: item.price, taxRate: item.taxRate, qty },
          ...prev,
        ]
      }
      const copy = prev.slice()
      copy[idx] = { ...copy[idx]!, qty: copy[idx]!.qty + qty }
      return copy
    })
  }, [])

  const addByBarcode = (code: string) => {
    const found =
      catalog.find((p) => p.barcode && p.barcode === code) ||
      catalog.find((p) => p.sku.toLowerCase() === code.toLowerCase()) ||
      catalog.find((p) => p.name.toLowerCase().includes(code.toLowerCase()))
    if (found) addItem(found, 1)
    else alert(`No product found for "${code}"`)
  }

  const updateQty = (sku: string, next: number) => {
    setCart((prev) =>
      prev.map((p) => (p.sku === sku ? { ...p, qty: Math.max(0, next) } : p)).filter((p) => p.qty > 0),
    )
  }
  const removeItem = (sku: string) => setCart((prev) => prev.filter((p) => p.sku !== sku))

  const clearCart = () => {
    setCart([])
    setDiscount(0)
    setShipping(0)
    setServiceFee(0)
    setOrderTaxPercent(0)
    setDiscountType("flat")
    setPayments([{ method: "cash", amount: 0 }])
    setCustomer({})
  }

  const holdSale = () => {
    if (cart.length === 0) return
    const id = genId("draft")
    saveDraft({
      id,
      createdAt: Date.now(),
      note: `Held sale with ${cart.length} item(s)`,
      items: cart,
      discount,
      discountType,
      orderTaxPercent,
      shipping,
      serviceFee,
      customer,
      meta: { location, salesperson, channel },
    })
    setCartOpen(false)
    navigate("/pos/drafts")
  }

  // ----- Totals -----
  const subtotal = cart.reduce((s, i) => s + i.qty * i.price, 0)
  const discountValue = discountType === "percent" ? (subtotal * (discount || 0)) / 100 : discount || 0
  const afterDiscount = Math.max(0, subtotal - discountValue)
  const itemTax = cart.reduce((s, i) => s + (i.taxRate || 0) * i.qty * i.price, 0)
  const orderTax = Math.round(((orderTaxPercent || 0) / 100) * afterDiscount * 100) / 100
  const total = Math.max(
    0,
    Math.round((afterDiscount + itemTax + orderTax + (shipping || 0) + (serviceFee || 0)) * 100) / 100,
  )

  const totals = { subtotal, itemTax, orderTax, shipping, serviceFee, discountValue, total }

  // ----- Payment helpers -----
  const addPayment = () => setPayments((ps) => [...ps, { method: "card", amount: 0 }])
  const removePayment = (idx: number) => setPayments((ps) => ps.filter((_, i) => i !== idx))
  const updatePayment = (idx: number, part: Partial<PaymentLine>) =>
    setPayments((ps) =>
      ps.map((p, i) =>
        i === idx ? { ...p, ...part, amount: Number(part.amount ?? p.amount) || 0 } : p,
      ),
    )

  // ----- Confirm sale -----
  const onConfirmPayment = () => {
    const paid = payments.reduce((s, p) => s + (Number.isFinite(p.amount) ? p.amount : 0), 0)
    if (paid < total) return // button is disabled in this case anyway
    const change = Math.max(0, Math.round((paid - total) * 100) / 100)
    const augmented: PaymentLine[] = payments.map((p) => ({ ...p }))
    if (change > 0) {
      const cashIdx = augmented.findIndex((p) => p.method === "cash")
      if (cashIdx >= 0) augmented[cashIdx]!.reference = `Change: ${formatPrice(change)}`
    }
    const invoice: Invoice = {
      id: genId("inv"),
      number: genInvoiceNumber(),
      createdAt: Date.now(),
      customer,
      items: cart,
      subtotal,
      discount: discount || 0,
      discountType,
      orderTaxPercent: orderTaxPercent || 0,
      itemTax,
      orderTax,
      shipping: shipping || 0,
      serviceFee: serviceFee || 0,
      total,
      payments: augmented,
      meta: { location, salesperson, channel },
    }
    saveInvoice(invoice)
    setLastInvoice(invoice)
    setCheckoutOpen(false)
    setCartOpen(false)
    setReceiptOpen(true)
    clearCart()
  }

  const va = findVirtualAccount(location, cashier)
  const itemCount = cart.reduce((s, c) => s + c.qty, 0)

  return (
    <PageShell
      title="Point of sale"
      withToolbar={false}
      mobileTrailing={
        <button
          type="button"
          onClick={() => setSettingsOpen(true)}
          aria-label="POS settings"
          className="inline-flex h-9 w-9 items-center justify-center rounded-full text-foreground/80 hover:bg-accent active:bg-accent/70"
        >
          <Settings2 className="h-4 w-4" />
        </button>
      }
    >
      <div className="flex flex-col gap-4">
        {/* Quick action strip — drafts, invoices, returns, settings */}
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 scrollbar-hide md:mx-0 md:px-0">
          <PosQuickChip Icon={Layers} label="Drafts" onClick={() => navigate("/pos/drafts")} />
          <PosQuickChip Icon={ClipboardList} label="Invoices" onClick={() => navigate("/pos/invoices")} />
          <PosQuickChip Icon={RotateCcw} label="Returns" onClick={() => navigate("/pos/returns")} />
          <PosQuickChip Icon={Settings2} label={`${mode} · ${location}`} onClick={() => setSettingsOpen(true)} className="hidden md:inline-flex" />
        </div>

        {/* Scan bar */}
        <div className="rounded-2xl border border-border bg-card p-3">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-soft text-brand dark:bg-primary/15 dark:text-primary">
              <Barcode className="h-4 w-4" />
            </span>
            <div className="flex-1">
              <BarcodeScannerInput captureGlobal={globalScan} onScan={addByBarcode} />
            </div>
          </div>
          <Input
            placeholder="…or type SKU / name and press Enter"
            className="mt-2"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                const v = (e.target as HTMLInputElement).value.trim()
                if (v) {
                  addByBarcode(v)
                  ;(e.target as HTMLInputElement).value = ""
                }
              }
            }}
          />
        </div>

        {/* Catalog + (desktop) cart panel */}
        <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
          <CatalogGrid catalog={catalog} onAdd={addItem} businessMode={mode} cart={cart} />

          <aside className="hidden lg:block">
            <CartPanel
              cart={cart}
              customer={customer}
              onCustomerChange={setCustomer}
              onUpdateQty={updateQty}
              onRemove={removeItem}
              onClearCart={clearCart}
              onHold={holdSale}
              onCharge={() => setCheckoutOpen(true)}
              discount={discount}
              discountType={discountType}
              onDiscountChange={setDiscount}
              onDiscountTypeChange={setDiscountType}
              orderTaxPercent={orderTaxPercent}
              onOrderTaxPercentChange={setOrderTaxPercent}
              shipping={shipping}
              onShippingChange={setShipping}
              serviceFee={serviceFee}
              onServiceFeeChange={setServiceFee}
              totals={totals}
            />
          </aside>
        </div>

        {/* Invoice preview button on desktop */}
        <div className="hidden justify-end md:flex">
          <Button
            type="button"
            variant="outline"
            onClick={() => setPreviewOpen(true)}
            disabled={cart.length === 0}
          >
            <FileText className="h-4 w-4" /> Invoice preview
          </Button>
        </div>
      </div>

      {/* Mobile floating cart pill */}
      {isMobile && (
        <FloatingCart itemCount={itemCount} total={total} onOpen={() => setCartOpen(true)} />
      )}

      {/* Mobile sheets */}
      <CartSheet
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        cart={cart}
        customer={customer}
        onCustomerChange={setCustomer}
        onUpdateQty={updateQty}
        onRemove={removeItem}
        onClearCart={clearCart}
        onHold={holdSale}
        discount={discount}
        discountType={discountType}
        onDiscountChange={setDiscount}
        onDiscountTypeChange={setDiscountType}
        orderTaxPercent={orderTaxPercent}
        onOrderTaxPercentChange={setOrderTaxPercent}
        shipping={shipping}
        onShippingChange={setShipping}
        serviceFee={serviceFee}
        onServiceFeeChange={setServiceFee}
        totals={totals}
        onCharge={() => {
          setCartOpen(false)
          setCheckoutOpen(true)
        }}
      />

      <CheckoutSheet
        open={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        total={total}
        payments={payments}
        onAddPayment={addPayment}
        onRemovePayment={removePayment}
        onUpdatePayment={updatePayment}
        onConfirm={onConfirmPayment}
        virtualAccount={va ?? null}
      />

      <PosSettingsSheet
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        mode={mode}
        onModeChange={setMode}
        salesperson={salesperson}
        onSalespersonChange={setSalesperson}
        channel={channel}
        onChannelChange={setChannel}
        location={location}
        locations={listLocations()}
        onLocationChange={(l) => {
          setLocation(l)
          setCashier(listCashiersForLocation(l)[0] || "")
        }}
        cashier={cashier}
        cashiers={listCashiersForLocation(location)}
        onCashierChange={setCashier}
        globalScan={globalScan}
        onGlobalScanChange={setGlobalScan}
      />

      {/* Invoice preview (desktop) */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-4xl">
          <div className="flex items-center justify-between">
            <p className="text-base font-semibold">Invoice preview</p>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  const node = document.getElementById("invoice-print-root")
                  if (node) printInvoiceNode(node)
                }}
              >
                <Printer className="h-4 w-4" /> Print
              </Button>
              <Button type="button" onClick={() => setPreviewOpen(false)}>Close</Button>
            </div>
          </div>
          <div id="invoice-print-root">
            <InvoicePreview
              invoice={{
                id: "preview",
                number: genInvoiceNumber(),
                createdAt: Date.now(),
                customer,
                items: cart,
                subtotal,
                discount: discount || 0,
                discountType,
                orderTaxPercent,
                itemTax,
                orderTax,
                shipping,
                serviceFee,
                total,
                payments: payments.map((p) => ({ ...p })),
                meta: { location, salesperson, channel },
              }}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Receipt dialog after a successful sale */}
      <Dialog open={receiptOpen} onOpenChange={setReceiptOpen}>
        <DialogContent className="max-w-md">
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              <p className="text-base font-semibold">Sale complete</p>
            </div>
            {lastInvoice && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  navigate(`/pos/returns/new?invoiceId=${encodeURIComponent(lastInvoice.id)}`)
                }
              >
                Refund
              </Button>
            )}
          </div>
          {lastInvoice ? (
            <div id="receipt-root">
              <ReceiptPreview invoice={lastInvoice} />
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">No receipt to show.</div>
          )}
          <div className="mt-3 flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                const node = document.getElementById("receipt-root")
                if (node) printInvoiceNode(node)
              }}
            >
              <Printer className="h-4 w-4" /> Print
            </Button>
            <Button type="button" onClick={() => setReceiptOpen(false)}>Done</Button>
          </div>
        </DialogContent>
      </Dialog>
    </PageShell>
  )
}

function PosQuickChip({
  Icon,
  label,
  onClick,
  className,
}: {
  Icon: React.ElementType
  label: string
  onClick: () => void
  className?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-accent",
        className,
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      <span className="capitalize">{label}</span>
    </button>
  )
}
