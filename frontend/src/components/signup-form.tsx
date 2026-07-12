import { useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/password-input'
import { Spinner } from '@/components/ui/spinner'
import { authClient } from '#/lib/auth-client'
import { useMutation } from '@tanstack/react-query'
import { Link, useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<'form'>) {
  const navigate = useNavigate()
  const passwordRef = useRef<HTMLInputElement>(null)
  const confirmPasswordRef = useRef<HTMLInputElement>(null)
  const [passwordLengthError, setPasswordLengthError] = useState<string | null>(null)
  const [passwordError, setPasswordError] = useState<string | null>(null)

  const validatePasswordLength = () => {
    const password = passwordRef.current?.value ?? ''
    setPasswordLengthError(
      password.length > 0 && password.length < 8
        ? 'Password must be at least 8 characters long'
        : null
    )
  }

  const validatePasswordMatch = () => {
    const password = passwordRef.current?.value ?? ''
    const confirmPassword = confirmPasswordRef.current?.value ?? ''
    setPasswordError(
      confirmPassword.length > 0 && password !== confirmPassword
        ? 'Passwords do not match'
        : null
    )
  }

  const signUpMutation = useMutation({
    mutationFn: async (inputs: { name: string; email: string; password: string }) => {
      const { data, error } = await authClient.signUp.email({
        name: inputs.name,
        email: inputs.email,
        password: inputs.password,
      })
      if (error) {
        throw new Error(error.message ?? 'Failed to create account')
      }
      return data
    },
    onSuccess: () => {
      toast.success('Account created. Check your email to verify it.')
      navigate({ to: '/dashboard' })
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create account')
    },
  })

  const handleSubmit = (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const name = formData.get('name') as string
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const confirmPassword = formData.get('confirm-password') as string

    validatePasswordLength()
    validatePasswordMatch()

    if (password.length < 8 || password !== confirmPassword) {
      return
    }

    signUpMutation.mutate({ name, email, password })
  }

  const handleGithubLogin = async () => {
    try {
      const { data, error } = await authClient.signIn.social({
        provider: 'github',
      })
      console.log('GitHub login response:', data, error)
      if (error) {
        throw new Error(error.message ?? 'Failed to sign in with GitHub')
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to sign in with GitHub')
    }
  }

  return (
    <form
      className={cn('flex flex-col gap-6', className)}
      onSubmit={handleSubmit}
      {...props}
    >
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Create your account</h1>
          <p className="text-sm text-balance text-muted-foreground">
            Fill in the form below to create your account
          </p>
        </div>
        <Field>
          <FieldLabel htmlFor="name">Full Name</FieldLabel>
          <Input
            id="name"
            name="name"
            type="text"
            placeholder="John Doe"
            required
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="m@example.com"
            required
          />
          <FieldDescription>
            We&apos;ll use this to contact you. We will not share your email
            with anyone else.
          </FieldDescription>
        </Field>
        <Field data-invalid={!!passwordLengthError}>
          <FieldLabel htmlFor="password">Password</FieldLabel>
          <PasswordInput
            id="password"
            name="password"
            ref={passwordRef}
            aria-invalid={!!passwordLengthError}
            onBlur={validatePasswordLength}
            required
          />
          {passwordLengthError ? (
            <FieldError>{passwordLengthError}</FieldError>
          ) : (
            <FieldDescription>
              Must be at least 8 characters long.
            </FieldDescription>
          )}
        </Field>
        <Field data-invalid={!!passwordError}>
          <FieldLabel htmlFor="confirm-password">Confirm Password</FieldLabel>
          <PasswordInput
            id="confirm-password"
            name="confirm-password"
            ref={confirmPasswordRef}
            aria-invalid={!!passwordError}
            onBlur={validatePasswordMatch}
            required
          />
          {passwordError ? (
            <FieldError>{passwordError}</FieldError>
          ) : (
            <FieldDescription>Please confirm your password.</FieldDescription>
          )}
        </Field>
        <Field>
          <Button type="submit" disabled={signUpMutation.isPending}>
            {signUpMutation.isPending && <Spinner data-icon="inline-start" />}
            {signUpMutation.isPending
              ? 'Creating account...'
              : 'Create Account'}
          </Button>
        </Field>
        <FieldSeparator>Or continue with</FieldSeparator>
        <Field>
          <Button variant="outline" type="button" onClick={handleGithubLogin}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <path
                d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"
                fill="currentColor"
              />
            </svg>
            Sign up with GitHub
          </Button>
          <FieldDescription className="px-6 text-center">
            Already have an account? <Link to="/auth/login">Sign in</Link>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  )
}
