import * as React from "react"
import { CalendarDays, ClipboardList, Plus, Trash2, Truck } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FormShell } from "@/components/forms/form-shell"
import { FormSection } from "@/components/forms/form-section"
import { FormGrid } from "@/components/forms/form-grid"
import { FormField } from "@/components/forms/form-field"
import { FormFooter } from "@/components/forms/form-footer"
import { FormAside } from "@/components/forms/form-aside"
import { InputAddon } from "@/components/forms/input-addon"
import { useCurrency } from "@/contexts/currency"

type Line = { id: string; sku: string; qty: number; cost: number }

let lineSeq = 0
const newLine = (): Line => ({ id: `L-${++lineSeq}`, sku: "", qty: 1, cost: 0 })

export default function NewPO() {
  const [lines, setLines] = React.useState<Line[]>([newLine()])
  const [submitting, setSubmitting] = React.useState(false)
  const { formatPrice, symbol } = useCurrency()

  const subtotal = lines.reduce((s, l) => s + l.qty * l.cost, 0)
  const tax = subtotal * 0.075
  const total = subtotal + tax

  const update = (id: string, patch: Partial<Line>) =>
    setLines((p) => p.map((l) => (l.id === id ? { ...l, ...patch } : l)))
  const remove = (id: string) => setLines((p) => p.filter((l) => l.id !== id))

  return (
    <FormShell
      title="New purchase order"
      description="Order stock from a vendor."
      backHref="/purchasing/pos"
      onSubmit={() => { setSubmitting(true); setTimeout(() => setSubmitting(false), 500) }}
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
              Vendor default terms apply on save. Items aren't deducted from stock until the PO is marked received.
            </p>
          </dl>
        </FormAside>
      }
      footer={<FormFooter submitLabel="Create PO" submitting={submitting} cancelHref="/purchasing/pos" />}
    >
      <FormSection title="Vendor" Icon={Truck}>
        <FormGrid cols={3}>
          <FormField label="Vendor" required>
            <Select defaultValue="cobalt">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="cobalt">Cobalt Distributors</SelectItem>
                <SelectItem value="delta">Delta Apparel</SelectItem>
                <SelectItem value="acme">Acme Supplies</SelectItem>
                <SelectItem value="glow">Glow Co</SelectItem>
                <SelectItem value="porcel">Porcel Ceramics</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
          <FormField label="Destination warehouse">
            <Select defaultValue="wh-a">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="wh-a">Warehouse A</SelectItem>
                <SelectItem value="wh-b">Warehouse B</SelectItem>
                <SelectItem value="wh-c">Warehouse C</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
          <FormField label="PO number" hint="Auto-generated if blank.">
            <Input placeholder="PO-1045" />
          </FormField>
        </FormGrid>
      </FormSection>

      <FormSection title="Schedule" Icon={CalendarDays}>
        <FormGrid cols={3}>
          <FormField label="Issue date" required>
            <Input type="date" defaultValue={new Date().toISOString().slice(0, 10)} required />
          </FormField>
          <FormField label="Expected delivery">
            <Input type="date" />
          </FormField>
          <FormField label="Payment terms">
            <Select defaultValue="net30">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="immediate">Immediate</SelectItem>
                <SelectItem value="net7">Net 7</SelectItem>
                <SelectItem value="net14">Net 14</SelectItem>
                <SelectItem value="net30">Net 30</SelectItem>
                <SelectItem value="net60">Net 60</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
        </FormGrid>
      </FormSection>

      <FormSection
        title="Line items"
        description="Products to order from the vendor"
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
                <FormField label="Unit cost" required>
                  <InputAddon leading={symbol}>
                    <input
                      type="number"
                      step="0.01"
                      value={l.cost}
                      onChange={(e) => update(l.id, { cost: Number(e.target.value) || 0 })}
                      required
                    />
                  </InputAddon>
                </FormField>
                <FormField label="Line total" span={2}>
                  <div className="flex h-10 items-center rounded-lg border border-input bg-muted/40 px-3 text-sm font-semibold tabular-nums">
                    {formatPrice(l.qty * l.cost)}
                  </div>
                </FormField>
              </FormGrid>
            </li>
          ))}
        </ul>
      </FormSection>

      <FormSection title="Notes" Icon={ClipboardList}>
        <FormField label="Internal notes" hint="Visible to your team only.">
          <Textarea placeholder="Mark fragile · expedite if possible…" />
        </FormField>
      </FormSection>
    </FormShell>
  )
}
