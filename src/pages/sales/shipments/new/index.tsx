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
      titleTooltip={
        <>
          Pick a sales order, confirm the package dimensions, and
          Pallio buys the courier label at the live rate. The
          customer gets a tracking link emailed automatically; the
          source order gets marked fulfilled if you toggle that on.
        </>
      }
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
          <FormField label="Source order" required tooltip="Which customer order this label is for. Pallio uses it to copy the destination address, mark fulfilment, and email tracking to the right person.">
            <Select defaultValue="SO-7849">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="SO-7842">SO-7842 · NovaApps</SelectItem>
                <SelectItem value="SO-7849">SO-7849 · BrightLane</SelectItem>
                <SelectItem value="SO-7851">SO-7851 · Aisha N.</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
          <FormField label="Origin warehouse" tooltip="Which location the package ships from. Affects courier pickup and the 'from' address printed on the label.">
            <Select defaultValue="wh-a">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="wh-a">Lekki Phase 1 — Flagship</SelectItem>
                <SelectItem value="wh-b">Ikeja City Mall — Kiosk</SelectItem>
                <SelectItem value="wh-c">Wuse 2 — Abuja</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
        </FormGrid>
      </FormSection>

      <FormSection title="Destination" Icon={MapPin}>
        <FormField label="Shipping address" hint="Pre-filled from the order's customer record." tooltip="Where the package goes. Edit only if the customer asked for a different address — changes here don't update their profile.">
          <Textarea defaultValue={"12 Admiralty Way\nLekki Phase 1\nLagos 106104\nNigeria"} />
        </FormField>
      </FormSection>

      <FormSection title="Package & service" Icon={Truck}>
        <FormGrid cols={3}>
          <FormField label="Weight" tooltip="Total package weight (item + box + padding). Most couriers charge by either weight or 'dimensional weight' — whichever is greater.">
            <InputAddon trailing="kg">
              <input type="number" step="0.1" defaultValue={1.2} />
            </InputAddon>
          </FormField>
          <FormField label="Length" tooltip="Longest side of the box. Used with width + height to calculate dimensional weight.">
            <InputAddon trailing="cm">
              <input type="number" step="0.1" defaultValue={30} />
            </InputAddon>
          </FormField>
          <FormField label="Width">
            <InputAddon trailing="cm">
              <input type="number" step="0.1" defaultValue={25} />
            </InputAddon>
          </FormField>
          <FormField label="Height">
            <InputAddon trailing="cm">
              <input type="number" step="0.1" defaultValue={10} />
            </InputAddon>
          </FormField>
          <FormField
            label="Carrier preference"
            tooltip={
              <>
                Which courier to use.
                <ul className="mt-1.5 list-disc pl-4">
                  <li><strong>Cheapest available</strong> — Pallio picks the lowest live rate.</li>
                  <li><strong>Fastest</strong> — pick the courier with the quickest delivery window for this destination.</li>
                </ul>
                Or pin a specific carrier if you have a contract rate.
              </>
            }
          >
            <Select defaultValue="cheapest">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="cheapest">Cheapest available</SelectItem>
                <SelectItem value="fastest">Fastest</SelectItem>
                <SelectItem value="gig">GIG Logistics</SelectItem>
                <SelectItem value="dhl">DHL</SelectItem>
                <SelectItem value="fedex">FedEx</SelectItem>
                <SelectItem value="ups">UPS</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
          <FormField
            label="Service level"
            tooltip="How fast it should arrive. Ground is cheapest + slowest; Overnight is fastest + most expensive. Pallio shows live rates after you hit 'Buy label'."
          >
            <Select defaultValue="ground">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ground">Ground (3–5 days)</SelectItem>
                <SelectItem value="priority">Priority (1–2 days)</SelectItem>
                <SelectItem value="express">Express (next-day)</SelectItem>
                <SelectItem value="overnight">Overnight (before 10 am)</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
        </FormGrid>
      </FormSection>

      <FormSection title="Behaviour" Icon={PackageCheck}>
        <SwitchField
          label="Email tracking number to customer"
          description="As soon as the label is bought, Pallio sends the customer their tracking link so they can follow the package."
          defaultChecked
        />
        <SwitchField
          label="Buy with signature required"
          description="The courier won't leave the package unattended. Worth the small extra charge for high-value or fragile items."
        />
        <SwitchField
          label="Auto-fulfil in the source order"
          description="Marks every item on the linked sales order as fulfilled. Turn off if you're doing a partial shipment and will fulfil the rest later."
          defaultChecked
        />
      </FormSection>
    </FormShell>
  )
}
