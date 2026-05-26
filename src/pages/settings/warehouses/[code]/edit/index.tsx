
import { useNavigate, useParams } from "react-router-dom"
import { toast } from "sonner"
import { PageShell } from "@/components/page-shell"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export default function EditWarehouse() {
  const params = useParams<{ code: string }>()
  const navigate = useNavigate()
  const code = params.code?.toUpperCase?.() ?? "WH-?"
  const onSave = () => {
    toast.success(`Warehouse ${code} saved`)
    navigate("/settings/warehouses")
  }
  return (
    <PageShell
      title={`Edit warehouse · ${code}`}
      withToolbar={false}
      titleTooltip={
        <>
          Update the address, manager, capacity, or operating hours
          for this location. Changes apply immediately — newly-saved
          values flow into every PO, label, and report. Archive the
          location instead of deleting if you've used it before.
        </>
      }
    >
      <Card>
        <CardHeader>
          <CardTitle>Edit Warehouse</CardTitle>
          <CardDescription>Update warehouse details</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:max-w-xl">
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label>Code</Label>
              <Input defaultValue={code} />
            </div>
            <div className="grid gap-2">
              <Label>Name</Label>
              <Input defaultValue={code === "WH-A" ? "Main Warehouse" : "Warehouse"} />
            </div>
          </div>
          <div className="grid gap-2">
            <Label>Address</Label>
            <Input defaultValue={code === "WH-A" ? "Austin, TX" : ""} />
          </div>
          <Button className="w-fit" onClick={onSave}>Save Changes</Button>
        </CardContent>
      </Card>
    </PageShell>
  )
}
