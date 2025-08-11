"use client"

import * as React from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { PageShell } from "@/components/page-shell"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { BarcodeScannerInput } from "@/components/pos/barcode-scanner-input"
import { InvoicePreview, ReceiptPreview, printInvoiceNode } from "@/components/pos/invoice-print"
import {
  loadCatalog,
  genId,
  genInvoiceNumber,
  saveDraft,
  getDraft,
  saveInvoice,
  type CartItem,
  type CatalogItem,
  type Invoice,
  type PaymentLine,
  seedPosDemo,
} from "@/lib/pos/storage"
import { RecentTransactionsDialog } from "@/components/pos/recent-transactions-dialog"
import { cn } from "@/lib/utils"
import {
  Barcode,
  Printer,
  Save,
  Trash2,
  Minus,
  Plus,
  FileText,
  Layers,
  RotateCcw,
  ShoppingCart,
  Grid3X3,
  CheckCircle2,
  PlusCircle,
  X,
  ArrowLeftRight,
} from "lucide-react"
import { CatalogGrid } from "@/components/pos/catalog-grid"
import { VirtualAccountPanel } from "@/components/pos/virtual-account"
import { listLocations, listCashiersForLocation, findVirtualAccount } from "@/lib/payments/virtual-accounts"
import { CalcPopover } from "@/components/pos/calc-popover"

type PaymentMethod = PaymentLine["method"]

