"use client"

import * as React from "react"
import Link from "next/link"
import { PageShell } from "@/components/page-shell"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

type Category = "Commerce" | "Shipping" | "Payments" | "Ads" | "Productivity" | "Website" | "Calendar"

type Integration = {
  name: string
  href: string
  category: Category
  connected?: boolean
}

const ALL_INTEGRATIONS: Integration[] = [
  { name: "Shopify", href: "/settings/integrations/shopify", category: "Commerce", connected: false },
  { name: "WooCommerce", href: "/settings/integrations/woocommerce", category: "Commerce", connected: false },
  { name: "Shippo (Shipping)", href: "/settings/integrations/shippo", category: "Shipping", connected: false },
  { name: "EasyPost (Shipping)", href: "/settings/integrations/easypost", category: "Shipping", connected: false },
  { name: "Stripe (Payments)", href: "/settings/integrations/stripe", category: "Payments", connected: false },
  { name: "PayPal (Payments)", href: "/settings/integrations/paypal", category: "Payments", connected: false },
  { name: "Facebook Ads", href: "/settings/integrations/facebook-ads", category: "Ads", connected: false },
  { name: "Instagram Ads", href: "/settings/integrations/instagram-ads", category: "Ads", connected: false },
  {
    name: "Facebook Marketplace",
    href: "/settings/integrations/facebook-marketplace",
    category: "Ads",
    connected: false,
  },
  { name: "YouTube & AdSense", href: "/settings/integrations/youtube-adsense", category: "Ads", connected: false },
  {
    name: "Google Workspace",
    href: "/settings/integrations/google-workspace",
    category: "Productivity",
    connected: false,
  },
  { name: "Calendar", href: "/settings/integrations/calendar", category: "Calendar", connected: false },
  { name: "Website Widget", href: "/settings/integrations/website", category: "Website", connected: false },
]

const CATEGORIES: Category[] = ["Commerce", "Shipping", "Payments", "Ads", "Productivity", "Website", "Calendar"]

export default function Integrations() {
  const [query, setQuery] = React.useState("")
  const [activeCategory, setActiveCategory] = React.useState<Category | "All">("All")
  const [connected, setConnected] = React.useState<Record<string, boolean>>(() =>
    Object.fromEntries(ALL_INTEGRATIONS.map((i) => [i.name, !!i.connected])),
  )

  const filtered = ALL_INTEGRATIONS.filter((i) => {
    const matchesQ = i.name.toLowerCase().includes(query.toLowerCase())
    const matchesCat = activeCategory === "All" ? true : i.category === activeCategory
    return matchesQ && matchesCat
  })

  const toggle = (name: string) => setConnected((p) => ({ ...p, [name]: !p[name] }))

  return (
    <PageShell title="Settings — Integrations" withToolbar={false}>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Input
          placeholder="Search integrations..."
          className="w-full sm:w-64"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <div className="flex flex-wrap gap-2">
          <Button variant={activeCategory === "All" ? "default" : "outline"} onClick={() => setActiveCategory("All")}>
            All
          </Button>
          {CATEGORIES.map((c) => (
            <Button key={c} variant={activeCategory === c ? "default" : "outline"} onClick={() => setActiveCategory(c)}>
              {c}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((i) => {
          const isConnected = connected[i.name]
          return (
            <Card key={i.name}>
              <CardHeader className="flex items-center justify-between space-y-0">
                <div>
                  <CardTitle>{i.name}</CardTitle>
                  <CardDescription>{i.category}</CardDescription>
                </div>
                <Badge variant={isConnected ? "default" : "outline"}>
                  {isConnected ? "Connected" : "Not Connected"}
                </Badge>
              </CardHeader>
              <CardContent className="flex gap-2">
                <Link href={i.href}>
                  <Button className="bg-emerald-600 hover:bg-emerald-600/90">
                    {isConnected ? "Configure" : "Connect"}
                  </Button>
                </Link>
                <Button variant="outline" onClick={() => toggle(i.name)}>
                  {isConnected ? "Disconnect" : "Mark Connected"}
                </Button>
                <Button variant="outline" className="bg-transparent">
                  Docs
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </PageShell>
  )
}
