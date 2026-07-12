// ============================================================
// Authenticated Layout Route
// Wraps all protected pages in AppLayout and guards with auth check.
// TODO (Backend Integration): Replace store check with JWT validation
// ============================================================

import { createFileRoute, redirect } from '@tanstack/react-router'
import { AppLayout } from '#/layouts/AppLayout'
import { useTransitStore } from '#/store/useTransitStore'

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: () => {
    // TODO (Backend Integration): Validate JWT token / session cookie
    const user = useTransitStore.getState().currentUser
    if (!user) {
      throw redirect({ to: '/login' })
    }
  },
  component: AppLayout,
})
