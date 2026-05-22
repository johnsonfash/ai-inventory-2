import * as React from "react"
import { Workflow, Component, Plus, Tag, Trash2, AlertTriangle } from "lucide-react"
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
import { SwitchField } from "@/components/forms/switch-field"
import { InputAddon } from "@/components/forms/input-addon"
import { ALLERGEN_LABELS, type Allergen } from "@/lib/inventory/recipes"

type ComponentRow = { id: string; sku: string; qty: number; unit: string; wastage: number }

let lineSeq = 0
const newComponentRow = (): ComponentRow => ({
  id: `C-${++lineSeq}`,
  sku: "",
  qty: 1,
  unit: "pcs",
  wastage: 0,
})

const UNITS = ["pcs", "kg", "g", "L", "ml", "m", "cm", "dz", "hr", "min", "box", "set"]

export default function NewRecipe() {
  const [components, setComponents] = React.useState<ComponentRow[]>([newComponentRow()])
  const [allergens, setAllergens] = React.useState<Set<Allergen>>(new Set())
  const [trackNutrition, setTrackNutrition] = React.useState(false)
  const [submitting, setSubmitting] = React.useState(false)

  const toggleAllergen = (a: Allergen) =>
    setAllergens((prev) => {
      const next = new Set(prev)
      if (next.has(a)) next.delete(a)
      else next.add(a)
      return next
    })

  const update = (id: string, patch: Partial<ComponentRow>) =>
    setComponents((p) => p.map((c) => (c.id === id ? { ...c, ...patch } : c)))

  const remove = (id: string) => setComponents((p) => p.filter((c) => c.id !== id))

  return (
    <FormShell
      title="New recipe"
      description="Define how a finished SKU is built from its components."
      titleTooltip={
        <>
          One recipe model, every industry. Use it for a finished
          product (loaf of bread, soap bar, brewed beer, candle, framed
          print, panel assembly), a service job (brake-pad swap, phone
          repair, haircut), or a blend (perfume, smoothie, custom
          paint). Parent SKU consumes child SKUs in the quantities you
          set; Pallio deducts them automatically on sale or production.
        </>
      }
      backHref="/inventory/recipes"
      onSubmit={() => { setSubmitting(true); setTimeout(() => setSubmitting(false), 500) }}
      aside={
        <FormAside
          tips={[
            { title: "Yield matters", body: "A bakery recipe yields 30 loaves. A perfume blend yields 100ml. A service recipe yields 1 completed job. Get this right or the cost-per-unit math breaks.", Icon: Workflow },
            { title: "Sub-recipes nest", body: "If the parent SKU references another recipe's parent SKU, Pallio recursively expands. Sourdough loaf → sourdough starter → flour + water + culture.", Icon: Component },
            { title: "Wastage is honest", body: "1kg raw potato → 700g peeled. Use the wastage factor so cost rollups reflect reality, not just inputs.", Icon: AlertTriangle },
            { title: "Allergens are optional", body: "Food/cosmetics businesses fill them; auto parts + apparel leave them blank. Same model works either way.", Icon: Tag },
          ]}
        />
      }
      footer={<FormFooter submitLabel="Save recipe" submitting={submitting} cancelHref="/inventory/recipes" />}
    >
      <FormSection title="Identity" Icon={Workflow}>
        <FormGrid cols={3}>
          <FormField label="Recipe name" required span={2}>
            <Input placeholder="Sourdough loaf · Mango smoothie · Brake-pad service" required />
          </FormField>
          <FormField label="Parent SKU" required hint="What gets sold or produced.">
            <Input placeholder="BK-2001" required />
          </FormField>
          <FormField label="Method / instructions" span={3} hint="Optional — the cook, technician, or assembler reads this.">
            <Textarea placeholder="Steps, temperatures, torque values, blend order, cure time…" rows={4} />
          </FormField>
        </FormGrid>
      </FormSection>

      <FormSection title="Yield" Icon={Tag} description="How much one run produces">
        <FormGrid cols={3}>
          <FormField label="Yield quantity" required hint="Output units per run.">
            <Input type="number" min={1} step="0.01" defaultValue={1} required />
          </FormField>
          <FormField label="Yield unit" required>
            <Select defaultValue="pcs">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {UNITS.map((u) => <SelectItem key={u} value={u}>{u}</SelectItem>)}
              </SelectContent>
            </Select>
          </FormField>
          <FormField label="Total time" hint="Prep + active + cure. Used by the production schedule.">
            <InputAddon trailing="min">
              <input type="number" min={1} placeholder="120" />
            </InputAddon>
          </FormField>
        </FormGrid>
      </FormSection>

      <FormSection
        title="Components"
        description="Parts consumed per yielded unit"
        Icon={Component}
        trailing={
          <Button type="button" variant="outline" size="sm" onClick={() => setComponents((p) => [...p, newComponentRow()])}>
            <Plus className="h-3.5 w-3.5" /> Add component
          </Button>
        }
      >
        <ul className="space-y-3">
          {components.map((c, idx) => (
            <li key={c.id} className="rounded-xl border border-border bg-background p-3">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">Line {idx + 1}</span>
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
                <FormField label="Component SKU" required span={3} hint="Ingredient, part, or another recipe's parent SKU (sub-recipe).">
                  <Input
                    placeholder="ING-FLOUR-BREAD · ING-BRAKE-PAD-F · REC-STARTER"
                    value={c.sku}
                    onChange={(e) => update(c.id, { sku: e.target.value })}
                    required
                  />
                </FormField>
                <FormField label="Qty per unit" required>
                  <Input
                    type="number"
                    min={0}
                    step="0.001"
                    value={c.qty}
                    onChange={(e) => update(c.id, { qty: Number(e.target.value) || 0 })}
                    required
                  />
                </FormField>
                <FormField label="Unit" required>
                  <Select value={c.unit} onValueChange={(v) => v && update(c.id, { unit: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {UNITS.map((u) => <SelectItem key={u} value={u}>{u}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </FormField>
                <FormField label="Wastage %" hint="0 for parts; non-zero where input → output loses mass.">
                  <InputAddon trailing="%">
                    <input
                      type="number"
                      min={0}
                      max={90}
                      step="1"
                      value={Math.round(c.wastage * 100)}
                      onChange={(e) => update(c.id, { wastage: Math.max(0, Math.min(0.9, (Number(e.target.value) || 0) / 100)) })}
                    />
                  </InputAddon>
                </FormField>
              </FormGrid>
            </li>
          ))}
        </ul>
      </FormSection>

      <FormSection
        title="Allergens"
        description="Optional — only relevant for food, cosmetics, and personal care"
        Icon={AlertTriangle}
      >
        <p className="mb-3 text-xs text-muted-foreground">
          Skip this section entirely if you make auto parts, hardware, apparel,
          or anything else where allergens don't apply.
        </p>
        <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3 md:grid-cols-4">
          {(Object.keys(ALLERGEN_LABELS) as Allergen[]).map((a) => {
            const on = allergens.has(a)
            return (
              <button
                key={a}
                type="button"
                onClick={() => toggleAllergen(a)}
                className={
                  on
                    ? "flex items-center justify-between gap-2 rounded-lg bg-amber-100 px-3 py-2 text-xs font-semibold text-amber-800 dark:bg-amber-500/15 dark:text-amber-300"
                    : "flex items-center justify-between gap-2 rounded-lg border border-border bg-card px-3 py-2 text-xs text-muted-foreground hover:text-foreground"
                }
              >
                {ALLERGEN_LABELS[a]}
                {on && <span className="text-[10px]">✓</span>}
              </button>
            )
          })}
        </div>
      </FormSection>

      <FormSection title="Tags" Icon={Tag} description="Cross-industry — tag however makes sense for your business">
        <FormField label="Tags" hint="Comma-separated. Examples: bread, smoothie, fragrance, service, automotive, apparel, handmade, blend, assembly.">
          <Input placeholder="bread, bakery" />
        </FormField>
      </FormSection>

      <FormSection title="Nutrition" Icon={Tag} description="Optional — for food/beverage operators only">
        <SwitchField
          label="Track nutrition for this recipe"
          description="Adds kcal, macros, fiber, sodium fields. Used by storefront menu cards + customer-facing labels."
          checked={trackNutrition}
          onCheckedChange={setTrackNutrition}
        />
        {trackNutrition && (
          <FormGrid cols={3}>
            <FormField label="Calories"><InputAddon trailing="kcal"><input type="number" min={0} /></InputAddon></FormField>
            <FormField label="Protein"><InputAddon trailing="g"><input type="number" min={0} step="0.1" /></InputAddon></FormField>
            <FormField label="Carbs"><InputAddon trailing="g"><input type="number" min={0} step="0.1" /></InputAddon></FormField>
            <FormField label="Fat"><InputAddon trailing="g"><input type="number" min={0} step="0.1" /></InputAddon></FormField>
            <FormField label="Fiber"><InputAddon trailing="g"><input type="number" min={0} step="0.1" /></InputAddon></FormField>
            <FormField label="Sodium"><InputAddon trailing="mg"><input type="number" min={0} /></InputAddon></FormField>
          </FormGrid>
        )}
      </FormSection>
    </FormShell>
  )
}
