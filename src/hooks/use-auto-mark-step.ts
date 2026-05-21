import * as React from "react"
import { kvJson } from "@/lib/storage/kv"

// Auto-mark an onboarding step as done when the user lands on the
// page that demonstrates it. Removes the friction of having to
// manually tick a checkbox after you've actually done the thing.
//
// Usage at the top of a page component:
//   useAutoMarkStep("first-item")
//
// No-op if the step is already marked done. Fires once per mount.

const PROGRESS_KEY = "pallio:onboarding-progress"

export function useAutoMarkStep(stepKey: string) {
  React.useEffect(() => {
    const map = kvJson.get<Record<string, boolean>>(PROGRESS_KEY) ?? {}
    if (map[stepKey]) return
    const next = { ...map, [stepKey]: true }
    void kvJson.set(PROGRESS_KEY, next)
    window.dispatchEvent(new CustomEvent("pallio:onboarding-changed"))
  }, [stepKey])
}
