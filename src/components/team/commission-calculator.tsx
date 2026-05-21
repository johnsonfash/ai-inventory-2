
import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useCurrency } from "@/contexts/currency"

export function CommissionCalculator({ totalRevenue = 0 }: { totalRevenue?: number }) {
  const [rate, setRate] = React.useState(5) // percent
  const [bonusThreshold, setBonusThreshold] = React.useState(5000)
  const [bonus, setBonus] = React.useState(250)
  const commission = Math.round(totalRevenue * (rate / 100) * 100) / 100
  const total = commission + (totalRevenue >= bonusThreshold ? bonus : 0)
  const { formatPrice } = useCurrency()

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>Commission Calculator</CardTitle>
        <CardDescription>Quickly simulate payouts</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <label className="text-sm">
            <div className="text-muted-foreground">Commission %</div>
            <Input type="number" placeholder="0" value={rate === 0 ? "" : rate} onChange={(e) => setRate(e.target.value === "" ? 0 : Math.max(0, Number(e.target.value) || 0))} />
          </label>
          <label className="text-sm">
            <div className="text-muted-foreground">Bonus Threshold</div>
            <Input
              type="number"
              placeholder="0"
              value={bonusThreshold === 0 ? "" : bonusThreshold}
              onChange={(e) => setBonusThreshold(e.target.value === "" ? 0 : Number(e.target.value) || 0)}
            />
          </label>
          <label className="text-sm">
            <div className="text-muted-foreground">Bonus</div>
            <Input type="number" placeholder="0" value={bonus === 0 ? "" : bonus} onChange={(e) => setBonus(e.target.value === "" ? 0 : Number(e.target.value) || 0)} />
          </label>
          <label className="text-sm">
            <div className="text-muted-foreground">Revenue</div>
            <Input type="number" placeholder="0" value={totalRevenue === 0 ? "" : totalRevenue} readOnly />
          </label>
        </div>
        <div className="rounded-md border p-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Commission</span>
            <span className="tabular-nums">{formatPrice(commission)}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Bonus</span>
            <span className="tabular-nums">{formatPrice(totalRevenue >= bonusThreshold ? bonus : 0)}</span>
          </div>
          <div className="mt-1 flex items-center justify-between text-base font-semibold">
            <span>Total Payout</span>
            <span className="tabular-nums">{formatPrice(total)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
