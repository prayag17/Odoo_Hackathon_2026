import { createFileRoute } from '@tanstack/react-router'
import { TripDispatcher } from '#/pages/TripDispatcher'

export const Route = createFileRoute('/_authenticated/trips')({
  component: TripDispatcher,
})
