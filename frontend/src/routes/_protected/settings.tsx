import { useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/password-input'
import { Spinner } from '@/components/ui/spinner'
import { authClient } from '#/lib/auth-client'
import { useMutation } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { toast } from 'sonner'

export const Route = createFileRoute('/_protected/settings')({
  component: RouteComponent,
})

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/)
  const initials =
    parts.length > 1 ? `${parts[0][0]}${parts[parts.length - 1][0]}` : parts[0]?.slice(0, 2)
  return initials?.toUpperCase() || '?'
}

function formatRole(role?: string) {
  if (!role) return 'Unknown'
  return role
    .split('_')
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(' ')
}

function RouteComponent() {
  const { data: session, refetch } = authClient.useSession()
  const user = session?.user as
    | { id: string; name: string; email: string; image?: string | null; role?: string }
    | undefined

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:max-w-2xl md:gap-6 md:p-6">
      <div>
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Manage your profile and account security.
        </p>
      </div>

      {user && <ProfileCard user={user} onUpdated={refetch} />}
      <PasswordCard />
    </div>
  )
}

function ProfileCard({
  user,
  onUpdated,
}: {
  user: { name: string; email: string; image?: string | null; role?: string }
  onUpdated: () => void
}) {
  const [name, setName] = useState(user.name)
  const [image, setImage] = useState(user.image ?? '')

  const updateProfile = useMutation({
    mutationFn: async () => {
      const { error } = await authClient.updateUser({
        name,
        image: image || null,
      })
      if (error) {
        throw new Error(error.message ?? 'Failed to update profile')
      }
    },
    onSuccess: () => {
      toast.success('Profile updated')
      onUpdated()
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update profile')
    },
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    updateProfile.mutate()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile</CardTitle>
        <CardDescription>Your personal details and role.</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent>
          <FieldGroup>
            <div className="flex items-center gap-4">
              <Avatar className="size-14">
                <AvatarImage src={image || undefined} alt={name} />
                <AvatarFallback>{getInitials(name || user.email)}</AvatarFallback>
              </Avatar>
              <Field>
                <FieldLabel htmlFor="image">Avatar URL</FieldLabel>
                <Input
                  id="image"
                  placeholder="https://example.com/avatar.png"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                />
              </Field>
            </div>
            <Field>
              <FieldLabel htmlFor="name">Name</FieldLabel>
              <Input
                id="name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input id="email" value={user.email} disabled />
              <FieldDescription>
                Contact an admin to change the email on your account.
              </FieldDescription>
            </Field>
            <Field>
              <FieldLabel>Role</FieldLabel>
              <div>
                <Badge variant="secondary">{formatRole(user.role)}</Badge>
              </div>
              <FieldDescription>
                Roles are assigned by a fleet manager and can't be changed here.
              </FieldDescription>
            </Field>
          </FieldGroup>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={updateProfile.isPending}>
            {updateProfile.isPending && <Spinner data-icon="inline-start" />}
            {updateProfile.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}

function PasswordCard() {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [confirmError, setConfirmError] = useState<string | null>(null)

  const changePassword = useMutation({
    mutationFn: async () => {
      const { error } = await authClient.changePassword({
        currentPassword,
        newPassword,
        revokeOtherSessions: true,
      })
      if (error) {
        throw new Error(error.message ?? 'Failed to change password')
      }
    },
    onSuccess: () => {
      toast.success('Password changed')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setConfirmError(null)
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to change password')
    },
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setConfirmError(null)

    if (newPassword.length < 8) {
      setConfirmError('Password must be at least 8 characters')
      return
    }
    if (newPassword !== confirmPassword) {
      setConfirmError('Passwords do not match')
      return
    }

    changePassword.mutate()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Password</CardTitle>
        <CardDescription>
          Update your password. You'll stay signed in on this device.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="current-password">Current Password</FieldLabel>
              <PasswordInput
                id="current-password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="new-password">New Password</FieldLabel>
              <PasswordInput
                id="new-password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </Field>
            <Field data-invalid={!!confirmError}>
              <FieldLabel htmlFor="confirm-password">Confirm New Password</FieldLabel>
              <PasswordInput
                id="confirm-password"
                required
                aria-invalid={!!confirmError}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <FieldError>{confirmError}</FieldError>
            </Field>
          </FieldGroup>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={changePassword.isPending}>
            {changePassword.isPending && <Spinner data-icon="inline-start" />}
            {changePassword.isPending ? 'Updating...' : 'Update Password'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
