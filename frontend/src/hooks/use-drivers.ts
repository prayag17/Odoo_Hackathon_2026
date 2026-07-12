import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

export interface Driver {
  id: number
  name: string
  license_number: string
  license_category: string | null
  license_expiry_date: string | null
  contact_number: string | null
  safety_score: number
  status: 'Available' | 'On Trip' | 'Off Duty' | 'Suspended'
  created_at: string
  license_valid: boolean
}

export type DriverInput = Partial<Omit<Driver, 'id' | 'created_at' | 'license_valid'>> & {
  name: string
  license_number: string
}

async function fetchDrivers(status?: string): Promise<Driver[]> {
  const url = status ? `/api/drivers?status=${encodeURIComponent(status)}` : '/api/drivers'
  const res = await fetch(url, { credentials: 'include' })
  if (!res.ok) {
    throw new Error('Failed to load drivers')
  }
  return res.json()
}

export function useDrivers(status?: string) {
  return useQuery({
    queryKey: ['drivers', status ?? 'all'],
    queryFn: () => fetchDrivers(status),
  })
}

export function useCreateDriver() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: DriverInput) => {
      const res = await fetch('/api/drivers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(input),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error ?? 'Failed to create driver')
      }
      return res.json() as Promise<Driver>
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drivers'] })
    },
  })
}

export function useUpdateDriver() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...input }: DriverInput & { id: number }) => {
      const res = await fetch(`/api/drivers/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(input),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error ?? 'Failed to update driver')
      }
      return res.json() as Promise<Driver>
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drivers'] })
    },
  })
}
