import * as React from "react"
import { Image as ImageIcon, Sparkles } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FormShell } from "@/components/forms/form-shell"
import { FormSection } from "@/components/forms/form-section"
import { FormGrid } from "@/components/forms/form-grid"
import { FormField } from "@/components/forms/form-field"
import { FormFooter } from "@/components/forms/form-footer"
import { FormAside } from "@/components/forms/form-aside"

export default function NewBrand() {
  const [submitting, setSubmitting] = React.useState(false)
  return (
    <FormShell
      title="New brand"
      description="Brands group items by manufacturer or label."
      titleTooltip={
        <>
          The maker or label of an item — Apple, Nike, your own house
          brand. Lets customers filter the storefront by names they
          recognise and lets you see which brand actually drives
          revenue. Optional but boosts conversion in retail.
        </>
      }
      backHref="/inventory/brands"
      onSubmit={() => { setSubmitting(true); setTimeout(() => setSubmitting(false), 400) }}
      aside={
        <FormAside
          tips={[
            { title: "Supplier link", body: "Tying a brand to its supplier makes purchasing suggestions sharper.", Icon: Sparkles },
            { title: "Logo", body: "Used in the catalog filter chips and the storefront brand page.", Icon: ImageIcon },
          ]}
        />
      }
      footer={<FormFooter submitLabel="Save brand" submitting={submitting} cancelHref="/inventory/brands" />}
    >
      <FormSection title="Identity" Icon={Sparkles}>
        <FormGrid cols={2}>
          <FormField label="Name" required>
            <Input placeholder="Cobalt" required />
          </FormField>
          <FormField label="Linked supplier">
            <Select>
              <SelectTrigger><SelectValue placeholder="(none)" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="cobalt">Cobalt Distributors</SelectItem>
                <SelectItem value="delta">Delta Apparel</SelectItem>
                <SelectItem value="acme">Acme Supplies</SelectItem>
                <SelectItem value="porcel">Porcel Ceramics</SelectItem>
                <SelectItem value="glow">Glow Co</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
          <FormField label="Tagline" span={2}>
            <Input placeholder="e.g. Power tools, professional grade." />
          </FormField>
          <FormField label="Description" span={2}>
            <Textarea placeholder="Short summary for the storefront brand page." />
          </FormField>
          <FormField label="Brand logo" span={2}>
            <Input type="file" accept="image/*" />
          </FormField>
        </FormGrid>
      </FormSection>
    </FormShell>
  )
}
