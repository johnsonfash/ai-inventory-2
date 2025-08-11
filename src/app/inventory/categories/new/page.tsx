"use client"

import { PageShell } from "@/src/components/page-shell"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/src/components/ui/card"
import { Label } from "@/src/components/ui/label"
import { Input } from "@/src/components/ui/input"
import { Textarea } from "@/src/components/ui/textarea"
import { Button } from "@/src/components/ui/button"

export default function NewCategory() {
  return (
    <PageShell title="Inventory — Add Category" withToolbar={false}>
      <Card>
        <CardHeader>
          <CardTitle>New Category</CardTitle>
          <CardDescription>Create a category to group items</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:max-w-xl">
          <div className="grid gap-2">
            <Label>Name</Label>
            <Input placeholder="Electronics" />
          </div>
          <div className="grid gap-2">
            <Label>Description</Label>
            <Textarea placeholder="Used for gadgets, accessories…" />
          </div>
          <Button className="bg-violet-600 hover:bg-violet-600/90 w-fit">Create Category</Button>
        </CardContent>
      </Card>
    </PageShell>
  )
}
