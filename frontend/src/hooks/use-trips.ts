import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

export interface Trip {
  id: number
  source: string
  destination: string
  vehicle_id: number
  driver_id: number
  cargo_weight: number
  planned_distance: number | null
  actual_distance: number | null
  fuel_consumed: number | null
  status: 'Draft' | 'Dispatched' | 'Completed' | 'Cancelled'
  created_at: string
}

export interface TripInput {
  source: string
  destination: string
  vehicle_id: number
  driver_id: number
  cargo_weight: number
  planned_distance?: number
}

export interface CompleteTripInput {
  id: number
  final_odometer: number
  fuel_consumed: number
}

async function fetchTrips(): Promise<Trip[]> {
  const res = await fetch('/api/trips', { credentials: 'include' })
  if (!res.ok) {
    throw new Error('Failed to load trips')
  }
  return res.json()
}

export function useTrips() {
  return useQuery({
    queryKey: ['trips'],
    queryFn: fetchTrips,
  })
}

function invalidateTripDependents(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: ['trips'] })
  queryClient.invalidateQueries({ queryKey: ['vehicles'] })
  queryClient.invalidateQueries({ queryKey: ['drivers'] })
  queryClient.invalidateQueries({ queryKey: ['dashboard'] })
}

export function useCreateTrip() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: TripInput) => {
      const res = await fetch('/api/trips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(input),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error ?? 'Failed to create trip')
      }
      return res.json() as Promise<Trip>
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips'] })
    },
  })
}

export function useDispatchTrip() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/trips/${id}/dispatch`, {
        method: 'PATCH',
        credentials: 'include',
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error ?? 'Failed to dispatch trip')
      }
      return res.json() as Promise<Trip>
    },
    onSuccess: () => invalidateTripDependents(queryClient),
  })
}

export function useCompleteTrip() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...input }: CompleteTripInput) => {
      const res = await fetch(`/api/trips/${id}/complete`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(input),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error ?? 'Failed to complete trip')
      }
      return res.json() as Promise<Trip>
    },
    onSuccess: () => invalidateTripDependents(queryClient),
  })
}

export function useCancelTrip() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/trips/${id}/cancel`, {
        method: 'PATCH',
        credentials: 'include',
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error ?? 'Failed to cancel trip')
      }
      return res.json() as Promise<Trip>
    },
    onSuccess: () => invalidateTripDependents(queryClient),
  })
}
