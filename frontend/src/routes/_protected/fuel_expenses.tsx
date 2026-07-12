import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_protected/fuel_expenses')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/fuel_expenses"!</div>
}
