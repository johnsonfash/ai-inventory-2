import { Building2, MapPin } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useOrgLocation } from "@/hooks/use-org-location"

// Desktop top-bar dual-select. Shares state via useOrgLocation with
// the WorkspaceSwitcher in UserMenu's drawer — flipping either side
// instantly updates the other.
//
// Compact at md (just first word: "Funke" / "Lekki") so the header
// doesn't push the avatar off-screen at narrow desktop widths.
// Full label at lg+ (≥1024px).
export function OrgLocationSwitch() {
  const { org, setOrg, loc, setLoc, currentOrg, currentLoc, orgs, locs } = useOrgLocation()
  // Compact label = first word only. "Funke Apparel" → "Funke",
  // "Lekki Phase 1" → "Lekki". Used at md-lg widths.
  const orgShort = currentOrg.label.split(/\s+/)[0]
  const locShort = currentLoc.label.split(/\s+/)[0]

  return (
    <div className="hidden items-center gap-2 md:flex">
      <Select value={org} onValueChange={setOrg}>
        <SelectTrigger className="w-[120px] lg:w-[180px]">
          <span className="flex min-w-0 items-center gap-2">
            <Building2 className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            <SelectValue placeholder="Organization">
              <span className="truncate lg:hidden">{orgShort}</span>
              <span className="hidden truncate lg:inline">{currentOrg.label}</span>
            </SelectValue>
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
        <SelectTrigger className="w-[120px] lg:w-[200px]">
          <span className="flex min-w-0 items-center gap-2">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            <SelectValue placeholder="Location">
              <span className="truncate lg:hidden">{locShort}</span>
              <span className="hidden truncate lg:inline">{currentLoc.label}</span>
            </SelectValue>
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
