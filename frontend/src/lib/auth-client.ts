import { createAuthClient } from 'better-auth/react'
import { sentinelClient } from '@better-auth/infra/client'

export const authClient = createAuthClient({
  /** The base URL of the server (optional if you're using the same domain) */
  baseURL: 'http://localhost:3000',
  plugins: [
    sentinelClient({
      identifyUrl: import.meta.env.VITE_SENTINEL_IDENTIFY_URL,
    }),
  ],
})
