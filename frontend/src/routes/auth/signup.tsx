import { SignupForm } from '#/components/signup-form'
import { ModeToggle } from '#/components/mode-toggle'
import { authClient } from '#/lib/auth-client'
import { createFileRoute, redirect } from '@tanstack/react-router'
import { TruckElectric } from 'lucide-react'
import Lightfall from '#/components/lightfall'

export const Route = createFileRoute('/auth/signup')({
  beforeLoad: async () => {
    const { data: session } = await authClient.getSession()
    if (session) {
      throw redirect({ to: '/dashboard' })
    }
  },
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex items-center justify-center gap-2 md:justify-between">
          <div className="flex items-center gap-2 font-medium">
            <div className="flex size-12 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <TruckElectric className="size-5*" />
            </div>
            TransitOps
          </div>
          <ModeToggle />
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <SignupForm />
          </div>
        </div>
      </div>
      <div className="relative hidden bg-muted lg:block">
        <Lightfall
          colors={['#f0f5ea', '#f5f5ea', '#005f3a']}
          backgroundColor="#005f5a"
          speed={0.5}
          streakCount={2}
          streakWidth={1}
          streakLength={1}
          glow={1}
          density={0.6}
          twinkle={1}
          zoom={3}
          backgroundGlow={0.5}
          opacity={1}
          mouseInteraction
          mouseStrength={0.5}
          mouseRadius={1}
        />
      </div>
    </div>
  )
}
