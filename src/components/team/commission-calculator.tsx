"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

export function CommissionCalculator({ totalRevenue = 0 }: { totalRevenue?: number }) {
  const [rate, setRate] = React.useState(5) // percent
  const [bonusThreshold, setBonusThreshold] = React.useState(5000)
  const [bonus, setBonus] = React.useState(250)
  const commission = Math.round(totalRevenue * (rate / 100) * 100) / 100
  const total = commission + (totalRevenue >= bonusThreshold ? bonus : 0)

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
            <Input type="number" value={rate} onChange={(e) => setRate(Math.max(0, Number(e.target.value) || 0))} />
          </label>
          <label className="text-sm">
            <div className="text-muted-foreground">Bonus Threshold</div>
            <Input
              type="number"
              value={bonusThreshold}
              onChange={(e) => setBonusThreshold(Number(e.target.value) || 0)}
            />
          </label>
          <label className="text-sm">
            <div className="text-muted-foreground">Bonus</div>
            <Input type="number" value={bonus} onChange={(e) => setBonus(Number(e.target.value) || 0)} />
          </label>
          <label className="text-sm">
            <div className="text-muted-foreground">Revenue</div>
            <Input type="number" value={totalRevenue} readOnly />
          </label>
        </div>
        <div className="rounded-md border p-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Commission</span>
            <span className="tabular-nums">${commission.toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Bonus</span>
            <span className="tabular-nums">${totalRevenue >= bonusThreshold ? bonus.toFixed(2) : "0.00"}</span>
          </div>
          <div className="mt-1 flex items-center justify-between text-base font-semibold">
            <span>Total Payout</span>
            <span className="tabular-nums">${total.toFixed(2)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
