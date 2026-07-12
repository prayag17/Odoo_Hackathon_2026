import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

export interface MaintenanceLog {
  id: number
  vehicle_id: number
  description: string
  cost: number
  status: 'Open' | 'Closed'
  created_at: string
}

export interface MaintenanceInput {
  vehicle_id: number
  description: string
  cost?: number
}

async function fetchMaintenanceLogs(): Promise<MaintenanceLog[]> {
  const res = await fetch('/api/maintenance', { credentials: 'include' })
  if (!res.ok) {
    throw new Error('Failed to load maintenance logs')
  }
  return res.json()
}

export function useMaintenanceLogs() {
  return useQuery({
    queryKey: ['maintenance'],
    queryFn: fetchMaintenanceLogs,
  })
}

export function useCreateMaintenanceLog() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: MaintenanceInput) => {
      const res = await fetch('/api/maintenance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(input),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error ?? 'Failed to create maintenance log')
      }
      return res.json() as Promise<MaintenanceLog>
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance'] })
      queryClient.invalidateQueries({ queryKey: ['vehicles'] })
    },
  })
}

export function useCloseMaintenanceLog() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/maintenance/${id}/close`, {
        method: 'PATCH',
        credentials: 'include',
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error ?? 'Failed to close maintenance log')
      }
      return res.json() as Promise<MaintenanceLog>
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance'] })
      queryClient.invalidateQueries({ queryKey: ['vehicles'] })
    },
  })
}
