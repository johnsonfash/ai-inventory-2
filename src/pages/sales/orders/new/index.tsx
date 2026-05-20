import * as React from "react"
import { ClipboardList, Plus, Trash2, User, Wallet } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { FormShell } from "@/components/forms/form-shell"
import { FormSection } from "@/components/forms/form-section"
import { FormGrid } from "@/components/forms/form-grid"
import { FormField } from "@/components/forms/form-field"
import { FormFooter } from "@/components/forms/form-footer"
import { FormAside } from "@/components/forms/form-aside"
import { InputAddon } from "@/components/forms/input-addon"
import { useCurrency } from "@/contexts/currency"

type Line = { id: string; sku: string; qty: number; price: number }

let lineSeq = 0
const newLine = (): Line => ({ id: `L-${++lineSeq}`, sku: "", qty: 1, price: 0 })

export default function NewOrder() {
  const [lines, setLines] = React.useState<Line[]>([newLine()])
  const [submitting, setSubmitting] = React.useState(false)
  const { formatPrice, symbol } = useCurrency()

  const subtotal = lines.reduce((s, l) => s + l.qty * l.price, 0)
  const tax = subtotal * 0.075
  const total = subtotal + tax

  const update = (id: string, patch: Partial<Line>) =>
    setLines((p) => p.map((l) => (l.id === id ? { ...l, ...patch } : l)))
  const remove = (id: string) => setLines((p) => p.filter((l) => l.id !== id))

  return (
    <FormShell
      title="Create sales order"
      description="Capture customer, items, and totals before fulfilment."
      backHref="/sales/orders"
      onSubmit={() => {
        setSubmitting(true)
        setTimeout(() => setSubmitting(false), 600)
      }}
      aside={
        <FormAside title="Summary">
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Subtotal</dt>
              <dd className="font-medium tabular-nums">{formatPrice(subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Tax (7.5%)</dt>
              <dd className="font-medium tabular-nums">{formatPrice(tax)}</dd>
            </div>
            <div className="mt-2 flex items-baseline justify-between border-t border-border pt-2">
              <dt className="font-semibold">Total</dt>
              <dd className="text-lg font-bold tabular-nums">{formatPrice(total)}</dd>
            </div>
            <p className="pt-3 text-[11px] text-muted-foreground">
              Tax rate is taken from Settings → Taxes. Edit lines or items above to change the total.
            </p>
          </dl>
        </FormAside>
      }
      footer={<FormFooter submitLabel="Create order" submitting={submitting} cancelHref="/sales/orders" />}
    >
      <FormSection title="Customer" description="Who this order is for" Icon={User}>
        <FormGrid cols={3}>
          <FormField label="Customer" required span={2}>
            <Select defaultValue="nova">
              <SelectTrigger><SelectValue placeholder="Pick a customer" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="nova">NovaApps</SelectItem>
                <SelectItem value="bright">BrightLane</SelectItem>
                <SelectItem value="acme">Acme Co</SelectItem>
                <SelectItem value="walkin">Walk-in</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
          <FormField label="Order number" hint="Auto-generated if blank.">
            <Input placeholder="SO-7850" />
          </FormField>
          <FormField label="Order date" required>
            <Input type="date" defaultValue={new Date().toISOString().slice(0, 10)} required />
          </FormField>
          <FormField label="Channel">
            <Select defaultValue="online">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="online">Online</SelectItem>
                <SelectItem value="retail">Retail</SelectItem>
                <SelectItem value="wholesale">Wholesale</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
          <FormField label="Currency">
            <Select defaultValue="USD">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="USD">USD</SelectItem>
                <SelectItem value="EUR">EUR</SelectItem>
                <SelectItem value="GBP">GBP</SelectItem>
                <SelectItem value="NGN">NGN</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
        </FormGrid>
      </FormSection>

      <FormSection
        title="Line items"
        description="Products on this order"
        Icon={ClipboardList}
        trailing={
          <Button type="button" variant="outline" size="sm" onClick={() => setLines((p) => [...p, newLine()])}>
            <Plus className="h-3.5 w-3.5" /> Add line
          </Button>
        }
      >
        <ul className="space-y-3">
          {lines.map((l, idx) => (
            <li key={l.id} className="rounded-xl border border-border bg-background p-3">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">Item {idx + 1}</span>
                {lines.length > 1 && (
                  <button
                    type="button"
                    onClick={() => remove(l.id)}
                    className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground"
                    aria-label="Remove line"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
              <FormGrid cols={3}>
                <FormField label="SKU" required span={2}>
                  <Input
                    placeholder="EL-2109"
                    value={l.sku}
                    onChange={(e) => update(l.id, { sku: e.target.value })}
                    required
                  />
                </FormField>
                <FormField label="Qty" required>
                  <Input
                    type="number"
                    min={1}
                    value={l.qty}
                    onChange={(e) => update(l.id, { qty: Number(e.target.value) || 0 })}
                    required
                  />
                </FormField>
                <FormField label="Unit price" required>
                  <InputAddon leading={symbol}>
                    <input
                      type="number"
                      step="0.01"
                      value={l.price}
                      onChange={(e) => update(l.id, { price: Number(e.target.value) || 0 })}
                      required
                    />
                  </InputAddon>
                </FormField>
                <FormField label="Line total" span={2}>
                  <div className="flex h-10 items-center rounded-lg border border-input bg-muted/40 px-3 text-sm font-semibold tabular-nums">
                    {formatPrice(l.qty * l.price)}
                  </div>
                </FormField>
              </FormGrid>
            </li>
          ))}
        </ul>
      </FormSection>

      <FormSection title="Notes & payment" Icon={Wallet}>
        <FormGrid cols={2}>
          <FormField label="Payment terms">
            <Select defaultValue="net14">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="immediate">Immediate</SelectItem>
                <SelectItem value="net7">Net 7</SelectItem>
                <SelectItem value="net14">Net 14</SelectItem>
                <SelectItem value="net30">Net 30</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
          <FormField label="Sales rep">
            <Select defaultValue="">
              <SelectTrigger><SelectValue placeholder="Unassigned" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="mia">Mia Chen</SelectItem>
                <SelectItem value="alex">Alex Larson</SelectItem>
                <SelectItem value="priya">Priya Patel</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
          <FormField label="Customer-facing notes" span={2} hint="Shown on the invoice and order confirmation.">
            <Textarea placeholder="Thanks for your order!" />
          </FormField>
        </FormGrid>
      </FormSection>
    </FormShell>
  )
}
