"use client"

import { PageShell } from "@/components/page-shell"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

const links = [
  { title: "Warehouses", href: "/settings/warehouses" },
  { title: "Users & Roles", href: "/settings/users" },
  { title: "Integrations", href: "/settings/integrations" },
  { title: "Preferences", href: "/settings/preferences" },
]

export default function SettingsIndex() {
  return (
    <PageShell title="Settings" withToolbar={false}>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {links.map((l) => (
          <Card key={l.href} className="hover:border-violet-300">
            <CardHeader>
              <CardTitle>
                <Link href={l.href} className="hover:underline">
                  {l.title}
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Configure {l.title.toLowerCase()}.</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </PageShell>
  )
}
