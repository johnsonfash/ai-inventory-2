import * as React from "react"
import { Box, Building2, ClipboardList, MapPin, User } from "lucide-react"
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

// New store / warehouse / pop-up. Pallio treats every physical
// location the same — a corner shop and a 1000-pallet warehouse both
// flow through this form. The fields scale: smaller setups can leave
// capacity + manager blank.

export default function NewWarehouse() {
  const [submitting, setSubmitting] = React.useState(false)

  return (
    <FormShell
      title="Add location"
      description="Stores, warehouses, kiosks, and pop-ups all live here."
      titleTooltip={
        <>
          Add a physical place that holds stock — your main shop, a
          back-of-house warehouse, a market pop-up, a kiosk inside
          another venue. Each location keeps its own stock count, can
          have its own staff + payment methods, and rolls up to the
          business totals.
        </>
      }
      backHref="/settings/warehouses"
      onSubmit={() => { setSubmitting(true); setTimeout(() => setSubmitting(false), 500) }}
      aside={
        <FormAside
          tips={[
            { title: "Code naming", body: "Short codes like LEK1 / IKJ1 keep dropdowns readable. Pallio uses them everywhere stock is referenced.", Icon: Building2 },
            { title: "Type", body: "Pick the closest match — it pre-configures the right behaviour (e.g. a Pop-up doesn't get a POS register by default).", Icon: Box },
            { title: "Default location", body: "Pallio uses the default for new POs and stock counts unless you override per-order.", Icon: MapPin },
          ]}
        />
      }
      footer={<FormFooter submitLabel="Create location" submitting={submitting} cancelHref="/settings/warehouses" />}
    >
      <FormSection title="Identity" Icon={Building2}>
        <FormGrid cols={3}>
          <FormField
            label="Code"
            required
            tooltip={
              <>
                A short identifier (3–5 letters/numbers) you'll see in
                dropdowns, on labels, and in reports. Common pattern:
                first three letters of the area, then a number — e.g.
                <span className="font-mono"> LEK1 </span> for Lekki,
                <span className="font-mono"> IKJ1 </span> for Ikeja.
              </>
            }
          >
            <Input placeholder="LEK1" required />
          </FormField>
          <FormField
            label="Name"
            required
            span={2}
            tooltip="The friendly name shown to staff and customers — e.g. 'Lekki Flagship Store'. Use the name everyone in your business actually calls the place."
          >
            <Input placeholder="Lekki Flagship Store" required />
          </FormField>
          <FormField
            label="Type"
            tooltip={
              <>
                <ul className="space-y-1.5">
                  <li><strong>Store</strong> — sells to walk-ins, has a POS register, holds its own stock.</li>
                  <li><strong>Warehouse</strong> — back-of-house storage, no POS, stock moves out to stores.</li>
                  <li><strong>Kiosk</strong> — small footprint inside another venue (mall, market stall).</li>
                  <li><strong>Pop-up</strong> — temporary location, e.g. a weekend market.</li>
                </ul>
              </>
            }
          >
            <Select defaultValue="store">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="store">Store</SelectItem>
                <SelectItem value="warehouse">Warehouse</SelectItem>
                <SelectItem value="kiosk">Kiosk</SelectItem>
                <SelectItem value="popup">Pop-up</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
          <FormField
            label="Status"
            tooltip="Active locations show up in dropdowns and sync stock. Set to 'Maintenance' temporarily during a refit so nothing routes there."
          >
            <Select defaultValue="active">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
                <SelectItem value="archived">Archived (no new movements)</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
        </FormGrid>
      </FormSection>

      <FormSection title="Address" Icon={MapPin}>
        <FormGrid cols={2}>
          <FormField
            label="Street + city"
            required
            span={2}
            tooltip="Printed on shipping labels and shown to staff on POs. For warehouses, this is the courier delivery address."
          >
            <Textarea placeholder={"12 Admiralty Way\nLekki Phase 1\nLagos 106104\nNigeria"} />
          </FormField>
          <FormField
            label="Time zone"
            tooltip="Pallio uses this when calculating 'today' for that location. Useful when you have stores in different countries."
          >
            <Select defaultValue="africa-lagos">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="africa-lagos">Africa / Lagos (WAT)</SelectItem>
                <SelectItem value="africa-accra">Africa / Accra (GMT)</SelectItem>
                <SelectItem value="africa-nairobi">Africa / Nairobi (EAT)</SelectItem>
                <SelectItem value="africa-johannesburg">Africa / Johannesburg (SAST)</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
          <FormField
            label="Phone"
            tooltip="A direct line for couriers + suppliers. Optional but lifesaves when a delivery driver is lost."
          >
            <Input type="tel" placeholder="+234 803 555 0100" />
          </FormField>
        </FormGrid>
      </FormSection>

      <FormSection title="Operations" Icon={ClipboardList}>
        <FormGrid cols={3}>
          <FormField
            label="Storage capacity"
            tooltip="How many SKU units this location can comfortably hold. Pallio uses it to compute the 'utilization' bar in reports — over 90% means time to lease more space or push stock to another location."
          >
            <Input type="number" placeholder="2000" />
          </FormField>
          <FormField
            label="Manager"
            tooltip="The team member responsible day-to-day. They become the default recipient of low-stock alerts + shrink reports for this location."
          >
            <Select>
              <SelectTrigger><SelectValue placeholder="Unassigned" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="mia">Mia Chen</SelectItem>
                <SelectItem value="alex">Alex Larson</SelectItem>
                <SelectItem value="priya">Priya Patel</SelectItem>
                <SelectItem value="tunde">Tunde Bello</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
          <FormField
            label="Opens at"
            tooltip="Used by the POS register's auto-open behaviour + on the storefront's hours page."
          >
            <Input type="time" defaultValue="09:00" />
          </FormField>
        </FormGrid>
      </FormSection>

      <FormSection title="Behaviour" Icon={User}>
        <SwitchField
          label="Use as default location"
          description="New purchase orders + stock counts assume this location unless you pick another. You can change this any time."
        />
        <SwitchField
          label="Accept walk-in sales"
          description="Enables the POS register at this location. Leave off for back-only warehouses."
          defaultChecked
        />
        <SwitchField
          label="Show on storefront 'Find us' page"
          description="Lists the address + phone on your public website. Turn off for warehouses you don't want customers visiting."
        />
      </FormSection>
    </FormShell>
  )
}
