import { Building2, MapPin } from "lucide-react"
import { useEffect, useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const ORG_KEY = "iv:org"
const LOC_KEY = "iv:loc"

// Businesses the signed-in user can switch between (dummy data world).
// Realistic Nigerian SMBs to match Pallio's launch market.
const orgs = [
  { value: "funke",      label: "Funke Apparel",  sub: "Fashion · 3 stores" },
  { value: "eko",        label: "Eko Provisions", sub: "Wholesale · 1 store" },
  { value: "lagosmart",  label: "LagosMart",      sub: "Convenience · 2 stores" },
]

// Stores / warehouses owned by the active org.
// Single-line labels so the trigger never wraps; the city is shown as
// a muted sub-line inside the dropdown.
const locs = [
  { value: "lekki",  label: "Lekki Phase 1",   sub: "Lagos · Flagship" },
  { value: "ikeja",  label: "Ikeja City Mall", sub: "Lagos · Kiosk" },
  { value: "wuse",   label: "Wuse 2",          sub: "Abuja · Showroom" },
]

export function OrgLocationSwitch() {
  const [org, setOrg] = useState<string>(() => orgs[0].value)
  const [loc, setLoc] = useState<string>(() => locs[0].value)

  useEffect(() => {
    localStorage.setItem(ORG_KEY, org)
  }, [org])

  useEffect(() => {
    localStorage.setItem(LOC_KEY, loc)
  }, [loc])

  const orgLabel = orgs.find((o) => o.value === org)?.label ?? orgs[0].label
  const locLabel = locs.find((l) => l.value === loc)?.label ?? locs[0].label

  return (
    <div className="hidden items-center gap-2 md:flex">
      <Select value={org} onValueChange={setOrg}>
        <SelectTrigger className="w-[180px]">
          <span className="flex min-w-0 items-center gap-2">
            <Building2 className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            <SelectValue placeholder="Organization">{orgLabel}</SelectValue>
          </span>
        </SelectTrigger>
        <SelectContent>
          {orgs.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              <div className="flex min-w-0 flex-col leading-tight">
                <span className="text-sm font-semibold">{o.label}</span>
                <span className="text-[11px] text-muted-foreground">{o.sub}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={loc} onValueChange={setLoc}>
        <SelectTrigger className="w-[200px]">
          <span className="flex min-w-0 items-center gap-2">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            <SelectValue placeholder="Location">{locLabel}</SelectValue>
          </span>
        </SelectTrigger>
        <SelectContent>
          {locs.map((l) => (
            <SelectItem key={l.value} value={l.value}>
              <div className="flex min-w-0 flex-col leading-tight">
                <span className="text-sm font-semibold">{l.label}</span>
                <span className="text-[11px] text-muted-foreground">{l.sub}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
