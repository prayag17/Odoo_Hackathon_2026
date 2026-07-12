// Redirect root to /dashboard (auth guard handled per-route)
import { createFileRoute, redirect } from '@tanstack/react-router'
import { useTransitStore } from '#/store/useTransitStore'

export const Route = createFileRoute('/')({
  beforeLoad: () => {
    // TODO (Backend Integration): Check JWT token validity here
    const user = useTransitStore.getState().currentUser
    if (!user) {
      throw redirect({ to: '/login' })
    }
    throw redirect({ to: '/dashboard' })
  },
  component: () => null,
})
