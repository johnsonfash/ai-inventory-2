"use client"

import { PageShell } from "@/src/components/page-shell"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/src/components/ui/card"
import { Label } from "@/src/components/ui/label"
import { Input } from "@/src/components/ui/input"
import { Button } from "@/src/components/ui/button"

export default function NewInstagramCampaign() {
  return (
    <PageShell title="Instagram Ads — New Campaign" withToolbar={false}>
      <Card>
        <CardHeader>
          <CardTitle>New Campaign</CardTitle>
          <CardDescription>Define reach, budget and schedule</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:max-w-xl">
          <div className="grid gap-2">
            <Label>Name</Label>
            <Input placeholder="Reels Launch" />
          </div>
          <div className="grid gap-2">
            <Label>Objective</Label>
            <Input placeholder="Engagement / Conversions / Awareness" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label>Daily Budget ($)</Label>
              <Input type="number" placeholder="75" />
            </div>
            <div className="grid gap-2">
              <Label>Max Spend ($)</Label>
              <Input type="number" placeholder="1500" />
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
