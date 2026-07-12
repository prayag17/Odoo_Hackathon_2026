import { Spinner } from '@/components/ui/spinner'

export function RoutePending() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center">
      <Spinner className="size-6" />
    </div>
  )
}
