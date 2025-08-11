"use client"
import { PageShell } from "@/src/components/page-shell"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/src/components/ui/card"
import { Label } from "@/src/components/ui/label"
import { Input } from "@/src/components/ui/input"
import { Button } from "@/src/components/ui/button"

export default function NewExpense() {
  return (
    <PageShell title="Expenses — New Entry" withToolbar={false}>
      <Card>
        <CardHeader>
          <CardTitle>Add Expense</CardTitle>
          <CardDescription>Record an operational expense</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-3 gap-3">
          <div className="grid gap-2">
            <Label>Category</Label>
            <Input placeholder="Shipping" />
          </div>
          <div className="grid gap-2">
            <Label>Amount</Label>
            <Input type="number" placeholder="0.00" />
          </div>
          <div className="grid gap-2">
            <Label>Date</Label>
            <Input type="date" />
          </div>
          <div className="col-span-3">
            <Button className="bg-violet-600 hover:bg-violet-600/90">Save Expense</Button>
          </div>
        </CardContent>
      </Card>
    </PageShell>
  )
}
