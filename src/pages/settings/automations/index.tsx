import * as React from "react"
import { toast } from "sonner"
import { Bell, Bot, Mail, PackagePlus, Sparkles, Truck, Wand2, Zap } from "lucide-react"
import { PageShell } from "@/components/page-shell"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { useRegisterPageRefresh } from "@/hooks/use-pull-to-refresh"

type Rule = { id: string; when: string; then: string; on: boolean; Icon: typeof Zap }

const SEED: Rule[] = [
  { id: "r1", when: "Stock falls to its reorder point", then: "Email the team a low-stock heads-up", on: true,  Icon: PackagePlus },
  { id: "r2", when: "An invoice is 7 days overdue",      then: "Send the customer a payment reminder",  on: true,  Icon: Mail },
  { id: "r3", when: "A new order is paid",                then: "Notify the assigned sales rep",          on: true,  Icon: Bell },
  { id: "r4", when: "A shipment is marked delivered",     then: "Ask the customer for a review",          on: false, Icon: Truck },
  { id: "r5", when: "A supplier is 2+ days late",         then: "Flag it on the dashboard + notify buyer", on: false, Icon: Bot },
]

export default function AutomationsSettings() {
  useRegisterPageRefresh(React.useCallback(async () => { await new Promise((r) => setTimeout(r, 300)) }, []))
  const [rules, setRules] = React.useState<Rule[]>(SEED)
  const active = rules.filter((r) => r.on).length

  const toggle = (id: string) =>
    setRules((prev) => prev.map((r) => {
      if (r.id !== id) return r
      const on = !r.on
      toast[on ? "success" : "message"](on ? "Automation on" : "Automation paused", { description: r.then })
      return { ...r, on }
    }))

  return (
    <PageShell
      title="Automations"
      withToolbar={false}
      titleTooltip="Simple 'when this happens, do that' rules so routine follow-ups run themselves — low-stock emails, overdue reminders, review requests. Flip one on and Pallio handles it. More triggers + actions land with the backend."
    >
      <div className="flex flex-col gap-4">
        <Card>
          <CardContent className="flex items-center justify-between gap-3 p-4">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-soft text-brand dark:bg-primary/15 dark:text-primary">
                <Zap className="h-4 w-4" />
              </span>
              <div>
                <p className="text-sm font-semibold">{active} of {rules.length} automations on</p>
                <p className="text-[11px] text-muted-foreground">Routine follow-ups, handled for you.</p>
              </div>
            </div>
            <Button variant="outline" disabled onClick={() => toast("Custom builder coming soon")}>
              <Wand2 className="h-4 w-4" /> New automation · soon
            </Button>
          </CardContent>
        </Card>

        <ul className="flex flex-col gap-2">
          {rules.map((r) => (
            <li key={r.id} className="rounded-2xl border border-border bg-card p-3">
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                  <r.Icon className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm">
                    <span className="font-semibold">When</span> {r.when}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    <span className="font-semibold text-foreground">→</span> {r.then}
                  </p>
                </div>
                <Switch checked={r.on} onCheckedChange={() => toggle(r.id)} aria-label={`Toggle: ${r.then}`} />
              </div>
            </li>
          ))}
        </ul>

        <p className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <Sparkles className="h-3.5 w-3.5" /> Soon: build your own rules with any trigger + action, including AI steps.
        </p>
      </div>
    </PageShell>
  )
}
