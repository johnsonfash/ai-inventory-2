"use client"

import { PageShell } from "@/components/page-shell"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export default function NewYouTubeCampaign() {
  return (
    <PageShell title="YouTube & AdSense — New Campaign" withToolbar={false}>
      <Card>
        <CardHeader>
          <CardTitle>New Campaign</CardTitle>
          <CardDescription>Video views, budget and schedule</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:max-w-xl">
          <div className="grid gap-2">
            <Label>Name</Label>
            <Input placeholder="Accessories Promo" />
          </div>
          <div className="grid gap-2">
            <Label>Objective</Label>
            <Input placeholder="Views / Conversions / Awareness" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label>Daily Budget ($)</Label>
              <Input type="number" placeholder="100" />
            </div>
            <div className="grid gap-2">
              <Label>Max Spend ($)</Label>
              <Input type="number" placeholder="2000" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label>Start Date</Label>
              <Input type="date" />
            </div>
            <div className="grid gap-2">
              <Label>End Date</Label>
              <Input type="date" />
            </div>
          </div>
          <Button className="w-fit">Create Campaign</Button>
        </CardContent>
      </Card>
    </PageShell>
  )
}
