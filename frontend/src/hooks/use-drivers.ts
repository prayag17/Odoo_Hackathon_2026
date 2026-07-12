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
  image: string | null
  created_at: string
  license_valid: boolean
}

export type DriverInput = Partial<Omit<Driver, 'id' | 'created_at' | 'license_valid'>> & {
  name: string
  license_number: string
}

async function fetchDrivers(status?: string, q?: string): Promise<Driver[]> {
  const params = new URLSearchParams()
  if (status) params.set('status', status)
  if (q) params.set('q', q)
  const query = params.toString()
  const res = await fetch(`/api/drivers${query ? `?${query}` : ''}`, {
    credentials: 'include',
  })
  if (!res.ok) {
    throw new Error('Failed to load drivers')
  }
  return res.json()
}

export function useDrivers(status?: string, q?: string) {
  return useQuery({
    queryKey: ['drivers', status ?? 'all', q ?? ''],
    queryFn: () => fetchDrivers(status, q),
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
