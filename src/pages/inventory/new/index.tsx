import * as React from "react"
import {
  Boxes,
  ImageIcon,
  Lightbulb,
  Package2,
  Tag,
  Truck,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AddSupplierDialog } from "@/components/dialogs/add-supplier-dialog"
import { FormShell } from "@/components/forms/form-shell"
import { FormSection } from "@/components/forms/form-section"
import { FormGrid } from "@/components/forms/form-grid"
import { FormField } from "@/components/forms/form-field"
import { FormFooter } from "@/components/forms/form-footer"
import { FormAside } from "@/components/forms/form-aside"
import { SwitchField } from "@/components/forms/switch-field"
import { InputAddon } from "@/components/forms/input-addon"

export default function NewItemPage() {
  const [suppliers, setSuppliers] = React.useState(["Cobalt", "Delta", "Acme"])
  const [supplier, setSupplier] = React.useState<string>("Cobalt")
  const [trackInventory, setTrackInventory] = React.useState(true)
  const [taxable, setTaxable] = React.useState(true)
  const [submitting, setSubmitting] = React.useState(false)

  const handleSubmit = () => {
    setSubmitting(true)
    // Mock save — replace with real mutation when backend lands.
    setTimeout(() => setSubmitting(false), 600)
  }

  return (
    <FormShell
      title="Add product"
      description="Capture everything needed for inventory, purchasing, and the storefront."
      backHref="/inventory"
      onSubmit={handleSubmit}
      aside={
        <FormAside
          tips={[
            { title: "SKU naming", body: "Two-letter prefix per category (EL, AP) + 4-digit number reads well in reports.", Icon: Tag },
            { title: "Reorder point", body: "Set this to ~2× your weekly sell-through to leave time for restocks.", Icon: Boxes },
            { title: "Image", body: "Square 400×400 PNG works best in the POS catalog grid.", Icon: ImageIcon },
            { title: "Suppliers", body: "Adding the primary supplier here pre-fills future POs.", Icon: Truck },
          ]}
        />
      }
      footer={<FormFooter submitLabel="Save item" submitting={submitting} cancelHref="/inventory" />}
    >
      <FormSection title="Basics" description="Identity and classification" Icon={Package2}>
        <FormGrid cols={2}>
          <FormField label="Item name" required htmlFor="item-name" hint="Shown in catalog, POS, and invoices.">
            <Input id="item-name" placeholder="USB‑C Hub 6‑in‑1" required />
          </FormField>
          <FormField label="SKU" required htmlFor="sku" hint="Unique product code. Letters, numbers, dashes.">
            <Input id="sku" placeholder="EL-2109" required />
          </FormField>
          <FormField label="Category" required>
            <Select defaultValue="electronics">
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="electronics">Electronics</SelectItem>
                <SelectItem value="apparel">Apparel</SelectItem>
                <SelectItem value="home">Home</SelectItem>
                <SelectItem value="beauty">Beauty</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
          <FormField label="Brand">
            <Input placeholder="Cobalt" />
          </FormField>
          <FormField label="Unit of measure">
            <Select defaultValue="pcs">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pcs">Pieces (pcs)</SelectItem>
                <SelectItem value="box">Box</SelectItem>
                <SelectItem value="kg">Kilogram (kg)</SelectItem>
                <SelectItem value="lt">Litre (L)</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
          <FormField label="Warranty" hint="Optional — e.g. 12 months.">
            <Input placeholder="12 months" />
          </FormField>
          <FormField label="Description" span={2}>
            <Textarea placeholder="Internal notes and storefront copy." />
          </FormField>
        </FormGrid>
      </FormSection>

      <FormSection title="Pricing" description="Cost basis and selling prices" Icon={Tag}>
        <FormGrid cols={3}>
          <FormField label="Unit cost" required hint="What you pay your supplier.">
            <InputAddon leading="$">
              <input type="number" step="0.01" placeholder="0.00" required />
            </InputAddon>
          </FormField>
          <FormField label="Retail price" required>
            <InputAddon leading="$">
              <input type="number" step="0.01" placeholder="0.00" required />
            </InputAddon>
          </FormField>
          <FormField label="Wholesale price">
            <InputAddon leading="$">
              <input type="number" step="0.01" placeholder="0.00" />
            </InputAddon>
          </FormField>
          <FormField label="Tax rate" span={3}>
            <SwitchField
              label="Taxable item"
              description="Apply the default tax rate set in Settings → Taxes."
              checked={taxable}
              onCheckedChange={setTaxable}
            />
          </FormField>
        </FormGrid>
      </FormSection>

      <FormSection title="Stock" description="On-hand and reorder behaviour" Icon={Boxes}>
        <FormGrid cols={2}>
          <FormField label="Opening stock" hint="Quantity already on hand today.">
            <Input type="number" defaultValue={0} />
          </FormField>
          <FormField label="Reorder point" hint="Below this, the dashboard alerts you.">
            <Input type="number" defaultValue={20} />
          </FormField>
          <FormField label="Default location">
            <Select defaultValue="wh-a">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="wh-a">Warehouse A</SelectItem>
                <SelectItem value="wh-b">Warehouse B</SelectItem>
                <SelectItem value="wh-c">Warehouse C</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
          <FormField label="Barcode (optional)">
            <Input placeholder="0123456789012" />
          </FormField>
          <FormField span={2}>
            <SwitchField
              label="Track inventory"
              description="Disable for services or non-stocked items (no movements logged)."
              checked={trackInventory}
              onCheckedChange={setTrackInventory}
            />
          </FormField>
        </FormGrid>
      </FormSection>

      <FormSection title="Supplier" description="Where you source it from" Icon={Truck}>
        <FormGrid cols={2}>
          <FormField label="Primary supplier" span={2}>
            <div className="flex items-center gap-2">
              <Select value={supplier} onValueChange={(v) => setSupplier(v ?? "")}>
                <SelectTrigger>
                  <SelectValue placeholder="Select supplier" />
                </SelectTrigger>
                <SelectContent>
                  {suppliers.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <AddSupplierDialog
                onCreate={(s) => {
                  setSuppliers((prev) => [...prev, s.name])
                  setSupplier(s.name)
                }}
              />
            </div>
          </FormField>
          <FormField label="Supplier SKU" hint="Their code for this item.">
            <Input placeholder="COB-USB-6IN1" />
          </FormField>
          <FormField label="Lead time">
            <InputAddon trailing="days">
              <input type="number" placeholder="14" />
            </InputAddon>
          </FormField>
        </FormGrid>
      </FormSection>

      <FormSection title="Media" description="Product image" Icon={ImageIcon}>
        <FormField label="Image" hint="PNG/JPG, square 400×400 recommended.">
          <Input type="file" accept="image/*" />
        </FormField>
      </FormSection>

      <FormSection
        title="Visibility"
        description="Where this item appears"
        Icon={Lightbulb}
      >
        <div className="flex flex-col gap-2.5">
          <SwitchField
            label="Show in POS"
            description="Available in the point-of-sale catalog."
            defaultChecked
          />
          <SwitchField
            label="Show on online storefront"
            description="Synced to the connected web store."
            defaultChecked
          />
          <SwitchField
            label="Show in supplier portal"
            description="Visible to wholesale buyers with portal access."
          />
        </div>
      </FormSection>
    </FormShell>
  )
}
