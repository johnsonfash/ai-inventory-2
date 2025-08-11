"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useEffect, useState } from "react"

const ORG_KEY = "iv:org"
const LOC_KEY = "iv:loc"

const orgs = ["Acme Inc", "BrightLane", "NovaApps"]
const locs = ["WH-A • Austin", "WH-B • Atlanta", "WH-C • Denver"]

export function OrgLocationSwitch() {
  const [org, setOrg] = useState<string>(() => orgs[0])
  const [loc, setLoc] = useState<string>(() => locs[0])

  useEffect(() => {
    localStorage.setItem(ORG_KEY, org)
  }, [org])

  useEffect(() => {
    localStorage.setItem(LOC_KEY, loc)
  }, [loc])

  return (
    <div className="hidden items-center gap-2 md:flex">
      <Select value={org} onValueChange={setOrg}>
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="Organization" />
        </SelectTrigger>
        <SelectContent>
          {orgs.map((o) => (
            <SelectItem key={o} value={o}>
              {o}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={loc} onValueChange={setLoc}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Location" />
        </SelectTrigger>
        <SelectContent>
          {locs.map((l) => (
            <SelectItem key={l} value={l}>
              {l}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
