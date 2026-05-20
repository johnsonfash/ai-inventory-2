import * as React from "react"
import { Layers, Package, Plus, Tag, Trash2 } from "lucide-react"
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
import { useCurrency, formatPriceFor } from "@/contexts/currency"

type Component = { id: string; sku: string; qty: number }

let lineSeq = 0
const newComponent = (): Component => ({ id: `C-${++lineSeq}`, sku: "", qty: 1 })

const skuOptions = [
  { value: "EL-2109", label: `USB‑C Hub 6‑in‑1 (${formatPriceFor(28.5)})` },
  { value: "EL-1001", label: `Wireless Mouse (${formatPriceFor(22)})` },
  { value: "HM-2205", label: `Ceramic Mug 12oz (${formatPriceFor(8)})` },
  { value: "AP-4012", label: `Cotton Tee — Black (${formatPriceFor(12)})` },
  { value: "BT-9091", label: `Hydrating Serum (${formatPriceFor(18.95)})` },
]

export default function NewComposite() {
  const [components, setComponents] = React.useState<Component[]>([newComponent()])
  const [submitting, setSubmitting] = React.useState(false)
  const { symbol } = useCurrency()

  const remove = (id: string) => setComponents((p) => p.filter((c) => c.id !== id))
  const update = (id: string, patch: Partial<Component>) =>
    setComponents((p) => p.map((c) => (c.id === id ? { ...c, ...patch } : c)))

  return (
    <FormShell
      title="New composite item"
      description="Bundle multiple SKUs into one sellable kit."
      backHref="/inventory/composite"
      onSubmit={() => { setSubmitting(true); setTimeout(() => setSubmitting(false), 500) }}
      aside={
        <FormAside
          tips={[
            { title: "Stock impact", body: "Selling a composite decrements each component's stock by its qty.", Icon: Package },
            { title: "Pricing", body: "Set a custom sell price below the sum of components for a bundle discount.", Icon: Tag },
          ]}
        />
      }
      footer={<FormFooter submitLabel="Save composite" submitting={submitting} cancelHref="/inventory/composite" />}
    >
      <FormSection title="Identity" Icon={Layers}>
        <FormGrid cols={3}>
          <FormField label="Composite name" required span={2}>
            <Input placeholder="Starter Kit (Hub + Mouse)" required />
          </FormField>
          <FormField label="SKU" required>
            <Input placeholder="BUN-1001" required />
          </FormField>
          <FormField label="Description" span={3} hint="Shown on the catalog page and POS catalog tile.">
            <Textarea placeholder="The everything-bundle for new desks." />
          </FormField>
        </FormGrid>
      </FormSection>

      <FormSection
        title="Components"
        description="Items included in this kit"
        Icon={Package}
        trailing={
          <Button type="button" variant="outline" size="sm" onClick={() => setComponents((p) => [...p, newComponent()])}>
            <Plus className="h-3.5 w-3.5" /> Add component
          </Button>
        }
      >
        <ul className="space-y-3">
          {components.map((c, idx) => (
            <li key={c.id} className="rounded-xl border border-border bg-background p-3">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">Item {idx + 1}</span>
                {components.length > 1 && (
                  <button
                    type="button"
                    onClick={() => remove(c.id)}
                    className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground"
                    aria-label="Remove component"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
              <FormGrid cols={3}>
                <FormField label="Source item" required span={2}>
                  <Select value={c.sku} onValueChange={(v) => v && update(c.id, { sku: v })}>
                    <SelectTrigger><SelectValue placeholder="Pick a product" /></SelectTrigger>
                    <SelectContent>
                      {skuOptions.map((o) => (
                        <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>
                <FormField label="Quantity" required>
                  <Input
                    type="number"
                    min={1}
                    value={c.qty}
                    onChange={(e) => update(c.id, { qty: Math.max(1, Number(e.target.value) || 1) })}
                    required
                  />
                </FormField>
              </FormGrid>
            </li>
          ))}
        </ul>
      </FormSection>

      <FormSection title="Pricing" Icon={Tag}>
        <FormGrid cols={2}>
          <FormField label="Sell price" required>
            <InputAddon leading={symbol}>
              <input type="number" step="0.01" placeholder="0.00" required />
            </InputAddon>
          </FormField>
          <FormField label="Wholesale price">
            <InputAddon leading={symbol}>
              <input type="number" step="0.01" placeholder="0.00" />
            </InputAddon>
          </FormField>
        </FormGrid>
      </FormSection>
    </FormShell>
  )
}
