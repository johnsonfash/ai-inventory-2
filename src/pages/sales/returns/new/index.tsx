import * as React from "react"
import { ClipboardCheck, PackageMinus, RotateCcw } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FormShell } from "@/components/forms/form-shell"
import { FormSection } from "@/components/forms/form-section"
import { FormGrid } from "@/components/forms/form-grid"
import { FormField } from "@/components/forms/form-field"
import { FormFooter } from "@/components/forms/form-footer"
import { FormAside } from "@/components/forms/form-aside"
import { SwitchField } from "@/components/forms/switch-field"
import { InputAddon } from "@/components/forms/input-addon"

export default function NewReturn() {
  const [submitting, setSubmitting] = React.useState(false)
  return (
    <FormShell
      title="New return (RMA)"
      description="Authorise a return, set restock disposition, and trigger the refund."
      backHref="/sales/returns"
      onSubmit={() => { setSubmitting(true); setTimeout(() => setSubmitting(false), 500) }}
      aside={
        <FormAside
          tips={[
            { title: "Disposition", body: "Pick 'Restock' to add items back to inventory. 'Damaged' marks them as a write-off in Adjustments.", Icon: ClipboardCheck },
            { title: "RMA #", body: "Auto-generated if blank. Customers reference this on the return shipment.", Icon: RotateCcw },
          ]}
        />
      }
      footer={<FormFooter submitLabel="Save RMA" submitting={submitting} cancelHref="/sales/returns" />}
    >
      <FormSection title="Origin" Icon={ClipboardCheck}>
        <FormGrid cols={3}>
          <FormField label="RMA #" hint="Auto-generated if blank.">
            <Input placeholder="RT-121" />
          </FormField>
          <FormField label="Source order" required>
            <Input placeholder="SO-7850" required />
          </FormField>
          <FormField label="Customer" required>
            <Select defaultValue="nova">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="nova">NovaApps</SelectItem>
                <SelectItem value="bright">BrightLane</SelectItem>
                <SelectItem value="walkin">Walk-in</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
        </FormGrid>
      </FormSection>

      <FormSection title="Item" Icon={PackageMinus}>
        <FormGrid cols={3}>
          <FormField label="SKU" required span={2}>
            <Input placeholder="AP-4012" required />
          </FormField>
          <FormField label="Quantity" required>
            <Input type="number" min={1} defaultValue={1} required />
          </FormField>
          <FormField label="Refund amount" required>
            <InputAddon leading="$">
              <input type="number" step="0.01" placeholder="0.00" required />
            </InputAddon>
          </FormField>
          <FormField label="Refund method">
            <Select defaultValue="original">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="original">Original method</SelectItem>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="card">Card</SelectItem>
                <SelectItem value="store-credit">Store credit</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
          <FormField label="Reason">
            <Select defaultValue="defective">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="defective">Defective</SelectItem>
                <SelectItem value="wrong-item">Wrong item</SelectItem>
                <SelectItem value="changed-mind">Changed mind</SelectItem>
                <SelectItem value="damaged">Damaged in transit</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
          <FormField label="Notes" span={3}>
            <Textarea placeholder="Any context about the return…" />
          </FormField>
        </FormGrid>
      </FormSection>

      <FormSection title="Disposition" Icon={RotateCcw}>
        <FormGrid cols={1}>
          <FormField label="What to do with the returned item">
            <Select defaultValue="restock">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="restock">Restock — return to inventory</SelectItem>
                <SelectItem value="damaged">Mark damaged — write off</SelectItem>
                <SelectItem value="return-to-vendor">Return to vendor for credit</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
          <SwitchField label="Email customer with refund confirmation" defaultChecked />
          <SwitchField label="Print return shipping label" description="Pallio will email the prepaid label to the customer." />
        </FormGrid>
      </FormSection>
    </FormShell>
  )
}
