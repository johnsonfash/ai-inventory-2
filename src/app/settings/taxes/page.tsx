"use client"
import { PageShell } from "@/src/components/page-shell"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/src/components/ui/card"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/src/components/ui/table"
import { Button } from "@/src/components/ui/button"
export default function TaxRates() {
  const rows = [{ name: "Standard", rate: 8 }]
  return (
    <PageShell title="Settings — Tax Rates" withToolbar={false}>
      <Card>
        <CardHeader className="flex items-center justify-between">
          <div>
            <CardTitle>Tax Rates</CardTitle>
            <CardDescription>Jurisdictions and rates</CardDescription>
          </div>
          <Button>Add Rate</Button>
        </CardHeader>
        <CardContent>
          <div className="overflow-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead className="text-right">Rate (%)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r) => (
                  <TableRow key={r.name}>
                    <TableCell>{r.name}</TableCell>
                    <TableCell className="text-right tabular-nums">{r.rate}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </PageShell>
  )
}
