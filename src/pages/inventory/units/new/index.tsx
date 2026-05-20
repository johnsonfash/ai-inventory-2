import * as React from "react"
import { Ruler } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FormShell } from "@/components/forms/form-shell"
import { FormSection } from "@/components/forms/form-section"
import { FormGrid } from "@/components/forms/form-grid"
import { FormField } from "@/components/forms/form-field"
import { FormFooter } from "@/components/forms/form-footer"
import { FormAside } from "@/components/forms/form-aside"

export default function NewUnit() {
  const [submitting, setSubmitting] = React.useState(false)
  return (
    <FormShell
      title="New unit of measure"
      description="Define a way to count or weigh items in the catalog."
      backHref="/inventory/units"
      onSubmit={() => { setSubmitting(true); setTimeout(() => setSubmitting(false), 400) }}
      aside={
        <FormAside
          tips={[
            { title: "Type", body: "Pick the closest physical kind (discrete, weight, volume, length, time).", Icon: Ruler },
            { title: "Compound units", body: "Use 'Linked to' + factor to express, e.g., a Box = 12 Pieces.", Icon: Ruler },
          ]}
        />
      }
      footer={<FormFooter submitLabel="Save unit" submitting={submitting} cancelHref="/inventory/units" />}
    >
      <FormSection title="Identity" Icon={Ruler}>
        <FormGrid cols={2}>
          <FormField label="Code" required hint="Short symbol shown on labels and invoices.">
            <Input placeholder="pcs" required />
          </FormField>
          <FormField label="Full name" required>
            <Input placeholder="Pieces" required />
          </FormField>
          <FormField label="Type" required>
            <Select defaultValue="discrete">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="discrete">Discrete (countable)</SelectItem>
                <SelectItem value="weight">Weight</SelectItem>
                <SelectItem value="volume">Volume</SelectItem>
                <SelectItem value="length">Length</SelectItem>
                <SelectItem value="time">Time</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
          <FormField label="Linked to" hint="Optional. Define this as a multiple of another unit.">
            <Select>
              <SelectTrigger><SelectValue placeholder="(none)" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="pcs">Pieces (pcs)</SelectItem>
                <SelectItem value="kg">Kilogram (kg)</SelectItem>
                <SelectItem value="L">Litre (L)</SelectItem>
                <SelectItem value="m">Metre (m)</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
          <FormField label="Factor" hint="If linked, how many of the base unit this equals (e.g. 12).">
            <Input type="number" placeholder="1" />
          </FormField>
        </FormGrid>
      </FormSection>
    </FormShell>
  )
}
