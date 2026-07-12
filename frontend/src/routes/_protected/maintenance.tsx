import { useState } from 'react'
import {
  useCloseMaintenanceLog,
  useCreateMaintenanceLog,
  useMaintenanceLogs,
} from '#/hooks/use-maintenance'
import { useVehicles } from '#/hooks/use-vehicles'
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

export const Route = createFileRoute('/_protected/maintenance')({
  component: RouteComponent,
})

function RouteComponent() {
  const { data, isLoading, isError } = useMaintenanceLogs()
  const { data: vehicles } = useVehicles()
  const createLog = useCreateMaintenanceLog()
  const closeLog = useCloseMaintenanceLog()

  const [open, setOpen] = useState(false)
  const [vehicleId, setVehicleId] = useState('')
  const [description, setDescription] = useState('')
  const [cost, setCost] = useState('')
  const [error, setError] = useState<string | null>(null)

  function resetForm() {
    setVehicleId('')
    setDescription('')
    setCost('')
    setError(null)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!vehicleId) {
      setError('Select a vehicle')
      return
    }

    try {
      await createLog.mutateAsync({
        vehicle_id: Number(vehicleId),
        description,
        cost: Number(cost) || 0,
      })
      resetForm()
      setOpen(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    }
  }

  const vehicleName = (id: number) =>
    vehicles?.find((v) => v.id === id)?.name ?? `Vehicle #${id}`

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Maintenance</CardTitle>
          <Sheet
            open={open}
            onOpenChange={(next) => {
              setOpen(next)
              if (!next) resetForm()
            }}
          >
            <SheetTrigger
              render={
                <Button size="sm">
                  <PlusIcon data-icon="inline-start" />
                  Open Maintenance
                </Button>
              }
            />
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Open Maintenance Record</SheetTitle>
              </SheetHeader>
              <form
                onSubmit={handleSubmit}
                className="flex flex-1 flex-col gap-4 overflow-y-auto px-6"
              >
                <div className="flex flex-col gap-1.5">
                  <Label>Vehicle</Label>
                  <Select value={vehicleId} onValueChange={(v) => setVehicleId(v as string)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select vehicle" />
                    </SelectTrigger>
                    <SelectContent>
                      {vehicles?.map((vehicle) => (
                        <SelectItem key={vehicle.id} value={String(vehicle.id)}>
                          {vehicle.name} ({vehicle.registration_number})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="cost">Cost</Label>
                  <NumberField id="cost" min={0} value={cost} onValueChange={setCost} />
                </div>

                {error && <p className="text-sm text-destructive">{error}</p>}

                <SheetFooter className="px-0">
                  <Button type="submit" disabled={createLog.isPending}>
                    {createLog.isPending ? 'Saving...' : 'Open Record'}
                  </Button>
                </SheetFooter>
              </form>
            </SheetContent>
          </Sheet>
        </CardHeader>
        <CardContent>
          {isError && (
            <p className="text-sm text-destructive">Failed to load maintenance logs.</p>
          )}
          {isLoading && <Skeleton className="h-64 w-full" />}
          {data && data.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No maintenance records yet.
            </p>
          )}
          {data && data.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vehicle</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Cost</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-medium">
                      {vehicleName(log.vehicle_id)}
                    </TableCell>
                    <TableCell>{log.description}</TableCell>
                    <TableCell>${Number(log.cost).toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge variant={log.status === 'Open' ? 'secondary' : 'outline'}>
                        {log.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {log.status === 'Open' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={closeLog.isPending}
                          onClick={() => closeLog.mutate(log.id)}
                        >
                          Close
                        </Button>
                      )}
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
