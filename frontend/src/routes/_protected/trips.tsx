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
import { formatDate, formatNumber } from '#/lib/format'
import { Avatar, AvatarFallback, AvatarImage } from '#/components/ui/avatar'
import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'
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
import {
  ArrowRightIcon,
  CheckIcon,
  CircleDotIcon,
  ClockIcon,
  PackageCheckIcon,
  PlusIcon,
  SearchIcon,
  SendIcon,
  XIcon,
} from 'lucide-react'

export const Route = createFileRoute('/_protected/trips')({
  component: RouteComponent,
})

const STATUS_VARIANT: Record<Trip['status'], 'default' | 'secondary' | 'outline' | 'destructive'> = {
  Draft: 'outline',
  Dispatched: 'secondary',
  Completed: 'default',
  Cancelled: 'destructive',
}

const STATS: { status: Trip['status']; label: string; icon: React.ReactNode }[] = [
  { status: 'Draft', label: 'Draft', icon: <ClockIcon className="size-4" /> },
  { status: 'Dispatched', label: 'Dispatched', icon: <SendIcon className="size-4" /> },
  { status: 'Completed', label: 'Completed', icon: <PackageCheckIcon className="size-4" /> },
  { status: 'Cancelled', label: 'Cancelled', icon: <XIcon className="size-4" /> },
]

function RouteComponent() {
  const [search, setSearch] = useState('')
  const { data: trips, isLoading, isError } = useTrips(search)
  const { data: allVehicles } = useVehicles()
  const { data: allDrivers } = useDrivers()

  const dispatchTrip = useDispatchTrip()
  const cancelTrip = useCancelTrip()

  const vehicle = (id: number) => allVehicles?.find((v) => v.id === id)
  const driver = (id: number) => allDrivers?.find((d) => d.id === id)

  const [completingTrip, setCompletingTrip] = useState<Trip | null>(null)

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
      <div className="grid grid-cols-2 gap-4 @5xl/main:grid-cols-4">
        {STATS.map((stat) => (
          <Card key={stat.status} className="@container/card">
            <CardHeader>
              <CardDescription className="flex items-center gap-1.5">
                {stat.icon}
                {stat.label}
              </CardDescription>
              <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                {trips?.filter((t) => t.status === stat.status).length ?? 0}
              </CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <CardTitle>Trips</CardTitle>
          <div className="flex items-center gap-2">
            <InputGroup className="w-56">
              <InputGroupAddon>
                <SearchIcon />
              </InputGroupAddon>
              <InputGroupInput
                placeholder="Search trips..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </InputGroup>
            <NewTripSheet />
          </div>
        </CardHeader>
        <CardContent>
          {isError && (
            <p className="text-sm text-destructive">Failed to load trips.</p>
          )}
          {isLoading && <Skeleton className="h-64 w-full" />}
          {trips && trips.length === 0 && (
            <p className="text-sm text-muted-foreground">
              {search ? 'No trips match your search.' : 'No trips yet. Create one to get started.'}
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
                  <TableHead>Distance</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {trips.map((trip) => {
                  const v = vehicle(trip.vehicle_id)
                  const d = driver(trip.driver_id)
                  return (
                    <TableRow key={trip.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-1.5">
                          <span>{trip.source}</span>
                          <ArrowRightIcon className="size-3.5 text-muted-foreground" />
                          <span>{trip.destination}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="size-6">
                            <AvatarImage src={v?.image ?? undefined} alt={v?.name} />
                            <AvatarFallback className="text-[10px]">
                              {(v?.name ?? '?').slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          {v?.name ?? `Vehicle #${trip.vehicle_id}`}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="size-6">
                            <AvatarImage src={d?.image ?? undefined} alt={d?.name} />
                            <AvatarFallback className="text-[10px]">
                              {(d?.name ?? '?').slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          {d?.name ?? `Driver #${trip.driver_id}`}
                        </div>
                      </TableCell>
                      <TableCell>{formatNumber(trip.cargo_weight)} kg</TableCell>
                      <TableCell>
                        {trip.status === 'Completed' ? (
                          <span className="tabular-nums">{formatNumber(trip.actual_distance)} km</span>
                        ) : trip.planned_distance ? (
                          <span className="text-muted-foreground tabular-nums">
                            ~{formatNumber(trip.planned_distance)} km
                          </span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(trip.created_at)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={STATUS_VARIANT[trip.status]}>
                          <CircleDotIcon data-icon="inline-start" />
                          {trip.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-2">
                          {trip.status === 'Draft' && (
                            <Button
                              size="sm"
                              disabled={dispatchTrip.isPending}
                              onClick={() => dispatchTrip.mutate(trip.id)}
                            >
                              <SendIcon data-icon="inline-start" />
                              Dispatch
                            </Button>
                          )}
                          {trip.status === 'Dispatched' && (
                            <>
                              <Button size="sm" onClick={() => setCompletingTrip(trip)}>
                                <CheckIcon data-icon="inline-start" />
                                Complete
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-destructive hover:text-destructive"
                                disabled={cancelTrip.isPending}
                                onClick={() => cancelTrip.mutate(trip.id)}
                              >
                                <XIcon data-icon="inline-start" />
                                Cancel
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
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
                    {formatNumber(vehicle.max_load_capacity)} kg
                  </SelectItem>
                ))}
                {vehicles?.length === 0 && (
                  <div className="px-3 py-2 text-sm text-muted-foreground">
                    No available vehicles
                  </div>
                )}
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
                {availableDrivers?.length === 0 && (
                  <div className="px-3 py-2 text-sm text-muted-foreground">
                    No available drivers
                  </div>
                )}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="cargo_weight">Cargo Weight (kg)</Label>
            <NumberField
              id="cargo_weight"
              min={0}
              value={cargoWeight}
              onValueChange={setCargoWeight}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="planned_distance">Planned Distance (km)</Label>
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
              <Label htmlFor="final_odometer">Final Odometer (km)</Label>
              <NumberField
                id="final_odometer"
                min={0}
                value={finalOdometer}
                onValueChange={setFinalOdometer}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="fuel_consumed">Fuel Consumed (L)</Label>
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
