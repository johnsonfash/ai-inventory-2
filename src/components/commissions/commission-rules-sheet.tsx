import * as React from "react"
import { toast } from "sonner"
import { Plus, Trash2 } from "lucide-react"
import { BottomSheet } from "@/components/mobile/bottom-sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useCurrency } from "@/contexts/currency"
import {
  loadCommissionRules,
  resolveSaleRate,
  saveCommissionRules,
  type CommissionRules,
} from "@/lib/commissions/rules"

// Editor for the commission rule engine: default + per-tier + per-rep
// rates. A live preview resolves an example so the operator sees exactly
// what a rep would earn before saving.
export function CommissionRulesSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { formatPrice, symbol } = useCurrency()
  const [rules, setRules] = React.useState<CommissionRules>(loadCommissionRules)
  const [previewRevenue, setPreviewRevenue] = React.useState(1_500_000)
  const [previewRep, setPreviewRep] = React.useState("")

  // Reload from storage each time it opens (discard an unsaved draft).
  React.useEffect(() => { if (open) setRules(loadCommissionRules()) }, [open])

  const set = <K extends keyof CommissionRules>(key: K, value: CommissionRules[K]) =>
    setRules((r) => ({ ...r, [key]: value }))

  const save = () => {
    // Keep tiers sorted + drop empty overrides.
    const cleaned: CommissionRules = {
      ...rules,
      tiers: [...rules.tiers].sort((a, b) => a.threshold - b.threshold),
      repOverrides: rules.repOverrides.filter((o) => o.name.trim().length > 0),
    }
    saveCommissionRules(cleaned)
    toast.success("Commission rules saved", { description: "New commissions use these rates." })
    onClose()
  }

  const effective = resolveSaleRate(rules, previewRevenue, previewRep)
  const previewPayout = Math.round(previewRevenue * (effective / 100))

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title="Commission rules"
      description="Set how rates are chosen. A per-rep override wins; otherwise the highest tier met; otherwise the default."
      maxHeightVh={88}
      footer={
        <div className="flex items-center justify-end gap-2 pb-3">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={save}>Save rules</Button>
        </div>
      }
    >
      <div className="flex flex-col gap-4 pb-1">
        {/* Defaults */}
        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-1.5 text-xs">
            <span className="font-semibold text-foreground/80">Default sales rate</span>
            <PercentInput value={rules.defaultSaleRate} onChange={(v) => set("defaultSaleRate", v)} />
          </label>
          <label className="flex flex-col gap-1.5 text-xs">
            <span className="font-semibold text-foreground/80">Affiliate rate</span>
            <PercentInput value={rules.defaultAffiliateRate} onChange={(v) => set("defaultAffiliateRate", v)} />
          </label>
        </div>

        {/* Tiers */}
        <div>
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-foreground/80">Performance tiers</p>
            <Button size="sm" variant="ghost" onClick={() => set("tiers", [...rules.tiers, { threshold: 0, rate: rules.defaultSaleRate }])}>
              <Plus className="h-3.5 w-3.5" /> Tier
            </Button>
          </div>
          <p className="mb-1.5 text-[11px] text-muted-foreground">When a rep's period revenue reaches the threshold, this rate applies.</p>
          <div className="flex flex-col gap-2">
            {rules.tiers.length === 0 && <p className="text-[11px] text-muted-foreground">No tiers — everyone earns the default until you add one.</p>}
            {rules.tiers.map((t, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="flex flex-1 items-center gap-1.5 rounded-lg border border-border bg-background px-2.5">
                  <span className="text-xs text-muted-foreground">≥ {symbol}</span>
                  <input type="number" value={t.threshold} onChange={(e) => set("tiers", rules.tiers.map((x, j) => j === i ? { ...x, threshold: Number(e.target.value) } : x))} className="h-9 w-full bg-transparent text-sm outline-none" />
                </div>
                <div className="w-24"><PercentInput value={t.rate} onChange={(v) => set("tiers", rules.tiers.map((x, j) => j === i ? { ...x, rate: v } : x))} /></div>
                <button type="button" onClick={() => set("tiers", rules.tiers.filter((_, j) => j !== i))} aria-label="Remove tier" className="text-rose-600 hover:text-rose-700 dark:text-rose-400">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Per-rep overrides */}
        <div>
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-foreground/80">Per-rep overrides</p>
            <Button size="sm" variant="ghost" onClick={() => set("repOverrides", [...rules.repOverrides, { name: "", rate: rules.defaultSaleRate }])}>
              <Plus className="h-3.5 w-3.5" /> Override
            </Button>
          </div>
          <p className="mb-1.5 text-[11px] text-muted-foreground">A named person's rate, beating tiers and the default.</p>
          <div className="flex flex-col gap-2">
            {rules.repOverrides.length === 0 && <p className="text-[11px] text-muted-foreground">No overrides.</p>}
            {rules.repOverrides.map((o, i) => (
              <div key={i} className="flex items-center gap-2">
                <Input value={o.name} onChange={(e) => set("repOverrides", rules.repOverrides.map((x, j) => j === i ? { ...x, name: e.target.value } : x))} placeholder="Rep name" className="flex-1" />
                <div className="w-24"><PercentInput value={o.rate} onChange={(v) => set("repOverrides", rules.repOverrides.map((x, j) => j === i ? { ...x, rate: v } : x))} /></div>
                <button type="button" onClick={() => set("repOverrides", rules.repOverrides.filter((_, j) => j !== i))} aria-label="Remove override" className="text-rose-600 hover:text-rose-700 dark:text-rose-400">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Live preview */}
        <div className="rounded-xl border border-border bg-muted/40 p-3">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Try it</p>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <label className="flex flex-col gap-1 text-[11px]">
              <span className="text-muted-foreground">Period revenue</span>
              <div className="flex items-center gap-1 rounded-lg border border-border bg-background px-2.5">
                <span className="text-xs text-muted-foreground">{symbol}</span>
                <input type="number" value={previewRevenue} onChange={(e) => setPreviewRevenue(Number(e.target.value))} className="h-9 w-full bg-transparent text-sm outline-none" />
              </div>
            </label>
            <label className="flex flex-col gap-1 text-[11px]">
              <span className="text-muted-foreground">Rep (optional)</span>
              <Input value={previewRep} onChange={(e) => setPreviewRep(e.target.value)} placeholder="match an override" />
            </label>
          </div>
          <p className="mt-2 text-sm">
            Effective rate <strong className="text-brand dark:text-primary">{effective}%</strong> · commission <strong className="tabular-nums">{formatPrice(previewPayout)}</strong>
          </p>
        </div>
      </div>
    </BottomSheet>
  )
}

function PercentInput({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center rounded-lg border border-border bg-background px-2.5">
      <input type="number" step="0.5" value={value} onChange={(e) => onChange(Number(e.target.value))} className="h-9 w-full bg-transparent text-sm outline-none" />
      <span className="text-xs text-muted-foreground">%</span>
    </div>
  )
}
