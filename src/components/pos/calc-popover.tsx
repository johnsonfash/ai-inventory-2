"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calculator } from "lucide-react"

export function CalcPopover() {
  const [open, setOpen] = React.useState(false)
  const [expr, setExpr] = React.useState("")
  const [result, setResult] = React.useState<string | number>("")

  function append(val: string) {
    setExpr((e) => e + val)
  }
  function clear() {
    setExpr("")
    setResult("")
  }
  function evalExpr() {
    try {
      // safe-ish eval: only numbers and operators
      if (!/^[\d+\-*/().\s]+$/.test(expr)) throw new Error("Invalid expression")
      // eslint-disable-next-line no-new-func
      const r = Function(`"use strict";return (${expr})`)()
      setResult(Number.isFinite(r) ? Number(r.toFixed(2)) : "Err")
    } catch {
      setResult("Err")
    }
  }

  return (
    <div className="relative">
      <Button variant="outline" className="bg-transparent" onClick={() => setOpen((o) => !o)} title="Calculator">
        <Calculator className="mr-2 h-4 w-4" /> Calc
      </Button>
      {open ? (
        <div className="absolute right-0 z-50 mt-2 w-[280px]">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Calculator</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <input
                value={expr}
                onChange={(e) => setExpr(e.target.value)}
                placeholder="Type: 10+20*3"
                className="h-9 w-full rounded-md border bg-background px-2 text-sm"
              />
              <div className="h-8 rounded-md bg-muted p-1 text-right text-sm tabular-nums">
                {result === "" ? "\u00a0" : result}
              </div>
              <div className="grid grid-cols-4 gap-2">
                {["7", "8", "9", "/", "4", "5", "6", "*", "1", "2", "3", "-", "0", ".", "(", "+"].map((k) => (
                  <Button key={k} variant="outline" className="bg-transparent" onClick={() => append(k)}>
                    {k}
                  </Button>
                ))}
                <Button variant="outline" className="col-span-2 bg-transparent" onClick={() => append(")")}>
                  )
                </Button>
                <Button variant="outline" className="bg-transparent" onClick={clear}>
                  C
                </Button>
                <Button onClick={evalExpr}>=</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : null}
    </div>
  )
}
