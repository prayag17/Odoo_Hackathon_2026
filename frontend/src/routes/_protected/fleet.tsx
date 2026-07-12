import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_protected/fleet')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/fleet"!</div>
}
