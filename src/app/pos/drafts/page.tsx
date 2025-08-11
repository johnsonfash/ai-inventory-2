"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { PageShell } from "@/components/page-shell"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { deleteDraft, listDrafts } from "@/lib/pos/storage"
import { Layers, Trash2 } from "lucide-react"

export default function DraftsPage() {
  const router = useRouter()
  const [drafts, setDrafts] = React.useState(listDrafts())

  const del = (id: string) => {
    deleteDraft(id)
    setDrafts(listDrafts())
  }

  return (
    <PageShell title="POS Drafts">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center">
            <Layers className="mr-2 h-5 w-5" /> Suspended Sales
          </CardTitle>
          <CardDescription>Save, restore, or remove held sales</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Created</TableHead>
                  <TableHead>Note</TableHead>
                  <TableHead className="text-right">Items</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {drafts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">
                      No drafts saved.
                    </TableCell>
                  </TableRow>
                ) : (
                  drafts.map((d) => (
                    <TableRow key={d.id}>
                      <TableCell>{new Date(d.createdAt).toLocaleString()}</TableCell>
                      <TableCell className="max-w-[420px] truncate">{d.note || "-"}</TableCell>
                      <TableCell className="text-right tabular-nums">{d.items.length}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button onClick={() => router.push(`/pos?draftId=${d.id}`)}>Restore</Button>
                          <Button variant="outline" className="bg-transparent" onClick={() => del(d.id)}>
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </PageShell>
  )
}
