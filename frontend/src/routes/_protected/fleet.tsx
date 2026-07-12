import { useState } from 'react'
import {
  type Vehicle,
  useCreateVehicle,
  useUpdateVehicle,
  useVehicles,
} from '#/hooks/use-vehicles'
import { Avatar, AvatarFallback, AvatarImage } from '#/components/ui/avatar'
import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '#/components/ui/card'
import { Input } from '#/components/ui/input'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '#/components/ui/input-group'
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
import { PlusIcon, SearchIcon } from 'lucide-react'

export const Route = createFileRoute('/_protected/fleet')({
  component: RouteComponent,
})

const STATUSES: Vehicle['status'][] = ['Available', 'On Trip', 'In Shop', 'Retired']

const STATUS_VARIANT: Record<Vehicle['status'], 'default' | 'secondary' | 'outline' | 'destructive'> = {
  Available: 'default',
  'On Trip': 'secondary',
  'In Shop': 'outline',
  Retired: 'destructive',
}

const emptyForm = {
  registration_number: '',
  name: '',
  type: '',
  max_load_capacity: '',
  odometer: '',
  acquisition_cost: '',
  status: 'Available' as Vehicle['status'],
  region: '',
  image: '',
}

function RouteComponent() {
  const [search, setSearch] = useState('')
  const { data, isLoading, isError } = useVehicles(undefined, search)
  const createVehicle = useCreateVehicle()
  const updateVehicle = useUpdateVehicle()

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

  function openEdit(vehicle: Vehicle) {
    setEditingId(vehicle.id)
    setForm({
      registration_number: vehicle.registration_number,
      name: vehicle.name,
      type: vehicle.type,
      max_load_capacity: String(vehicle.max_load_capacity),
      odometer: String(vehicle.odometer),
      acquisition_cost: String(vehicle.acquisition_cost),
      status: vehicle.status,
      region: vehicle.region ?? '',
      image: vehicle.image ?? '',
    })
    setError(null)
    setOpen(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    const payload = {
      registration_number: form.registration_number,
      name: form.name,
      type: form.type,
      max_load_capacity: Number(form.max_load_capacity) || 0,
      odometer: Number(form.odometer) || 0,
      acquisition_cost: Number(form.acquisition_cost) || 0,
      status: form.status,
      region: form.region || undefined,
      image: form.image || undefined,
    }

    try {
      if (editingId) {
        await updateVehicle.mutateAsync({ id: editingId, ...payload })
      } else {
        await createVehicle.mutateAsync(payload)
      }
      setOpen(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    }
  }

  const saving = createVehicle.isPending || updateVehicle.isPending

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <CardTitle>Fleet</CardTitle>
          <div className="flex items-center gap-2">
            <InputGroup className="w-56">
              <InputGroupAddon>
                <SearchIcon />
              </InputGroupAddon>
              <InputGroupInput
                placeholder="Search vehicles..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </InputGroup>
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger
                render={
                  <Button size="sm" onClick={openCreate}>
                    <PlusIcon data-icon="inline-start" />
                    Add Vehicle
                  </Button>
                }
              />
            <SheetContent>
              <SheetHeader>
                <SheetTitle>{editingId ? 'Edit Vehicle' : 'Add Vehicle'}</SheetTitle>
              </SheetHeader>
              <form
                onSubmit={handleSubmit}
                className="flex flex-1 flex-col gap-4 overflow-y-auto px-6"
              >
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="registration_number">Registration Number</Label>
                  <Input
                    id="registration_number"
                    required
                    value={form.registration_number}
                    onChange={(e) =>
                      setForm({ ...form, registration_number: e.target.value })
                    }
                  />
                </div>
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
                  <Label htmlFor="type">Type</Label>
                  <Input
                    id="type"
                    required
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="max_load_capacity">Max Load Capacity</Label>
                  <NumberField
                    id="max_load_capacity"
                    min={0}
                    value={form.max_load_capacity}
                    onValueChange={(value) =>
                      setForm({ ...form, max_load_capacity: value })
                    }
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="odometer">Odometer</Label>
                  <NumberField
                    id="odometer"
                    min={0}
                    value={form.odometer}
                    onValueChange={(value) => setForm({ ...form, odometer: value })}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="acquisition_cost">Acquisition Cost</Label>
                  <NumberField
                    id="acquisition_cost"
                    min={0}
                    value={form.acquisition_cost}
                    onValueChange={(value) =>
                      setForm({ ...form, acquisition_cost: value })
                    }
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="region">Region</Label>
                  <Input
                    id="region"
                    value={form.region}
                    onChange={(e) => setForm({ ...form, region: e.target.value })}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="vehicle-image">Image URL</Label>
                  <div className="flex items-center gap-3">
                    <Avatar className="size-10">
                      <AvatarImage src={form.image || undefined} alt={form.name} />
                      <AvatarFallback>{(form.name || '?').slice(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <Input
                      id="vehicle-image"
                      placeholder="https://example.com/vehicle.png"
                      value={form.image}
                      onChange={(e) => setForm({ ...form, image: e.target.value })}
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label>Status</Label>
                  <Select
                    value={form.status}
                    onValueChange={(value) =>
                      setForm({ ...form, status: value as Vehicle['status'] })
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
                    {saving ? 'Saving...' : editingId ? 'Save Changes' : 'Add Vehicle'}
                  </Button>
                </SheetFooter>
              </form>
            </SheetContent>
            </Sheet>
          </div>
        </CardHeader>
        <CardContent>
          {isError && (
            <p className="text-sm text-destructive">Failed to load vehicles.</p>
          )}
          {isLoading && <Skeleton className="h-64 w-full" />}
          {data && data.length === 0 && (
            <p className="text-sm text-muted-foreground">
              {search ? 'No vehicles match your search.' : 'No vehicles yet. Add your first vehicle to get started.'}
            </p>
          )}
          {data && data.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead />
                  <TableHead>Registration</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Region</TableHead>
                  <TableHead>Odometer</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((vehicle) => (
                  <TableRow key={vehicle.id}>
                    <TableCell>
                      <Avatar className="size-8">
                        <AvatarImage src={vehicle.image ?? undefined} alt={vehicle.name} />
                        <AvatarFallback>{vehicle.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                    </TableCell>
                    <TableCell className="font-medium">
                      {vehicle.registration_number}
                    </TableCell>
                    <TableCell>{vehicle.name}</TableCell>
                    <TableCell>{vehicle.type}</TableCell>
                    <TableCell>{vehicle.region ?? '—'}</TableCell>
                    <TableCell>{vehicle.odometer}</TableCell>
                    <TableCell>
                      <Badge variant={STATUS_VARIANT[vehicle.status]}>
                        {vehicle.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" onClick={() => openEdit(vehicle)}>
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
