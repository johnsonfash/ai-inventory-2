"use client"

import { PageShell } from "@/components/page-shell"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"

export default function NewRole() {
  return (
    <PageShell title="Settings — Add Role" withToolbar={false}>
      <Card>
        <CardHeader>
          <CardTitle>New Role</CardTitle>
          <CardDescription>Define permissions</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:max-w-xl">
          <div className="grid gap-2">
            <Label>Name</Label>
            <Input placeholder="Warehouse Manager" />
          </div>
          <div className="grid gap-3 rounded-lg border p-3">
            <div className="flex items-center justify-between">
              <Label>Inventory</Label>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <Label>Sales</Label>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <Label>Purchasing</Label>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <Label>Accounting</Label>
              <Switch />
            </div>
            <div className="flex items-center justify-between">
              <Label>Settings</Label>
              <Switch />
            </div>
          </div>
          <Button className="w-fit">Create Role</Button>
        </CardContent>
      </Card>
    </PageShell>
  )
}
