import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_protected/maintenance')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/maintenaince"!</div>
}
