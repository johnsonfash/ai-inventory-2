"use client"
import { PageShell } from "@/src/components/page-shell"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/src/components/ui/card"
import { Label } from "@/src/components/ui/label"
import { Input } from "@/src/components/ui/input"
import { Textarea } from "@/src/components/ui/textarea"
import { Button } from "@/src/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select"

export default function NewCustomer() {
  return (
    <PageShell title="Sales — Add Customer" withToolbar={false}>
      <Card>
        <CardHeader>
          <CardTitle>New Customer</CardTitle>
          <CardDescription>Contact info, addresses, and pricing</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="grid gap-2">
              <Label>Name</Label>
              <Input placeholder="NovaApps" />
            </div>
            <div className="grid gap-2">
              <Label>Email</Label>
              <Input type="email" placeholder="ops@novaapps.io" />
            </div>
            <div className="grid gap-2">
              <Label>Phone</Label>
              <Input placeholder="+1 555 0123" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label>Billing Address</Label>
              <Textarea placeholder="Street, City, State, ZIP, Country" />
            </div>
            <div className="grid gap-2">
              <Label>Shipping Address</Label>
              <Textarea placeholder="Street, City, State, ZIP, Country" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="grid gap-2">
              <Label>Price List</Label>
              <Select defaultValue="retail">
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="retail">Retail</SelectItem>
                  <SelectItem value="wholesale">Wholesale</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Tax ID</Label>
              <Input placeholder="TAX-12345" />
            </div>
            <div className="grid gap-2">
              <Label>Notes</Label>
              <Input placeholder="VIP customer" />
            </div>
          </div>
          <Button className="bg-violet-600 hover:bg-violet-600/90 w-fit">Create Customer</Button>
        </CardContent>
      </Card>
    </PageShell>
  )
}
