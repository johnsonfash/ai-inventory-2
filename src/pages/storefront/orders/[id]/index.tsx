import * as React from "react"
import { Link, useParams } from "react-router-dom"
import { toast } from "sonner"
import {
  ArrowLeft,
  Banknote,
  Check,
  CheckCircle2,
  Clock,
  Copy,
  CreditCard,
  Download,
  Mail,
  MapPin,
  MessageCircle,
  Package,
  Phone,
  Printer,
  RefreshCcw,
  Smartphone,
  Truck,
} from "lucide-react"
import { PageShell } from "@/components/page-shell"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { StatusBadge, type StatusTone } from "@/components/lists/status-badge"
import { EmptyState } from "@/components/lists/empty-state"
import { Avatar } from "@/components/avatar"
import { ConnectionChip } from "@/components/integrations/connection-chip"
import { useRegisterPageRefresh } from "@/hooks/use-pull-to-refresh"
import { useCurrency } from "@/contexts/currency"
import { cn } from "@/lib/utils"

// Storefront order detail. Mock data tuned to look like a real
// completed purchase so the UI reads honestly. Real backend will
// fetch by `params.id` from /api/storefront/orders/:id.

type FulfillmentStep =
  | "placed"
  | "paid"
  | "preparing"
  | "shipped"
  | "out-for-delivery"
  | "delivered"

const STEP_LABEL: Record<FulfillmentStep, string> = {
  placed:            "Order placed",
  paid:              "Payment received",
  preparing:         "Preparing for shipment",
  shipped:           "Shipped",
  "out-for-delivery": "Out for delivery",
  delivered:         "Delivered",
}

type Order = {
  id: string
  placedAt: string
  customer: {
    name: string
    email: string
    phone: string
  }
  items: { sku: string; name: string; qty: number; price: number; image: string; variant?: string }[]
  subtotal: number
  shipping: number
  tax: number
  total: number
  promoCode?: string
  promoDiscount?: number
  payment: {
    method: "card" | "transfer" | "wallet" | "cod"
    provider: string
    last4?: string
    status: "paid" | "pending" | "refunded" | "failed"
    paidAt?: string
  }
  shippingAddress: {
    line1: string
    city: string
    state: string
    country: string
    postal: string
  }
  delivery: {
    courier: string
    method: string
    tracking: string
    eta: string
  }
  status: {
    current: FulfillmentStep
    history: { step: FulfillmentStep; at: string; note?: string }[]
  }
  notes?: string
  device: "mobile" | "desktop" | "tablet"
}

