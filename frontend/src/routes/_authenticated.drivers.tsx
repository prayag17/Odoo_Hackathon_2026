import { createFileRoute } from '@tanstack/react-router'
import { DriverManagement } from '#/pages/DriverManagement'

export const Route = createFileRoute('/_authenticated/drivers')({
  component: DriverManagement,
})
