import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_protected/trips')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/trips"!</div>
}