const ORDER: Order = {
  id: "SHOP-7849",
  placedAt: "2 hours ago",
  customer: {
    name: "Aisha Nwosu",
    email: "aisha@personal.io",
    phone: "+234 803 555 0118",
  },
  items: [
    { sku: "AP-4012", name: "Adire silk wrap blouse",  qty: 1, price: 24_500, image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=200&h=200&fit=crop&auto=format&q=80", variant: "Size M · Sage" },
    { sku: "BT-9091", name: "Hydrating Serum",          qty: 2, price: 18_000, image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=200&h=200&fit=crop&auto=format&q=80" },
    { sku: "HM-2205", name: "Ceramic Mug 12oz",          qty: 1, price:  8_000, image: "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=200&h=200&fit=crop&auto=format&q=80", variant: "Olive" },
  ],
  subtotal:      68_500,
  shipping:       1_500,
  tax:            5_137,
  total:         70_137,
  promoCode:     "WELCOME10",
  promoDiscount:  5_000,
  payment: {
    method:   "card",
    provider: "Paystack",
    last4:    "4242",
    status:   "paid",
    paidAt:   "2 hours ago",
  },
  shippingAddress: {
    line1:    "12 Admiralty Way",
    city:     "Lekki Phase 1, Lagos",
    state:    "Lagos",
    country:  "Nigeria",
    postal:   "106104",
  },
  delivery: {
    courier:  "GIG Logistics",
    method:   "Standard (2-4 days)",
    tracking: "GIGL-9X4-22001",
    eta:      "Thursday, May 23",
  },
  status: {
    current: "preparing",
    history: [
      { step: "placed",    at: "2h ago", note: "Order created from storefront." },
      { step: "paid",      at: "2h ago", note: "Paystack · card ending 4242" },
      { step: "preparing", at: "1h ago", note: "Picked + packed at Lekki hub." },
    ],
  },
  notes: "Please leave with the security guard if I'm not in.",
  device: "mobile",
}

const PAYMENT_TONE: Record<Order["payment"]["status"], StatusTone> = {
  paid:     "success",
  pending:  "warning",
  refunded: "neutral",
  failed:   "danger",
}

const ALL_STEPS: FulfillmentStep[] = ["placed", "paid", "preparing", "shipped", "out-for-delivery", "delivered"]

export default function StorefrontOrderDetail() {
  const params = useParams<{ id: string }>()
  useRegisterPageRefresh(React.useCallback(async () => { await new Promise((r) => setTimeout(r, 250)) }, []))
  const { formatPrice } = useCurrency()

  // Real backend would lookup by id; we render the mock for any id.
  const order = ORDER
  const orderId = params.id ?? order.id

  if (!order) {
    return (
      <PageShell title="Order" withToolbar={false}>
        <Card>
          <CardContent className="p-0">
            <EmptyState
              Icon={Package}
              title="Order not found"
              description="That order doesn't exist."
              action={<Link to="/storefront/orders"><Button>Back to orders</Button></Link>}
            />
          </CardContent>
        </Card>
      </PageShell>
    )
  }

  const copy = async (val: string, label: string) => {
    try {
      await navigator.clipboard.writeText(val)
      toast.success(`${label} copied`)
    } catch {
      toast.error("Couldn't copy")
    }
  }

  const currentIdx = ALL_STEPS.indexOf(order.status.current)

  return (
    <PageShell
      title={`Order ${orderId}`}
      withToolbar={false}
      titleTooltip={
        <>
          Full lifecycle of one storefront order — items, customer,
          payment, delivery, status timeline. Use the action bar to
          email the customer, print a label, refund, or jump to the
          courier's tracking page.
        </>
      }
    >
      <div className="flex flex-col gap-4">
        {/* Back link */}
        <Link to="/storefront/orders" className="inline-flex w-fit items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-3.5 w-3.5" /> All storefront orders
        </Link>

        {/* Header — id + status + actions */}
        <section className="flex flex-wrap items-start justify-between gap-3 rounded-2xl border border-border bg-card p-4">
          <div className="flex items-start gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand dark:bg-primary/15 dark:text-primary">
              <Package className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-1.5">
                <h2 className="font-mono text-base font-bold tracking-tight md:text-lg">{orderId}</h2>
                <StatusBadge tone={PAYMENT_TONE[order.payment.status]} withDot>{order.payment.status}</StatusBadge>
                <StatusBadge tone="brand" withDot>{STEP_LABEL[order.status.current]}</StatusBadge>
              </div>
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                Placed {order.placedAt} · {order.items.length} items · {formatPrice(order.total)}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <a href={`mailto:${order.customer.email}`}>
              <Button size="sm" variant="outline"><Mail className="h-3.5 w-3.5" /> Email customer</Button>
            </a>
            <a href={`https://wa.me/${order.customer.phone.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer">
              <Button size="sm" variant="outline"><MessageCircle className="h-3.5 w-3.5" /> WhatsApp</Button>
            </a>
            <Button size="sm" variant="outline" onClick={() => toast("Print arrives with the backend.")}>
              <Printer className="h-3.5 w-3.5" /> Print
            </Button>
          </div>
        </section>

        {/* Two-col on desktop: timeline + items left, customer + payment + summary right */}
        <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
          <div className="flex flex-col gap-4">
            {/* Status timeline */}
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h3 className="text-sm font-semibold md:text-base">Delivery progress</h3>
                  <ConnectionChip providerId="gig-logistics" />
                </div>
                <p className="text-[11px] text-muted-foreground">ETA: {order.delivery.eta} · via {order.delivery.courier}</p>

                {/* Horizontal step bar — mobile-friendly */}
                <ol className="mt-4 flex items-start gap-1 overflow-x-auto pb-1 scrollbar-hide md:gap-0">
                  {ALL_STEPS.map((step, idx) => {
                    const done = idx <= currentIdx
                    const active = idx === currentIdx
                    return (
                      <li key={step} className="flex min-w-[100px] flex-1 flex-col items-center gap-1 md:min-w-0">
                        <div className="flex w-full items-center">
                          <div className="h-0.5 flex-1 md:h-1">
                            {idx > 0 && (
                              <div className={cn("h-full w-full", done ? "bg-emerald-500" : "bg-muted")} />
                            )}
                          </div>
                          <span className={cn(
                            "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold",
                            done ? "bg-emerald-500 text-white" : "bg-muted text-muted-foreground",
                            active && "ring-4 ring-emerald-500/20",
                          )}>
                            {done ? <Check className="h-3 w-3" strokeWidth={3} /> : idx + 1}
                          </span>
                          <div className="h-0.5 flex-1 md:h-1">
                            {idx < ALL_STEPS.length - 1 && (
                              <div className={cn("h-full w-full", idx < currentIdx ? "bg-emerald-500" : "bg-muted")} />
                            )}
                          </div>
                        </div>
                        <span className={cn(
                          "px-1 text-center text-[10px] font-semibold leading-tight",
                          done ? "text-foreground" : "text-muted-foreground",
                        )}>
                          {STEP_LABEL[step]}
                        </span>
                      </li>
                    )
                  })}
                </ol>

                {/* Tracking number + courier link */}
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-background p-3">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Tracking</p>
                    <button onClick={() => copy(order.delivery.tracking, "Tracking")} className="inline-flex items-center gap-1 font-mono text-sm font-bold hover:underline">
                      {order.delivery.tracking} <Copy className="h-3 w-3" />
                    </button>
                  </div>
                  <a href={`https://giglogistics.com/track?id=${order.delivery.tracking}`} target="_blank" rel="noopener noreferrer">
                    <Button size="sm" variant="outline"><Truck className="h-3.5 w-3.5" /> Track with {order.delivery.courier}</Button>
                  </a>
                </div>

                {/* History timeline */}
                <ul className="mt-4 space-y-2.5">
                  {order.status.history.slice().reverse().map((h, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
                        <CheckCircle2 className="h-3 w-3" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-baseline justify-between gap-2">
                          <p className="text-xs font-semibold">{STEP_LABEL[h.step]}</p>
                          <p className="text-[10px] text-muted-foreground">{h.at}</p>
                        </div>
                        {h.note && <p className="text-[11px] text-muted-foreground">{h.note}</p>}
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Items */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-baseline justify-between gap-2">
                  <h3 className="text-sm font-semibold md:text-base">Items</h3>
                  <p className="text-[11px] text-muted-foreground">{order.items.length} items</p>
                </div>
                <ul className="mt-3 divide-y divide-border">
                  {order.items.map((it) => (
                    <li key={it.sku} className="flex items-center gap-3 py-2.5">
                      <img
                        src={it.image}
                        alt={it.name}
                        loading="lazy"
                        crossOrigin="anonymous"
                        referrerPolicy="no-referrer"
                        className="h-14 w-14 shrink-0 rounded-lg object-cover ring-1 ring-border"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold">{it.name}</p>
                        <p className="truncate text-[11px] text-muted-foreground">
                          {it.sku} · Qty {it.qty}{it.variant && ` · ${it.variant}`}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold tabular-nums">{formatPrice(it.price * it.qty)}</p>
                        {it.qty > 1 && (
                          <p className="text-[10px] text-muted-foreground">{formatPrice(it.price)} each</p>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
                {order.notes && (
                  <div className="mt-3 rounded-xl border border-dashed border-border bg-muted/30 p-3 text-xs">
                    <p className="font-semibold text-foreground">Customer note</p>
                    <p className="mt-1 text-muted-foreground">"{order.notes}"</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right rail */}
          <aside className="flex flex-col gap-4">
            {/* Customer */}
            <Card>
              <CardContent className="p-4">
                <h3 className="text-sm font-semibold md:text-base">Customer</h3>
                <div className="mt-3 flex items-center gap-3">
                  <Avatar seed={order.customer.email} name={order.customer.name} size={44} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{order.customer.name}</p>
                    <p className="truncate text-[11px] text-muted-foreground">{order.customer.email}</p>
                  </div>
                </div>
                <ul className="mt-3 space-y-1.5 text-xs">
                  <li className="flex items-center gap-2">
                    <Phone className="h-3 w-3 text-muted-foreground" />
                    <a href={`tel:${order.customer.phone}`} className="font-mono hover:underline">{order.customer.phone}</a>
                  </li>
                  <li className="flex items-center gap-2">
                    <Smartphone className="h-3 w-3 text-muted-foreground" />
                    <span className="text-muted-foreground">Ordered from {order.device}</span>
                  </li>
                </ul>
                <Link to="/storefront/customers" className="mt-3 inline-flex items-center gap-1 text-[11px] font-semibold text-brand hover:underline dark:text-primary">
                  View customer profile →
                </Link>
              </CardContent>
            </Card>

            {/* Shipping address */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-baseline justify-between gap-2">
                  <h3 className="text-sm font-semibold md:text-base">Shipping address</h3>
                  <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                </div>
                <address className="mt-2 not-italic text-xs leading-relaxed">
                  <p className="font-semibold">{order.customer.name}</p>
                  <p>{order.shippingAddress.line1}</p>
                  <p>{order.shippingAddress.city}</p>
                  <p>{order.shippingAddress.postal} · {order.shippingAddress.country}</p>
                </address>
                <p className="mt-2 text-[10px] text-muted-foreground">
                  {order.delivery.method}
                </p>
              </CardContent>
            </Card>

            {/* Payment */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-baseline justify-between gap-2">
                  <h3 className="text-sm font-semibold md:text-base">Payment</h3>
                  <StatusBadge tone={PAYMENT_TONE[order.payment.status]} withDot>{order.payment.status}</StatusBadge>
                </div>
                <div className="mt-3 flex items-center gap-3 rounded-xl border border-border bg-background p-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-soft text-brand dark:bg-primary/15 dark:text-primary">
                    {order.payment.method === "card" ? <CreditCard className="h-4 w-4" /> : <Banknote className="h-4 w-4" />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold">{order.payment.provider}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {order.payment.method === "card" && order.payment.last4 && `Card ending ${order.payment.last4}`}
                      {order.payment.paidAt && ` · ${order.payment.paidAt}`}
                    </p>
                  </div>
                </div>
                {order.payment.status === "paid" && (
                  <Button size="sm" variant="outline" className="mt-3 w-full border-rose-500/40 text-rose-600 dark:text-rose-400" onClick={() => toast("Refund flow arrives with the backend.")}>
                    <RefreshCcw className="h-3.5 w-3.5" /> Refund order
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Order summary */}
            <Card>
              <CardContent className="p-4">
                <h3 className="text-sm font-semibold md:text-base">Summary</h3>
                <dl className="mt-3 space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Subtotal</dt>
                    <dd className="tabular-nums">{formatPrice(order.subtotal)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Shipping</dt>
                    <dd className="tabular-nums">{formatPrice(order.shipping)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">VAT (7.5%)</dt>
                    <dd className="tabular-nums">{formatPrice(order.tax)}</dd>
                  </div>
                  {order.promoCode && order.promoDiscount && (
                    <div className="flex justify-between text-emerald-700 dark:text-emerald-300">
                      <dt>Promo <code className="rounded bg-emerald-500/15 px-1 py-0.5 font-mono text-[10px]">{order.promoCode}</code></dt>
                      <dd className="tabular-nums">−{formatPrice(order.promoDiscount)}</dd>
                    </div>
                  )}
                  <div className="flex justify-between border-t border-border pt-2 text-base font-bold">
                    <dt>Total</dt>
                    <dd className="tabular-nums">{formatPrice(order.total)}</dd>
                  </div>
                </dl>
                <Button size="sm" variant="outline" className="mt-3 w-full" onClick={() => toast("Receipt download arrives with the backend.")}>
                  <Download className="h-3.5 w-3.5" /> Download receipt
                </Button>
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </PageShell>
  )
}

void Clock
