import { useState } from 'react'
import {
  type Trip,
  useCancelTrip,
  useCompleteTrip,
  useCreateTrip,
  useDispatchTrip,
  useTrips,
} from '#/hooks/use-trips'
import { useDrivers } from '#/hooks/use-drivers'
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

export const Route = createFileRoute('/_protected/trips')({
  component: RouteComponent,
})

const STATUS_VARIANT: Record<Trip['status'], 'default' | 'secondary' | 'outline' | 'destructive'> = {
  Draft: 'outline',
  Dispatched: 'secondary',
  Completed: 'default',
  Cancelled: 'destructive',
}

function RouteComponent() {
  const { data: trips, isLoading, isError } = useTrips()
  const { data: allVehicles } = useVehicles()
  const { data: allDrivers } = useDrivers()

  const dispatchTrip = useDispatchTrip()
  const cancelTrip = useCancelTrip()

  const vehicleName = (id: number) =>
    allVehicles?.find((v) => v.id === id)?.name ?? `Vehicle #${id}`
  const driverName = (id: number) =>
    allDrivers?.find((d) => d.id === id)?.name ?? `Driver #${id}`

  const [completingTrip, setCompletingTrip] = useState<Trip | null>(null)

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Trips</CardTitle>
          <NewTripSheet />
        </CardHeader>
        <CardContent>
          {isError && (
            <p className="text-sm text-destructive">Failed to load trips.</p>
          )}
          {isLoading && <Skeleton className="h-64 w-full" />}
          {trips && trips.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No trips yet. Create one to get started.
            </p>
          )}
          {trips && trips.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Route</TableHead>
                  <TableHead>Vehicle</TableHead>
                  <TableHead>Driver</TableHead>
                  <TableHead>Cargo</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {trips.map((trip) => (
                  <TableRow key={trip.id}>
                    <TableCell className="font-medium">
                      {trip.source} → {trip.destination}
                    </TableCell>
                    <TableCell>{vehicleName(trip.vehicle_id)}</TableCell>
                    <TableCell>{driverName(trip.driver_id)}</TableCell>
                    <TableCell>{trip.cargo_weight}</TableCell>
                    <TableCell>
                      <Badge variant={STATUS_VARIANT[trip.status]}>{trip.status}</Badge>
                    </TableCell>
                    <TableCell className="flex gap-2">
                      {trip.status === 'Draft' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={dispatchTrip.isPending}
                          onClick={() => dispatchTrip.mutate(trip.id)}
                        >
                          Dispatch
                        </Button>
                      )}
                      {trip.status === 'Dispatched' && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setCompletingTrip(trip)}
                          >
                            Complete
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={cancelTrip.isPending}
                            onClick={() => cancelTrip.mutate(trip.id)}
                          >
                            Cancel
                          </Button>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <CompleteTripSheet
        trip={completingTrip}
        onClose={() => setCompletingTrip(null)}
      />
    </div>
  )
}

function NewTripSheet() {
  const createTrip = useCreateTrip()
  const { data: vehicles } = useVehicles('Available')
  const { data: drivers } = useDrivers('Available')
  const availableDrivers = drivers?.filter((d) => d.license_valid)

  const [open, setOpen] = useState(false)
  const [source, setSource] = useState('')
  const [destination, setDestination] = useState('')
  const [vehicleId, setVehicleId] = useState('')
  const [driverId, setDriverId] = useState('')
  const [cargoWeight, setCargoWeight] = useState('')
  const [plannedDistance, setPlannedDistance] = useState('')
  const [error, setError] = useState<string | null>(null)

  function resetForm() {
    setSource('')
    setDestination('')
    setVehicleId('')
    setDriverId('')
    setCargoWeight('')
    setPlannedDistance('')
    setError(null)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!vehicleId || !driverId) {
      setError('Select a vehicle and driver')
      return
    }

    try {
      await createTrip.mutateAsync({
        source,
        destination,
        vehicle_id: Number(vehicleId),
        driver_id: Number(driverId),
        cargo_weight: Number(cargoWeight) || 0,
        planned_distance: plannedDistance ? Number(plannedDistance) : undefined,
      })
      resetForm()
      setOpen(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    }
  }

  return (
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
            New Trip
          </Button>
        }
      />
      <SheetContent>
        <SheetHeader>
          <SheetTitle>New Trip</SheetTitle>
        </SheetHeader>
        <form
          onSubmit={handleSubmit}
          className="flex flex-1 flex-col gap-4 overflow-y-auto px-6"
        >
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="source">Source</Label>
            <Input
              id="source"
              required
              value={source}
              onChange={(e) => setSource(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="destination">Destination</Label>
            <Input
              id="destination"
              required
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Vehicle</Label>
            <Select value={vehicleId} onValueChange={(v) => setVehicleId(v as string)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select an available vehicle" />
              </SelectTrigger>
              <SelectContent>
                {vehicles?.map((vehicle) => (
                  <SelectItem key={vehicle.id} value={String(vehicle.id)}>
                    {vehicle.name} ({vehicle.registration_number}) — max{' '}
                    {vehicle.max_load_capacity}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Driver</Label>
            <Select value={driverId} onValueChange={(v) => setDriverId(v as string)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select an available driver" />
              </SelectTrigger>
              <SelectContent>
                {availableDrivers?.map((driver) => (
                  <SelectItem key={driver.id} value={String(driver.id)}>
                    {driver.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="cargo_weight">Cargo Weight</Label>
            <NumberField
              id="cargo_weight"
              min={0}
              value={cargoWeight}
              onValueChange={setCargoWeight}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="planned_distance">Planned Distance</Label>
            <NumberField
              id="planned_distance"
              min={0}
              value={plannedDistance}
              onValueChange={setPlannedDistance}
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <SheetFooter className="px-0">
            <Button type="submit" disabled={createTrip.isPending}>
              {createTrip.isPending ? 'Creating...' : 'Create Trip'}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}

function CompleteTripSheet({
  trip,
  onClose,
}: {
  trip: Trip | null
  onClose: () => void
}) {
  const completeTrip = useCompleteTrip()
  const [finalOdometer, setFinalOdometer] = useState('')
  const [fuelConsumed, setFuelConsumed] = useState('')
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!trip) return

    try {
      await completeTrip.mutateAsync({
        id: trip.id,
        final_odometer: Number(finalOdometer) || 0,
        fuel_consumed: Number(fuelConsumed) || 0,
      })
      setFinalOdometer('')
      setFuelConsumed('')
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    }
  }

  return (
    <Sheet
      open={trip !== null}
      onOpenChange={(next) => {
        if (!next) onClose()
      }}
    >
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Complete Trip</SheetTitle>
        </SheetHeader>
        {trip && (
          <form
            onSubmit={handleSubmit}
            className="flex flex-1 flex-col gap-4 overflow-y-auto px-6"
          >
            <p className="text-sm text-muted-foreground">
              {trip.source} → {trip.destination}
            </p>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="final_odometer">Final Odometer</Label>
              <NumberField
                id="final_odometer"
                min={0}
                value={finalOdometer}
                onValueChange={setFinalOdometer}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="fuel_consumed">Fuel Consumed</Label>
              <NumberField
                id="fuel_consumed"
                min={0}
                value={fuelConsumed}
                onValueChange={setFuelConsumed}
              />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <SheetFooter className="px-0">
              <Button type="submit" disabled={completeTrip.isPending}>
                {completeTrip.isPending ? 'Saving...' : 'Complete Trip'}
              </Button>
            </SheetFooter>
          </form>
        )}
      </SheetContent>
    </Sheet>
  )
}
