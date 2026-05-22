import * as React from "react"

// Shared org + location state. Used by:
//   - OrgLocationSwitch (desktop top-bar dual-select)
//   - WorkspaceSwitcher (mobile + desktop accordion inside UserMenu)
//   - Any future page that needs to scope queries by org/location.
//
// State persists to localStorage. A custom event broadcasts changes
// so multiple instances of the hook stay in sync (otherwise the
// top-bar select and the avatar drawer's accordion would drift).

export type Org = { value: string; label: string; sub: string }
export type Loc = { value: string; label: string; sub: string }

// Mocked data. Real backend swaps these for the signed-in user's
// org list + the active org's locations.
export const ORGS: Org[] = [
  { value: "funke",     label: "Funke Apparel",  sub: "Fashion · 3 stores" },
  { value: "eko",       label: "Eko Provisions", sub: "Wholesale · 1 store" },
  { value: "lagosmart", label: "LagosMart",      sub: "Convenience · 2 stores" },
]

export const LOCS: Loc[] = [
  { value: "lekki", label: "Lekki Phase 1",   sub: "Lagos · Flagship" },
  { value: "ikeja", label: "Ikeja City Mall", sub: "Lagos · Kiosk" },
  { value: "wuse",  label: "Wuse 2",          sub: "Abuja · Showroom" },
]

const ORG_KEY = "iv:org"
const LOC_KEY = "iv:loc"
const ORG_EVT = "pallio:org-changed"
const LOC_EVT = "pallio:loc-changed"

function readStored(key: string, fallback: string): string {
  try { return localStorage.getItem(key) || fallback } catch { return fallback }
}

export function useOrgLocation() {
  const [org, setOrgState] = React.useState<string>(() => readStored(ORG_KEY, ORGS[0].value))
  const [loc, setLocState] = React.useState<string>(() => readStored(LOC_KEY, LOCS[0].value))

  const setOrg = React.useCallback((v: string) => {
    setOrgState(v)
    try { localStorage.setItem(ORG_KEY, v) } catch { /* private mode */ }
    window.dispatchEvent(new CustomEvent(ORG_EVT, { detail: v }))
  }, [])

  const setLoc = React.useCallback((v: string) => {
    setLocState(v)
    try { localStorage.setItem(LOC_KEY, v) } catch { /* private mode */ }
    window.dispatchEvent(new CustomEvent(LOC_EVT, { detail: v }))
  }, [])

  // Cross-instance sync — every mounted copy of the hook listens for
  // updates from any other copy. Without this, flipping org in the
  // avatar drawer wouldn't update the top-bar select live.
  React.useEffect(() => {
    const onOrg = (e: Event) => setOrgState((e as CustomEvent<string>).detail)
    const onLoc = (e: Event) => setLocState((e as CustomEvent<string>).detail)
    window.addEventListener(ORG_EVT, onOrg)
    window.addEventListener(LOC_EVT, onLoc)
    return () => {
      window.removeEventListener(ORG_EVT, onOrg)
      window.removeEventListener(LOC_EVT, onLoc)
    }
  }, [])

  const currentOrg = ORGS.find((o) => o.value === org) ?? ORGS[0]
  const currentLoc = LOCS.find((l) => l.value === loc) ?? LOCS[0]

  return { org, loc, setOrg, setLoc, currentOrg, currentLoc, orgs: ORGS, locs: LOCS }
}
