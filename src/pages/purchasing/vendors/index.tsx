
import { Link } from "react-router-dom"
import { PageShell } from "@/components/page-shell"
import { MobileFab } from "@/components/mobile/mobile-fab"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"

export default function Vendors() {
  const rows = [
    { name: "Cobalt", email: "sales@cobalt.com", phone: "+1 555 0100" },
    { name: "Delta", email: "orders@delta.com", phone: "+1 555 0101" },
  ]
  return (
    <PageShell
      title="Vendors"
      withToolbar
      titleTooltip={
        <>
          Suppliers you buy stock from. Each row stores their contact,
          payment terms, lead time, currency, and running spend.
          Adding a vendor here lets you reference them on POs, bills,
          and credit memos.
        </>
      }
    >
      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle>Vendors</CardTitle>
          <Link to="/purchasing/vendors/new">
            <Button className="bg-violet-600 hover:bg-violet-600/90">Add Vendor</Button>
          </Link>
        </CardHeader>
        <CardContent>
          <div className="overflow-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r) => (
                  <TableRow key={r.email}>
                    <TableCell>{r.name}</TableCell>
                    <TableCell>{r.email}</TableCell>
                    <TableCell>{r.phone}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <MobileFab href="/purchasing/vendors/new" label="Add vendor" />
    </PageShell>
  )
}
