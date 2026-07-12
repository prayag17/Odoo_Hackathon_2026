// ============================================================
// TransitOps - Root Route
// Handles auth guard: redirect to /login if not authenticated.
// ============================================================

import { Outlet, createRootRoute } from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'

import '../styles.css'

export const Route = createRootRoute({
  component: RootComponent,
})

function RootComponent() {
  // Force dark mode globally — TransitOps is dark-only
  if (typeof document !== 'undefined') {
    document.documentElement.classList.add('dark')
  }

  return (
    <>
      <Outlet />
      <TanStackDevtools
        config={{ position: 'bottom-right' }}
        plugins={[{ name: 'TanStack Router', render: <TanStackRouterDevtoolsPanel /> }]}
      />
    </>
  )
}
