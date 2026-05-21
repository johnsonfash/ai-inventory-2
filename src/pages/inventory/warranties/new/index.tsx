import * as React from "react"
import { ShieldCheck } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FormShell } from "@/components/forms/form-shell"
import { FormSection } from "@/components/forms/form-section"
import { FormGrid } from "@/components/forms/form-grid"
import { FormField } from "@/components/forms/form-field"
import { FormFooter } from "@/components/forms/form-footer"
import { FormAside } from "@/components/forms/form-aside"
import { InputAddon } from "@/components/forms/input-addon"
import { SwitchField } from "@/components/forms/switch-field"

export default function NewWarranty() {
  const [submitting, setSubmitting] = React.useState(false)
  return (
    <FormShell
      title="New warranty plan"
      description="Define a coverage policy that can be attached to one or more items."
      titleTooltip={
        <>
          A reusable guarantee template — e.g. "12-month manufacturer
          replacement on electronics." Attach the plan to as many
          items as it covers; Pallio prints it on the receipt + nudges
          you when a covered item comes back so you can claim against
          the manufacturer.
        </>
      }
      backHref="/inventory/warranties"
      onSubmit={() => { setSubmitting(true); setTimeout(() => setSubmitting(false), 400) }}
      aside={
        <FormAside
          tips={[
            { title: "Duration", body: "Enter 9999 to represent a lifetime warranty.", Icon: ShieldCheck },
            { title: "Coverage", body: "Be specific — this text appears on receipts and the storefront product page.", Icon: ShieldCheck },
          ]}
        />
      }
      footer={<FormFooter submitLabel="Save plan" submitting={submitting} cancelHref="/inventory/warranties" />}
    >
      <FormSection title="Plan" Icon={ShieldCheck}>
        <FormGrid cols={2}>
          <FormField label="Code" required hint="Short identifier shown on labels.">
            <Input placeholder="W12" required />
          </FormField>
          <FormField label="Plan name" required>
            <Input placeholder="12-month standard" required />
          </FormField>
          <FormField label="Duration">
            <InputAddon trailing="months">
              <input type="number" defaultValue={12} />
            </InputAddon>
          </FormField>
          <FormField label="Tier">
            <Select defaultValue="standard">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="basic">Basic</SelectItem>
                <SelectItem value="standard">Standard</SelectItem>
                <SelectItem value="extended">Extended</SelectItem>
                <SelectItem value="lifetime">Lifetime</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
          <FormField label="Coverage" span={2} hint="Describe what's covered (and what isn't).">
            <Textarea placeholder="Manufacturer defects only. Excludes accidental damage." />
          </FormField>
          <FormField span={2}>
            <SwitchField
              label="Available on storefront"
              description="Customers can select this plan at checkout if available for their item."
              defaultChecked
            />
          </FormField>
        </FormGrid>
      </FormSection>
    </FormShell>
  )
}
