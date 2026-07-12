import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

export interface FuelLog {
  id: number
  vehicle_id: number
  liters: number
  cost: number
  log_date: string
}

export interface FuelLogInput {
  vehicle_id: number
  liters: number
  cost: number
  log_date?: string
}

export interface Expense {
  id: number
  vehicle_id: number | null
  category: string
  amount: number
  expense_date: string
  notes: string | null
}

export interface ExpenseInput {
  vehicle_id?: number
  category: string
  amount: number
  expense_date?: string
  notes?: string
}

async function fetchFuelLogs(): Promise<FuelLog[]> {
  const res = await fetch('/api/fuel-logs', { credentials: 'include' })
  if (!res.ok) {
    throw new Error('Failed to load fuel logs')
  }
  return res.json()
}

export function useFuelLogs() {
  return useQuery({
    queryKey: ['fuel-logs'],
    queryFn: fetchFuelLogs,
  })
}

export function useCreateFuelLog() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: FuelLogInput) => {
      const res = await fetch('/api/fuel-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(input),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error ?? 'Failed to create fuel log')
      }
      return res.json() as Promise<FuelLog>
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fuel-logs'] })
      queryClient.invalidateQueries({ queryKey: ['analytics'] })
    },
  })
}

async function fetchExpenses(): Promise<Expense[]> {
  const res = await fetch('/api/expenses', { credentials: 'include' })
  if (!res.ok) {
    throw new Error('Failed to load expenses')
  }
  return res.json()
}

export function useExpenses() {
  return useQuery({
    queryKey: ['expenses'],
    queryFn: fetchExpenses,
  })
}

export function useCreateExpense() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: ExpenseInput) => {
      const res = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(input),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error ?? 'Failed to create expense')
      }
      return res.json() as Promise<Expense>
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] })
      queryClient.invalidateQueries({ queryKey: ['analytics'] })
    },
  })
}
