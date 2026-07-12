import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_protected/drivers')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/drivers"!</div>
}
