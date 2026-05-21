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
      titleTooltip={
        <>
          Start a return for a customer. Pallio generates an
          <strong> RMA</strong> number (their reference), processes
          the refund via the original payment method, and decides what
          happens to the returned item (back on the shelf, written
          off, or returned to your supplier for credit).
        </>
      }
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
          <FormField
            label="RMA #"
            hint="Auto-generated if blank."
            tooltip={
              <>
                <strong>Return Merchandise Authorisation</strong> — the
                reference number the customer puts on the package they're
                returning. Leave blank and Pallio assigns the next number
                (e.g. <span className="font-mono">RT-121</span>).
              </>
            }
          >
            <Input placeholder="RT-121" />
          </FormField>
          <FormField label="Source order" required tooltip="Which sales order this return is against. Pallio pulls in the item list, original price, and customer details from here.">
            <Input placeholder="SO-7850" required />
          </FormField>
          <FormField label="Customer" required tooltip="Who's returning the item. Walk-in customers are fine — they don't need an account to get a refund.">
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
          <FormField label="SKU" required span={2} tooltip="The product code of the item being returned. Pallio checks the original order to make sure this item was actually sold to the customer.">
            <Input placeholder="AP-4012" required />
          </FormField>
          <FormField label="Quantity" required tooltip="How many units of that SKU. Can be less than the original sale (partial return).">
            <Input type="number" min={1} defaultValue={1} required />
          </FormField>
          <FormField label="Refund amount" required tooltip="How much money goes back. Defaults to the price paid; lower it if you're charging a restocking fee.">
            <InputAddon leading="$">
              <input type="number" step="0.01" placeholder="0.00" required />
            </InputAddon>
          </FormField>
          <FormField
            label="Refund method"
            tooltip={
              <>
                How the customer gets their money back.
                <ul className="mt-1.5 list-disc pl-4">
                  <li><strong>Original method</strong> — best practice, reverses the original payment.</li>
                  <li><strong>Store credit</strong> — keeps the money in your business, drives a repeat sale.</li>
                </ul>
              </>
            }
          >
            <Select defaultValue="original">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="original">Original method</SelectItem>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="card">Card</SelectItem>
                <SelectItem value="transfer">Bank transfer</SelectItem>
                <SelectItem value="store-credit">Store credit</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
          <FormField
            label="Reason"
            tooltip="Why the customer is returning the item. Pallio uses this in reports to spot patterns (e.g. one SKU being defective often = supplier problem)."
          >
            <Select defaultValue="defective">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="defective">Defective</SelectItem>
                <SelectItem value="wrong-item">Wrong item received</SelectItem>
                <SelectItem value="changed-mind">Changed mind</SelectItem>
                <SelectItem value="damaged">Damaged in transit</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
          <FormField label="Notes" span={3} tooltip="Anything else — what the customer said, photos taken, condition on receipt. Internal only.">
            <Textarea placeholder="Any context about the return…" />
          </FormField>
        </FormGrid>
      </FormSection>

      <FormSection title="Disposition" Icon={RotateCcw}>
        <FormGrid cols={1}>
          <FormField
            label="What to do with the returned item"
            tooltip={
              <>
                <ul className="space-y-1.5">
                  <li><strong>Restock</strong> — item is fine, put it back on the shelf. Stock count goes up.</li>
                  <li><strong>Mark damaged</strong> — item is broken, write it off. Stock count stays; the loss shows on your P&amp;L.</li>
                  <li><strong>Return to vendor</strong> — send it back to your supplier for credit on your next bill.</li>
                </ul>
              </>
            }
          >
            <Select defaultValue="restock">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="restock">Restock — return to inventory</SelectItem>
                <SelectItem value="damaged">Mark damaged — write off</SelectItem>
                <SelectItem value="return-to-vendor">Return to vendor for credit</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
          <SwitchField
            label="Email customer with refund confirmation"
            description="A polite email + receipt so the customer knows the refund is on its way. Highly recommended — answers the 'where's my money?' question before they have to ask."
            defaultChecked
          />
          <SwitchField label="Print return shipping label" description="Pallio emails a prepaid courier label to the customer. Saves them a trip; saves you the awkward 'who pays for return shipping' conversation." />
        </FormGrid>
      </FormSection>
    </FormShell>
  )
}
