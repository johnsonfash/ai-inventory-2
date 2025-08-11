"use client"
import Link from "next/link"
import { PageShell } from "@/src/components/page-shell"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/src/components/ui/card"
import { Button } from "@/src/components/ui/button"

const pages = [
  { name: "Facebook Marketplace", href: "/marketing/facebook-marketplace" },
  { name: "Facebook Ads", href: "/marketing/facebook-ads" },
  { name: "Instagram Ads", href: "/marketing/instagram-ads" },
  { name: "YouTube & AdSense", href: "/marketing/youtube-adsense" },
]

export default function Marketing() {
  return (
    <PageShell title="Marketing — Overview" withToolbar={false}>
      <div className="grid gap-4 md:grid-cols-2">
        {pages.map((p) => (
          <Card key={p.href}>
            <CardHeader>
              <CardTitle>{p.name}</CardTitle>
              <CardDescription>Manage listings & ads</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href={p.href}>
                <Button>Open</Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </PageShell>
  )
}