export default function PointOfSale() {
  const router = useRouter()
  const search = useSearchParams()
  const draftIdFromUrl = search.get("draftId")

  // Seed demo data for UI
  React.useEffect(() => {
    seedPosDemo()
  }, [])

  const [mode, setMode] = React.useState<"retail" | "restaurant" | "services" | "auto">("retail")
  const catalog = React.useMemo(() => loadCatalog(mode), [mode])

  const [cart, setCart] = React.useState<CartItem[]>([])
  const [discount, setDiscount] = React.useState(0)
  const [discountType, setDiscountType] = React.useState<"flat" | "percent">("flat")
  const [orderTaxPercent, setOrderTaxPercent] = React.useState<number>(0)
  const [shipping, setShipping] = React.useState<number>(0)
  const [serviceFee, setServiceFee] = React.useState<number>(0)

  const [customer, setCustomer] = React.useState<{ name?: string; email?: string; phone?: string }>({})
  const [globalScan, setGlobalScan] = React.useState(true)

  const [payments, setPayments] = React.useState<PaymentLine[]>([{ method: "cash", amount: 0 }])
  const [mobileTab, setMobileTab] = React.useState<"catalog" | "cart">("catalog")

  // Sales meta
  const [location, setLocation] = React.useState(() => listLocations()[0] || "HQ")
  const [cashier, setCashier] = React.useState(() => listCashiersForLocation(location)[0] || "Alice")
  const [salesperson, setSalesperson] = React.useState("Alice")
  const [channel, setChannel] = React.useState("In-Store")

  React.useEffect(() => {
    if (!draftIdFromUrl) return
    const d = getDraft(draftIdFromUrl)
    if (d) {
      setCart(d.items)
      setDiscount(d.discount || 0)
      setDiscountType(d.discountType || "flat")
      setOrderTaxPercent(d.orderTaxPercent || 0)
      setShipping(d.shipping || 0)
      setServiceFee(d.serviceFee || 0)
      setCustomer(d.customer || {})
      setLocation(d.meta?.location || location)
      setSalesperson(d.meta?.salesperson || salesperson)
      setChannel(d.meta?.channel || channel)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draftIdFromUrl])

  const addItem = React.useCallback((item: CatalogItem, qty = 1) => {
    setCart((prev) => {
      const idx = prev.findIndex((p) => p.sku === item.sku)
      if (idx === -1)
        return [{ id: item.id, sku: item.sku, name: item.name, price: item.price, taxRate: item.taxRate, qty }, ...prev]
      const copy = prev.slice()
      copy[idx] = { ...copy[idx], qty: copy[idx].qty + qty }
      return copy
    })
    setMobileTab("cart")
  }, [])

  const addByBarcode = (code: string) => {
    const found =
      catalog.find((p) => p.barcode && p.barcode === code) ||
      catalog.find((p) => p.sku.toLowerCase() === code.toLowerCase()) ||
      catalog.find((p) => p.name.toLowerCase().includes(code.toLowerCase()))
    if (found) {
      addItem(found, 1)
    } else alert(`No product found for "${code}"`)
  }

  const updateQty = (sku: string, next: number) => {
    setCart((prev) => prev.map((p) => (p.sku === sku ? { ...p, qty: Math.max(0, next) } : p)).filter((p) => p.qty > 0))
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
  }

  const holdSale = () => {
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
    router.push("/pos/drafts")
  }

  // Totals
  const subtotal = cart.reduce((s, i) => s + i.qty * i.price, 0)
  const discountValue = discountType === "percent" ? (subtotal * (discount || 0)) / 100 : discount || 0
  const afterDiscount = Math.max(0, subtotal - discountValue)
  const itemTax = cart.reduce((s, i) => s + (i.taxRate || 0) * i.qty * i.price, 0)
  const orderTax = Math.round(((orderTaxPercent || 0) / 100) * afterDiscount * 100) / 100
  const total = Math.max(
    0,
    Math.round((afterDiscount + itemTax + orderTax + (shipping || 0) + (serviceFee || 0)) * 100) / 100,
  )

  const paidSum = payments.reduce((s, p) => s + (Number.isFinite(p.amount) ? p.amount : 0), 0)
  const remaining = Math.max(0, Math.round((total - paidSum) * 100) / 100)
  const overpay = Math.max(0, Math.round((paidSum - total) * 100) / 100)

  function addPaymentLine() {
    setPayments((ps) => [...ps, { method: "card", amount: 0 }])
  }
  function removePaymentLine(idx: number) {
    setPayments((ps) => ps.filter((_, i) => i !== idx))
  }
  function updatePayment(idx: number, part: Partial<PaymentLine>) {
    setPayments((ps) =>
      ps.map((p, i) => (i === idx ? { ...p, ...part, amount: Number(part.amount ?? p.amount) || 0 } : p)),
    )
  }

  // Confirmation + previews
  const [confirmOpen, setConfirmOpen] = React.useState(false)
  const [previewOpen, setPreviewOpen] = React.useState(false)
  const [receiptOpen, setReceiptOpen] = React.useState(false)
  const [lastInvoice, setLastInvoice] = React.useState<Invoice | null>(null)

  function onConfirmPayment() {
    if (paidSum < total) {
      alert("Payment does not cover total.")
      return
    }
    const augmented: PaymentLine[] = payments.map((p) => ({ ...p }))
    if (overpay > 0) {
      const cashIdx = augmented.findIndex((p) => p.method === "cash")
      if (cashIdx >= 0) augmented[cashIdx].reference = `Change: $${overpay.toFixed(2)}`
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
    setConfirmOpen(false)
    setReceiptOpen(true)
    clearCart()
  }

  return (
    <PageShell title="Point of Sale" withToolbar={false}>
      {/* Mobile tabs */}
      <div className="mb-3 grid grid-cols-2 gap-2 lg:hidden">
        <button
          className={cn(
            "inline-flex items-center justify-center rounded-md border px-3 py-2 text-sm",
            mobileTab === "catalog" ? "bg-violet-600 text-white" : "bg-transparent hover:bg-accent",
          )}
          onClick={() => setMobileTab("catalog")}
        >
          <Grid3X3 className="mr-2 h-4 w-4" /> Catalog
        </button>
        <button
          className={cn(
            "inline-flex items-center justify-center rounded-md border px-3 py-2 text-sm",
            mobileTab === "cart" ? "bg-violet-600 text-white" : "bg-transparent hover:bg-accent",
          )}
          onClick={() => setMobileTab("cart")}
        >
          <ShoppingCart className="mr-2 h-4 w-4" /> Cart ({cart.length})
        </button>
      </div>

      {/* Header actions */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <label className="inline-flex cursor-pointer items-center gap-2">
            <span className="text-muted-foreground">Mode</span>
            <select
              className="h-8 rounded-md border bg-background px-2 text-sm"
              value={mode}
              onChange={(e) => setMode(e.target.value as any)}
            >
              <option value="retail">Retail</option>
              <option value="restaurant">Restaurant</option>
              <option value="services">Services/Salon</option>
              <option value="auto">Auto/Parts</option>
            </select>
          </label>
          <label className="inline-flex cursor-pointer items-center gap-2">
            <span className="text-muted-foreground">Salesperson</span>
            <Input
              className="h-8 w-40"
              value={salesperson}
              onChange={(e) => setSalesperson(e.target.value)}
              placeholder="Name"
            />
          </label>
          <label className="inline-flex cursor-pointer items-center gap-2">
            <span className="text-muted-foreground">Channel</span>
            <select
              className="h-8 rounded-md border bg-background px-2 text-sm"
              value={channel}
              onChange={(e) => setChannel(e.target.value)}
            >
              <option>In-Store</option>
              <option>Phone</option>
              <option>Online</option>
            </select>
          </label>
          <label className="ml-2 inline-flex cursor-pointer items-center gap-2">
            <input
              aria-label="Enable global barcode capture"
              type="checkbox"
              className="accent-violet-600"
              checked={globalScan}
              onChange={(e) => setGlobalScan(e.target.checked)}
            />
            Global scanner
          </label>
        </div>

        <div className="ml-auto flex flex-wrap items-center gap-2">
          <Button variant="outline" className="bg-transparent" onClick={() => router.push("/pos/returns")}>
            <RotateCcw className="mr-2 h-4 w-4" /> Sell Return
          </Button>
          <RecentTransactionsDialog />
          <Button variant="outline" className="bg-transparent" onClick={() => router.push("/pos/invoices")}>
            Invoices
          </Button>
          <Button variant="outline" className="bg-transparent" onClick={() => router.push("/pos/drafts")}>
            <Layers className="mr-2 h-4 w-4" /> Drafts
          </Button>
          <Button variant="outline" className="bg-transparent" onClick={holdSale} disabled={cart.length === 0}>
            <Save className="mr-2 h-4 w-4" /> Suspend
          </Button>
          <Button variant="outline" className="bg-transparent" onClick={clearCart} disabled={cart.length === 0}>
            <Trash2 className="mr-2 h-4 w-4" /> Clear
          </Button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-12">
        {/* Left Panel: Scan + Customer + VA */}
        <section className={cn("space-y-4", mobileTab !== "catalog" ? "hidden lg:block" : "") + " lg:col-span-3"}>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center">
                <Barcode className="mr-2 h-5 w-5" /> Scan or Search
              </CardTitle>
              <CardDescription>Scan a barcode or enter SKU/name</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <BarcodeScannerInput captureGlobal={globalScan} onScan={addByBarcode} />
              <div className="grid grid-cols-1 gap-2">
                <Input
                  placeholder="Enter SKU or name and press Enter"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") addByBarcode((e.target as HTMLInputElement).value)
                  }}
                />
              </div>
              <div className="text-xs text-muted-foreground">
                Tip: Use a keyboard-wedge scanner for instant capture.
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Customer</CardTitle>
              <CardDescription>Attach for receipts/loyalty</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Input
                placeholder="Name"
                value={customer.name || ""}
                onChange={(e) => setCustomer((c) => ({ ...c, name: e.target.value }))}
              />
              <Input
                placeholder="Email"
                value={customer.email || ""}
                onChange={(e) => setCustomer((c) => ({ ...c, email: e.target.value }))}
              />
              <Input
                placeholder="Phone"
                value={customer.phone || ""}
                onChange={(e) => setCustomer((c) => ({ ...c, phone: e.target.value }))}
              />
            </CardContent>
          </Card>

          <VirtualAccountPanel
            location={location}
            cashier={cashier}
            onLocationChange={(loc) => {
              setLocation(loc)
              setCashier(listCashiersForLocation(loc)[0] || "")
            }}
            onCashierChange={setCashier}
          />
        </section>

        {/* Center: Catalog */}
        <section className={cn(mobileTab !== "catalog" ? "hidden lg:block" : "", "lg:col-span-6")}>
          <CatalogGrid catalog={catalog} onAdd={(p) => addItem(p)} businessMode={mode} />
        </section>

        {/* Right: Cart + Checkout */}
        <section className={cn(mobileTab !== "cart" ? "hidden lg:block" : "", "lg:col-span-3 space-y-4")}>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Cart</CardTitle>
              <CardDescription>Items to sell</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="max-h-[36vh] overflow-auto rounded-lg border lg:max-h-[340px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead className="text-right">Qty</TableHead>
                      <TableHead className="text-right">Unit</TableHead>
                      <TableHead className="text-right">Line</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cart.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-muted-foreground">
                          No items yet.
                        </TableCell>
                      </TableRow>
                    ) : (
                      cart.map((c) => (
                        <TableRow key={c.sku}>
                          <TableCell className="font-medium">
                            <div className="line-clamp-1">{c.name}</div>
                            <div className="font-mono text-xs text-muted-foreground">{c.sku}</div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="ml-auto flex items-center justify-end gap-1">
                              <Button
                                variant="outline"
                                className="bg-transparent"
                                size="sm"
                                onClick={() => updateQty(c.sku, c.qty - 1)}
                              >
                                <Minus className="h-3.5 w-3.5" />
                              </Button>
                              <Input
                                className="w-14 text-right"
                                type="number"
                                value={c.qty}
                                onChange={(e) => updateQty(c.sku, Number(e.target.value))}
                                min={0}
                              />
                              <Button
                                variant="outline"
                                className="bg-transparent"
                                size="sm"
                                onClick={() => updateQty(c.sku, c.qty + 1)}
                              >
                                <Plus className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell className="text-right tabular-nums">${c.price.toFixed(2)}</TableCell>
                          <TableCell className="text-right tabular-nums">${(c.qty * c.price).toFixed(2)}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Totals and adjustments */}
              <div className="mt-3 space-y-2 text-sm">
                <Row label="Subtotal" value={`$${subtotal.toFixed(2)}`} />
                <div className="flex items-center justify-between gap-2">
                  <span className="text-muted-foreground">Discount</span>
                  <div className="flex items-center gap-2">
                    <select
                      className="h-8 rounded-md border bg-background px-2 text-sm"
                      value={discountType}
                      onChange={(e) => setDiscountType(e.target.value as any)}
                    >
                      <option value="flat">$</option>
                      <option value="percent">%</option>
                    </select>
                    <Input
                      className="w-24 text-right"
                      type="number"
                      value={discount}
                      onChange={(e) => setDiscount(Math.max(0, Number(e.target.value) || 0))}
                      min={0}
                      step="0.01"
                    />
                  </div>
                </div>
                <Row
                  label="Item Tax"
                  value={`$${cart.reduce((s, i) => s + (i.taxRate || 0) * i.qty * i.price, 0).toFixed(2)}`}
                />
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Order Tax %</span>
                  <Input
                    className="w-24 text-right"
                    type="number"
                    value={orderTaxPercent}
                    onChange={(e) => setOrderTaxPercent(Math.max(0, Number(e.target.value) || 0))}
                    min={0}
                    step="0.1"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <Input
                    className="w-24 text-right"
                    type="number"
                    value={shipping}
                    onChange={(e) => setShipping(Math.max(0, Number(e.target.value) || 0))}
                    min={0}
                    step="0.01"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Service Fee</span>
                  <Input
                    className="w-24 text-right"
                    type="number"
                    value={serviceFee}
                    onChange={(e) => setServiceFee(Math.max(0, Number(e.target.value) || 0))}
                    min={0}
                    step="0.01"
                  />
                </div>
                <div className="flex items-center justify-between text-base font-semibold">
                  <span>Total</span>
                  <span className="tabular-nums">${total.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Payment</CardTitle>
              <CardDescription>Split payments supported</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                {payments.map((p, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <select
                      className="h-9 rounded-md border bg-background px-2 text-sm"
                      value={p.method}
                      onChange={(e) => updatePayment(idx, { method: e.target.value as PaymentMethod })}
                    >
                      <option value="cash">Cash</option>
                      <option value="card">Card</option>
                      <option value="paypal">PayPal</option>
                      <option value="stripe">Stripe</option>
                      <option value="other">Other</option>
                    </select>
                    <Input
                      className="w-28"
                      type="number"
                      placeholder="Amount"
                      value={p.amount}
                      onChange={(e) => updatePayment(idx, { amount: Number(e.target.value) || 0 })}
                    />
                    <Input
                      className="flex-1"
                      placeholder="Reference (opt.)"
                      value={p.reference || ""}
                      onChange={(e) => updatePayment(idx, { reference: e.target.value })}
                    />
                    <Button
                      variant="outline"
                      className="bg-transparent"
                      onClick={() => removePaymentLine(idx)}
                      title="Remove"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <div className="flex items-center gap-2">
                  <Button variant="outline" className="bg-transparent" onClick={addPaymentLine}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Split
                  </Button>
                  <CalcPopover />
                  <div className="ml-auto text-sm">
                    <span className="text-muted-foreground">Due</span>{" "}
                    <span className="tabular-nums">${remaining.toFixed(2)}</span>{" "}
                    {overpay > 0 && (
                      <span className="ml-2 rounded bg-muted px-1.5 py-0.5 text-xs">Overpay ${overpay.toFixed(2)}</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button onClick={() => setConfirmOpen(true)} disabled={cart.length === 0}>
                  <CheckCircle2 className="mr-2 h-4 w-4" /> Confirm Payment
                </Button>
                <Button
                  variant="outline"
                  className="bg-transparent"
                  onClick={() => setPreviewOpen(true)}
                  disabled={cart.length === 0}
                >
                  <FileText className="mr-2 h-4 w-4" /> Invoice Preview
                </Button>
                <Button variant="outline" className="bg-transparent" onClick={holdSale} disabled={cart.length === 0}>
                  <Save className="mr-2 h-4 w-4" /> Draft
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>

      {/* Sticky footer summary on mobile */}
      {cart.length > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t bg-background p-3 shadow-lg lg:hidden">
          <div className="flex items-center justify-between">
            <div className="text-sm">
              <div className="text-muted-foreground">Total</div>
              <div className="text-lg font-semibold tabular-nums">${total.toFixed(2)}</div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" className="bg-transparent" onClick={() => setMobileTab("cart")}>
                <ShoppingCart className="mr-2 h-4 w-4" /> Cart
              </Button>
              <Button onClick={() => setConfirmOpen(true)}>
                <ArrowLeftRight className="mr-2 h-4 w-4" /> Charge
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Payment Dialog */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="max-w-lg">
          <div className="mb-2 text-base font-semibold">Confirm Payment</div>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Total</span>
              <span className="tabular-nums">${total.toFixed(2)}</span>
            </div>
            <div className="rounded-md border bg-muted/50 p-2 text-xs">
              {payments.map((p, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="uppercase">{p.method}</span>
                  <span className="tabular-nums">${p.amount.toFixed(2)}</span>
                </div>
              ))}
              <div className="mt-1 flex items-center justify-between font-medium">
                <span>Paid</span>
                <span className="tabular-nums">${paidSum.toFixed(2)}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Salesperson</span>
              <span>{salesperson}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Location</span>
              <span>{location}</span>
            </div>
            {findVirtualAccount(location, cashier) && (
              <div className="rounded-md border bg-muted/50 p-2">
                <div className="mb-1 text-xs font-medium">Virtual Account (for transfer)</div>
                <div className="text-xs">
                  {findVirtualAccount(location, cashier)?.bank} • {findVirtualAccount(location, cashier)?.accountNumber}{" "}
                  • {findVirtualAccount(location, cashier)?.accountName}
                </div>
              </div>
            )}
          </div>
          <div className="mt-3 flex justify-end gap-2">
            <Button variant="outline" className="bg-transparent" onClick={() => setConfirmOpen(false)}>
              Cancel
            </Button>
            <Button onClick={onConfirmPayment}>
              <CheckCircle2 className="mr-2 h-4 w-4" /> Confirm & Generate
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Invoice Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-4xl">
          <div className="flex items-center justify-between">
            <div className="text-base font-semibold">Invoice Preview</div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                className="bg-transparent"
                onClick={() => {
                  const node = document.getElementById("invoice-print-root")
                  if (!node) return
                  printInvoiceNode(node)
                }}
              >
                <Printer className="mr-2 h-4 w-4" /> Print
              </Button>
              <Button onClick={() => setPreviewOpen(false)}>Close</Button>
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

      {/* Receipt Dialog (after confirmation) */}
      <Dialog open={receiptOpen} onOpenChange={setReceiptOpen}>
        <DialogContent className="max-w-md">
          <div className="mb-2 flex items-center justify-between">
            <div className="text-base font-semibold">Receipt</div>
            {lastInvoice && (
              <Button
                variant="outline"
                className="bg-transparent"
                onClick={() => router.push(`/pos/returns/new?invoiceId=${encodeURIComponent(lastInvoice.id)}`)}
              >
                Create Return
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
              variant="outline"
              className="bg-transparent"
              onClick={() => {
                const node = document.getElementById("receipt-root")
                if (node) printInvoiceNode(node)
              }}
            >
              <Printer className="mr-2 h-4 w-4" /> Print
            </Button>
            <Button onClick={() => setReceiptOpen(false)}>Done</Button>
          </div>
        </DialogContent>
      </Dialog>
    </PageShell>
  )
}

function Row({ label, value, valueNode }: { label: string; value?: string; valueNode?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      {valueNode ?? <span className="tabular-nums">{value}</span>}
    </div>
  )
}
