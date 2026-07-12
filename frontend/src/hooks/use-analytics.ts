import { useQuery } from '@tanstack/react-query'

export interface VehicleAnalytics {
  vehicleId: number
  registrationNumber: string
  name: string
  fuelEfficiency: number
  operationalCost: number
  roi: number
}

async function fetchAnalytics(): Promise<VehicleAnalytics[]> {
  const res = await fetch('/api/analytics', { credentials: 'include' })
  if (!res.ok) {
    throw new Error('Failed to load analytics')
  }
  return res.json()
}

export function useAnalytics() {
  return useQuery({
    queryKey: ['analytics'],
    queryFn: fetchAnalytics,
  })
}

export const analyticsExportUrl = '/api/analytics/export.csv'
