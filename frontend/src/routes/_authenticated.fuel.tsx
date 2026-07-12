import { createFileRoute } from '@tanstack/react-router'
import { FuelExpenses } from '#/pages/FuelExpenses'

export const Route = createFileRoute('/_authenticated/fuel')({
  component: FuelExpenses,
})
