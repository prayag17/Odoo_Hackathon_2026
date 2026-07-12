import { useQuery } from '@tanstack/react-query'

export interface DashboardKpis {
  activeVehicles: number
  availableVehicles: number
  vehiclesInMaintenance: number
  activeTrips: number
  pendingTrips: number
  driversOnDuty: number
  fleetUtilization: number
  trend: { date: string; trips: number }[]
}

async function fetchDashboardKpis(): Promise<DashboardKpis> {
  const res = await fetch('/api/dashboard/kpis', { credentials: 'include' })
  if (!res.ok) {
    throw new Error('Failed to load dashboard KPIs')
  }
  return res.json()
}

export function useDashboardKpis() {
  return useQuery({
    queryKey: ['dashboard', 'kpis'],
    queryFn: fetchDashboardKpis,
  })
}
