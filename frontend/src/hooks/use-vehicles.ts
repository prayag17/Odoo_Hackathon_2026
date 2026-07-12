import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

export interface Vehicle {
  id: number
  registration_number: string
  name: string
  type: string
  max_load_capacity: number
  odometer: number
  acquisition_cost: number
  status: 'Available' | 'On Trip' | 'In Shop' | 'Retired'
  region: string | null
  created_at: string
}

export type VehicleInput = Partial<
  Omit<Vehicle, 'id' | 'created_at'>
> & {
  registration_number: string
  name: string
  type: string
}

async function fetchVehicles(status?: string): Promise<Vehicle[]> {
  const url = status ? `/api/vehicles?status=${encodeURIComponent(status)}` : '/api/vehicles'
  const res = await fetch(url, { credentials: 'include' })
  if (!res.ok) {
    throw new Error('Failed to load vehicles')
  }
  return res.json()
}

export function useVehicles(status?: string) {
  return useQuery({
    queryKey: ['vehicles', status ?? 'all'],
    queryFn: () => fetchVehicles(status),
  })
}

export function useCreateVehicle() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: VehicleInput) => {
      const res = await fetch('/api/vehicles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(input),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error ?? 'Failed to create vehicle')
      }
      return res.json() as Promise<Vehicle>
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] })
    },
  })
}

export function useUpdateVehicle() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...input }: VehicleInput & { id: number }) => {
      const res = await fetch(`/api/vehicles/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(input),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error ?? 'Failed to update vehicle')
      }
      return res.json() as Promise<Vehicle>
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] })
    },
  })
}
