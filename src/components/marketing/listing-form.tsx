"use client"

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/src/components/ui/card"
import { Label } from "@/src/components/ui/label"
import { Input } from "@/src/components/ui/input"
import { Textarea } from "@/src/components/ui/textarea"
import { Switch } from "@/src/components/ui/switch"
import { Button } from "@/src/components/ui/button"
import * as React from "react"

type Channel = "facebook-ads" | "instagram-ads" | "youtube-adsense" | "facebook-marketplace"

export function ListingForm({ defaultChannel }: { defaultChannel?: Channel }) {
  const [channels, setChannels] = React.useState<Record<Channel, boolean>>({
    "facebook-ads": defaultChannel === "facebook-ads",
    "instagram-ads": defaultChannel === "instagram-ads",
    "youtube-adsense": defaultChannel === "youtube-adsense",
    "facebook-marketplace": defaultChannel === "facebook-marketplace",
  })

  const toggle = (key: Channel) => setChannels((p) => ({ ...p, [key]: !p[key] }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Listing</CardTitle>
        <CardDescription>Publish across selected ad channels</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="grid gap-2">
            <Label>Title</Label>
            <Input placeholder="USB‑C Hub 6‑in‑1" />
          </div>
          <div className="grid gap-2">
            <Label>SKU</Label>
            <Input placeholder="EL-2109" />
          </div>
        </div>
        <div className="grid gap-2">
          <Label>Description</Label>
          <Textarea placeholder="Describe the item and its benefits..." />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="grid gap-2">
            <Label>Price</Label>
            <Input type="number" placeholder="0.00" />
          </div>
          <div className="grid gap-2">
            <Label>Inventory On-hand</Label>
            <Input type="number" placeholder="0" />
          </div>
        </div>
        <div className="grid gap-2">
          <Label>Image URL</Label>
          <Input placeholder="/images/product.png" />
        </div>

        <div className="grid gap-3 rounded-lg border p-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center justify-between">
              <Label>Facebook Ads</Label>
              <Switch checked={channels["facebook-ads"]} onCheckedChange={() => toggle("facebook-ads")} />
            </div>
            <div className="flex items-center justify-between">
              <Label>Instagram Ads</Label>
              <Switch checked={channels["instagram-ads"]} onCheckedChange={() => toggle("instagram-ads")} />
            </div>
            <div className="flex items-center justify-between">
              <Label>YouTube/AdSense</Label>
              <Switch checked={channels["youtube-adsense"]} onCheckedChange={() => toggle("youtube-adsense")} />
            </div>
            <div className="flex items-center justify-between">
              <Label>Facebook Marketplace</Label>
              <Switch
                checked={channels["facebook-marketplace"]}
                onCheckedChange={() => toggle("facebook-marketplace")}
              />
            </div>
          </div>
        </div>

        <Button className="w-fit">Publish</Button>
      </CardContent>
    </Card>
  )
}
