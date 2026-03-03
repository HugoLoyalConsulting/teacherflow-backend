/**
 * Google OAuth Configuration
 */

export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID'

export const isGoogleOAuthConfigured = (): boolean => {
  return GOOGLE_CLIENT_ID !== 'YOUR_GOOGLE_CLIENT_ID' && GOOGLE_CLIENT_ID.length > 0
}

export interface GoogleAuthResponse {
  credential: string
}

export interface GoogleUserProfile {
  id: string
  email: string
  name: string
  picture?: string
  email_verified: boolean
  aud: string
  iss: string
  iat: number
  exp: number
}

/**
 * Decode JWT token from Google (for demonstration)
 * In production, this should be validated on the backend
 */
export const decodeGoogleToken = (token: string): GoogleUserProfile | null => {
  try {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )
    return JSON.parse(jsonPayload)
  } catch (error) {
    console.error('Error decoding Google token:', error)
    return null
  }
}
