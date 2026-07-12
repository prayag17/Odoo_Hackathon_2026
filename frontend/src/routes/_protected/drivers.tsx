import { useState } from 'react'
import {
  type Driver,
  useCreateDriver,
  useDrivers,
  useUpdateDriver,
} from '#/hooks/use-drivers'
import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '#/components/ui/card'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import { NumberField } from '#/components/number-field'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select'
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '#/components/ui/sheet'
import { Skeleton } from '#/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '#/components/ui/table'
import { createFileRoute } from '@tanstack/react-router'
import { PlusIcon } from 'lucide-react'

export const Route = createFileRoute('/_protected/drivers')({
  component: RouteComponent,
})

const STATUSES: Driver['status'][] = ['Available', 'On Trip', 'Off Duty', 'Suspended']

const STATUS_VARIANT: Record<Driver['status'], 'default' | 'secondary' | 'outline' | 'destructive'> = {
  Available: 'default',
  'On Trip': 'secondary',
  'Off Duty': 'outline',
  Suspended: 'destructive',
}

const emptyForm = {
  name: '',
  license_number: '',
  license_category: '',
  license_expiry_date: '',
  contact_number: '',
  safety_score: '100',
  status: 'Available' as Driver['status'],
}

function RouteComponent() {
  const { data, isLoading, isError } = useDrivers()
  const createDriver = useCreateDriver()
  const updateDriver = useUpdateDriver()

  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState<string | null>(null)

  function openCreate() {
    setEditingId(null)
    setForm(emptyForm)
    setError(null)
    setOpen(true)
  }

  function openEdit(driver: Driver) {
    setEditingId(driver.id)
    setForm({
      name: driver.name,
      license_number: driver.license_number,
      license_category: driver.license_category ?? '',
      license_expiry_date: driver.license_expiry_date ?? '',
      contact_number: driver.contact_number ?? '',
      safety_score: String(driver.safety_score),
      status: driver.status,
    })
    setError(null)
    setOpen(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    const payload = {
      name: form.name,
      license_number: form.license_number,
      license_category: form.license_category || undefined,
      license_expiry_date: form.license_expiry_date || undefined,
      contact_number: form.contact_number || undefined,
      safety_score: Number(form.safety_score) || 0,
      status: form.status,
    }

    try {
      if (editingId) {
        await updateDriver.mutateAsync({ id: editingId, ...payload })
      } else {
        await createDriver.mutateAsync(payload)
      }
      setOpen(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    }
  }

  const saving = createDriver.isPending || updateDriver.isPending

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Drivers</CardTitle>
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger
              render={
                <Button size="sm" onClick={openCreate}>
                  <PlusIcon data-icon="inline-start" />
                  Add Driver
                </Button>
              }
            />
            <SheetContent>
              <SheetHeader>
                <SheetTitle>{editingId ? 'Edit Driver' : 'Add Driver'}</SheetTitle>
              </SheetHeader>
              <form
                onSubmit={handleSubmit}
                className="flex flex-1 flex-col gap-4 overflow-y-auto px-6"
              >
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="license_number">License Number</Label>
                  <Input
                    id="license_number"
                    required
                    value={form.license_number}
                    onChange={(e) =>
                      setForm({ ...form, license_number: e.target.value })
                    }
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="license_category">License Category</Label>
                  <Input
                    id="license_category"
                    value={form.license_category}
                    onChange={(e) =>
                      setForm({ ...form, license_category: e.target.value })
                    }
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="license_expiry_date">License Expiry Date</Label>
                  <Input
                    id="license_expiry_date"
                    type="date"
                    value={form.license_expiry_date}
                    onChange={(e) =>
                      setForm({ ...form, license_expiry_date: e.target.value })
                    }
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="contact_number">Contact Number</Label>
                  <Input
                    id="contact_number"
                    value={form.contact_number}
                    onChange={(e) =>
                      setForm({ ...form, contact_number: e.target.value })
                    }
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="safety_score">Safety Score</Label>
                  <NumberField
                    id="safety_score"
                    min={0}
                    max={100}
                    value={form.safety_score}
                    onValueChange={(value) =>
                      setForm({ ...form, safety_score: value })
                    }
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label>Status</Label>
                  <Select
                    value={form.status}
                    onValueChange={(value) =>
                      setForm({ ...form, status: value as Driver['status'] })
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUSES.map((status) => (
                        <SelectItem key={status} value={status}>
                          {status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {error && <p className="text-sm text-destructive">{error}</p>}

                <SheetFooter className="px-0">
                  <Button type="submit" disabled={saving}>
                    {saving ? 'Saving...' : editingId ? 'Save Changes' : 'Add Driver'}
                  </Button>
                </SheetFooter>
              </form>
            </SheetContent>
          </Sheet>
        </CardHeader>
        <CardContent>
          {isError && (
            <p className="text-sm text-destructive">Failed to load drivers.</p>
          )}
          {isLoading && <Skeleton className="h-64 w-full" />}
          {data && data.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No drivers yet. Add your first driver to get started.
            </p>
          )}
          {data && data.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>License</TableHead>
                  <TableHead>Expiry</TableHead>
                  <TableHead>Safety Score</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((driver) => (
                  <TableRow key={driver.id}>
                    <TableCell className="font-medium">{driver.name}</TableCell>
                    <TableCell>{driver.license_number}</TableCell>
                    <TableCell>
                      {driver.license_expiry_date ?? '—'}{' '}
                      {!driver.license_valid && (
                        <Badge variant="destructive">Expired</Badge>
                      )}
                    </TableCell>
                    <TableCell>{driver.safety_score}</TableCell>
                    <TableCell>
                      <Badge variant={STATUS_VARIANT[driver.status]}>
                        {driver.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" onClick={() => openEdit(driver)}>
                        Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
