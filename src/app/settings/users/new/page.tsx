"use client"

import { PageShell } from "@/src/components/page-shell"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/src/components/ui/card"
import { Label } from "@/src/components/ui/label"
import { Input } from "@/src/components/ui/input"
import { Button } from "@/src/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select"

export default function InviteUser() {
  return (
    <PageShell title="Settings — Invite User" withToolbar={false}>
      <Card>
        <CardHeader>
          <CardTitle>Invite User</CardTitle>
          <CardDescription>Send an invitation email</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:max-w-xl">
          <div className="grid gap-2">
            <Label>Name</Label>
            <Input placeholder="Mia Chen" />
          </div>
          <div className="grid gap-2">
            <Label>Email</Label>
            <Input type="email" placeholder="mia@example.com" />
          </div>
          <div className="grid gap-2">
            <Label>Role</Label>
            <Select defaultValue="viewer">
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="viewer">Viewer</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button className="w-fit">Send Invite</Button>
        </CardContent>
      </Card>
    </PageShell>
  )
}
