import { createFileRoute } from '@tanstack/react-router'
import { VehicleRegistry } from '#/pages/VehicleRegistry'

export const Route = createFileRoute('/_authenticated/fleet')({
  component: VehicleRegistry,
})
