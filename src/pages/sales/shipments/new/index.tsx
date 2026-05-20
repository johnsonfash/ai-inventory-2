import * as React from "react"
import { MapPin, PackageCheck, Truck } from "lucide-react"
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

export default function NewShipment() {
  const [submitting, setSubmitting] = React.useState(false)
  return (
    <FormShell
      title="New shipment"
      description="Buy a label and dispatch an order to the customer."
      backHref="/sales/shipments"
      onSubmit={() => { setSubmitting(true); setTimeout(() => setSubmitting(false), 500) }}
      aside={
        <FormAside
          tips={[
            { title: "Carriers", body: "Rates are compared in real time via your connected EasyPost / Shippo integration.", Icon: Truck },
            { title: "Pickup vs ship", body: "Local pickup orders skip label purchase — just mark fulfilled on collection.", Icon: PackageCheck },
          ]}
        />
      }
      footer={<FormFooter submitLabel="Buy label" submitting={submitting} cancelHref="/sales/shipments" />}
    >
      <FormSection title="Order" Icon={PackageCheck}>
        <FormGrid cols={2}>
          <FormField label="Source order" required>
            <Select defaultValue="SO-7849">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="SO-7842">SO-7842 · NovaApps</SelectItem>
                <SelectItem value="SO-7849">SO-7849 · BrightLane</SelectItem>
                <SelectItem value="SO-7851">SO-7851 · Aisha N.</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
          <FormField label="Origin warehouse">
            <Select defaultValue="wh-a">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="wh-a">WH-A · Austin</SelectItem>
                <SelectItem value="wh-b">WH-B · Atlanta</SelectItem>
                <SelectItem value="wh-c">WH-C · Portland</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
        </FormGrid>
      </FormSection>

      <FormSection title="Destination" Icon={MapPin}>
        <FormField label="Shipping address" hint="Pre-filled from the order's customer record.">
          <Textarea defaultValue="200 Congress Ave\nAustin, TX 78701\nUnited States" />
        </FormField>
      </FormSection>

      <FormSection title="Package & service" Icon={Truck}>
        <FormGrid cols={3}>
          <FormField label="Weight">
            <InputAddon trailing="lb">
              <input type="number" step="0.1" defaultValue={2.5} />
            </InputAddon>
          </FormField>
          <FormField label="Length">
            <InputAddon trailing="in">
              <input type="number" step="0.1" defaultValue={12} />
            </InputAddon>
          </FormField>
          <FormField label="Width">
            <InputAddon trailing="in">
              <input type="number" step="0.1" defaultValue={10} />
            </InputAddon>
          </FormField>
          <FormField label="Height">
            <InputAddon trailing="in">
              <input type="number" step="0.1" defaultValue={4} />
            </InputAddon>
          </FormField>
          <FormField label="Carrier preference">
            <Select defaultValue="cheapest">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="cheapest">Cheapest available</SelectItem>
                <SelectItem value="fastest">Fastest</SelectItem>
                <SelectItem value="usps">USPS</SelectItem>
                <SelectItem value="ups">UPS</SelectItem>
                <SelectItem value="fedex">FedEx</SelectItem>
                <SelectItem value="dhl">DHL</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
          <FormField label="Service level">
            <Select defaultValue="ground">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ground">Ground</SelectItem>
                <SelectItem value="priority">Priority</SelectItem>
                <SelectItem value="express">Express</SelectItem>
                <SelectItem value="overnight">Overnight</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
        </FormGrid>
      </FormSection>

      <FormSection title="Behaviour" Icon={PackageCheck}>
        <SwitchField label="Email tracking number to customer" defaultChecked />
        <SwitchField label="Buy with signature required" />
        <SwitchField label="Auto-fulfil in the source order" defaultChecked />
      </FormSection>
    </FormShell>
  )
}
