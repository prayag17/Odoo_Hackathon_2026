import { useState } from 'react'
import {
  useCreateExpense,
  useCreateFuelLog,
  useExpenses,
  useFuelLogs,
} from '#/hooks/use-fuel-expenses'
import { useVehicles } from '#/hooks/use-vehicles'
import { formatCurrency, formatDate } from '#/lib/format'
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
import { Skeleton } from '#/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '#/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '#/components/ui/table'
import { createFileRoute } from '@tanstack/react-router'
import { SearchIcon } from 'lucide-react'

export const Route = createFileRoute('/_protected/fuel_expenses')({
  component: RouteComponent,
})

function RouteComponent() {
  const { data: vehicles } = useVehicles()

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
      <Card>
        <CardHeader>
          <CardTitle>Fuel & Expenses</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="fuel">
            <TabsList>
              <TabsTrigger value="fuel">Fuel Logs</TabsTrigger>
              <TabsTrigger value="expenses">Expenses</TabsTrigger>
            </TabsList>
            <TabsContent value="fuel" className="mt-4">
              <FuelLogsPanel vehicles={vehicles} />
            </TabsContent>
            <TabsContent value="expenses" className="mt-4">
              <ExpensesPanel vehicles={vehicles} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

type VehicleOption = { id: number; name: string; registration_number: string }

function FuelLogsPanel({ vehicles }: { vehicles?: VehicleOption[] }) {
  const { data, isLoading, isError } = useFuelLogs()
  const createFuelLog = useCreateFuelLog()

  const [vehicleId, setVehicleId] = useState('')
  const [liters, setLiters] = useState('')
  const [cost, setCost] = useState('')
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!vehicleId) {
      setError('Select a vehicle')
      return
    }

    try {
      await createFuelLog.mutateAsync({
        vehicle_id: Number(vehicleId),
        liters: Number(liters) || 0,
        cost: Number(cost) || 0,
      })
      setVehicleId('')
      setLiters('')
      setCost('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    }
  }

  const vehicleName = (id: number) =>
    vehicles?.find((v) => v.id === id)?.name ?? `Vehicle #${id}`

  return (
    <div className="flex flex-col gap-4">
      <form
        onSubmit={handleSubmit}
        className="flex flex-wrap items-end gap-3 rounded-2xl bg-muted/40 p-4"
      >
        <div className="flex flex-col gap-1.5">
          <Label>Vehicle</Label>
          <Select value={vehicleId} onValueChange={(v) => setVehicleId(v as string)}>
            <SelectTrigger className="w-48">
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
          <Label htmlFor="liters">Liters</Label>
          <NumberField id="liters" min={0} value={liters} onValueChange={setLiters} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="fuel-cost">Cost</Label>
          <NumberField id="fuel-cost" min={0} value={cost} onValueChange={setCost} />
        </div>
        <Button type="submit" disabled={createFuelLog.isPending}>
          {createFuelLog.isPending ? 'Saving...' : 'Add Fuel Log'}
        </Button>
      </form>

      {error && <p className="text-sm text-destructive">{error}</p>}
      {isError && (
        <p className="text-sm text-destructive">Failed to load fuel logs.</p>
      )}
      {isLoading && <Skeleton className="h-48 w-full" />}
      {data && data.length === 0 && (
        <p className="text-sm text-muted-foreground">No fuel logs yet.</p>
      )}
      {data && data.length > 0 && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Vehicle</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Liters</TableHead>
              <TableHead>Cost</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((log) => (
              <TableRow key={log.id}>
                <TableCell className="font-medium">
                  {vehicleName(log.vehicle_id)}
                </TableCell>
                <TableCell>{formatDate(log.log_date)}</TableCell>
                <TableCell>{log.liters}</TableCell>
                <TableCell>{formatCurrency(log.cost)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}

function ExpensesPanel({ vehicles }: { vehicles?: VehicleOption[] }) {
  const [search, setSearch] = useState('')
  const { data, isLoading, isError } = useExpenses(search)
  const createExpense = useCreateExpense()

  const [vehicleId, setVehicleId] = useState('')
  const [category, setCategory] = useState('')
  const [amount, setAmount] = useState('')
  const [notes, setNotes] = useState('')
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    try {
      await createExpense.mutateAsync({
        vehicle_id: vehicleId ? Number(vehicleId) : undefined,
        category,
        amount: Number(amount) || 0,
        notes: notes || undefined,
      })
      setVehicleId('')
      setCategory('')
      setAmount('')
      setNotes('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    }
  }

  const vehicleName = (id: number | null) =>
    id == null ? '—' : (vehicles?.find((v) => v.id === id)?.name ?? `Vehicle #${id}`)

  return (
    <div className="flex flex-col gap-4">
      <form
        onSubmit={handleSubmit}
        className="flex flex-wrap items-end gap-3 rounded-2xl bg-muted/40 p-4"
      >
        <div className="flex flex-col gap-1.5">
          <Label>Vehicle</Label>
          <Select value={vehicleId} onValueChange={(v) => setVehicleId(v as string)}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Optional" />
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
          <Label htmlFor="category">Category</Label>
          <Input
            id="category"
            required
            className="w-40"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="amount">Amount</Label>
          <NumberField id="amount" min={0} value={amount} onValueChange={setAmount} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="notes">Notes</Label>
          <Input
            id="notes"
            className="w-48"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>
        <Button type="submit" disabled={createExpense.isPending}>
          {createExpense.isPending ? 'Saving...' : 'Add Expense'}
        </Button>
      </form>

      {error && <p className="text-sm text-destructive">{error}</p>}
      <InputGroup className="w-56">
        <InputGroupAddon>
          <SearchIcon />
        </InputGroupAddon>
        <InputGroupInput
          placeholder="Search expenses..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </InputGroup>

      {isError && (
        <p className="text-sm text-destructive">Failed to load expenses.</p>
      )}
      {isLoading && <Skeleton className="h-48 w-full" />}
      {data && data.length === 0 && (
        <p className="text-sm text-muted-foreground">
          {search ? 'No expenses match your search.' : 'No expenses yet.'}
        </p>
      )}
      {data && data.length > 0 && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Vehicle</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Notes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((expense) => (
              <TableRow key={expense.id}>
                <TableCell className="font-medium">
                  {vehicleName(expense.vehicle_id)}
                </TableCell>
                <TableCell>{expense.category}</TableCell>
                <TableCell>{formatCurrency(expense.amount)}</TableCell>
                <TableCell>{formatDate(expense.expense_date)}</TableCell>
                <TableCell>{expense.notes ?? '—'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}
