import * as React from "react"
import { Box, CalendarDays, FileCheck, Truck } from "lucide-react"
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

export default function NewReceipt() {
  const [submitting, setSubmitting] = React.useState(false)
  return (
    <FormShell
      title="New goods receipt"
      description="Record inbound stock against a purchase order."
      backHref="/purchasing/receipts"
      onSubmit={() => { setSubmitting(true); setTimeout(() => setSubmitting(false), 500) }}
      aside={
        <FormAside
          tips={[
            { title: "Partial receipts", body: "Receive a subset of lines now and finish the rest later — the PO stays open.", Icon: Box },
            { title: "Discrepancy", body: "Flag mismatched qty here. Triggers a vendor-credit suggestion in Purchasing.", Icon: FileCheck },
          ]}
        />
      }
      footer={<FormFooter submitLabel="Save receipt" submitting={submitting} cancelHref="/purchasing/receipts" />}
    >
      <FormSection title="PO + dates" Icon={Truck}>
        <FormGrid cols={3}>
          <FormField label="Purchase order" required>
            <Select defaultValue="PO-1042">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="PO-1042">PO-1042 · Cobalt Distributors</SelectItem>
                <SelectItem value="PO-1041">PO-1041 · Glow Co</SelectItem>
                <SelectItem value="PO-1040">PO-1040 · Acme Supplies</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
          <FormField label="Receipt date" required>
            <Input type="date" defaultValue={new Date().toISOString().slice(0, 10)} required />
          </FormField>
          <FormField label="Received by">
            <Select defaultValue="mia">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="mia">Mia Chen</SelectItem>
                <SelectItem value="alex">Alex Larson</SelectItem>
                <SelectItem value="priya">Priya Patel</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
        </FormGrid>
      </FormSection>

      <FormSection title="Lines" description="Confirm received quantities" Icon={Box}>
        <FormGrid cols={3}>
          <FormField label="SKU" required span={2}>
            <Input placeholder="EL-2109" required />
          </FormField>
          <FormField label="Received qty" required>
            <Input type="number" min={1} defaultValue={20} required />
          </FormField>
          <FormField label="Lot / batch (optional)" span={2}>
            <Input placeholder="B-1223" />
          </FormField>
          <FormField label="Expiry (optional)">
            <Input type="date" />
          </FormField>
        </FormGrid>
      </FormSection>

      <FormSection title="Behaviour" Icon={CalendarDays}>
        <SwitchField label="Auto-close PO" description="Mark the PO as complete if all lines are now received." defaultChecked />
        <SwitchField label="Print labels for received items" />
        <SwitchField label="Flag discrepancies" description="Open a vendor-credit task when received qty differs from ordered." defaultChecked />
        <FormField label="Notes">
          <Textarea placeholder="Any discrepancies or damage notes…" />
        </FormField>
      </FormSection>
    </FormShell>
  )
}
