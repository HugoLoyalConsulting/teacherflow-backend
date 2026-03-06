/**
 * Sentry Error Monitoring - Frontend Integration
 * 
 * Captures and reports errors from the frontend
 */

import * as Sentry from '@sentry/react'
import { BrowserTracing } from '@sentry/tracing'

const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN || ''
const ENVIRONMENT = import.meta.env.MODE || 'development'
const SENTRY_ENABLED = import.meta.env.VITE_SENTRY_ENABLED === 'true'

// Initialize Sentry
export function initSentry(): void {
  if (!SENTRY_ENABLED || !SENTRY_DSN) {
    console.log('Sentry disabled or no DSN provided')
    return
  }

  try {
    Sentry.init({
      dsn: SENTRY_DSN,
      environment: ENVIRONMENT,
      integrations: [
        new BrowserTracing(),
        new Sentry.Replay({
          // Mask all text and block all media by default
          maskAllText: true,
          blockAllMedia: true,
        }),
      ],
      
      // Performance Monitoring
      tracesSampleRate: ENVIRONMENT === 'production' ? 0.1 : 1.0,
      
      // Session Replay
      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1.0,
      
      // Filter sensitive data
      beforeSend(event: any, _hint: any) {
        // Filter out sensitive data
        if (event.request?.cookies) {
          delete event.request.cookies
        }
        
        if (event.request?.headers) {
          delete event.request.headers['Authorization']
          delete event.request.headers['Cookie']
        }
        
        return event
      },
      
      // Ignore certain errors
      ignoreErrors: [
        // Browser extensions
        'top.GLOBALS',
        'canvas.contentDocument',
        'MyApp_RemoveAllHighlights',
        'atomicFindClose',
        
        // Network errors
        'NetworkError',
        'Network request failed',
        'Failed to fetch',
        
        // Random browser errors
        'ResizeObserver loop limit exceeded',
        'Non-Error promise rejection captured',
      ],
      
      denyUrls: [
        // Chrome extensions
        /extensions\//i,
        /^chrome:\/\//i,
        /^chrome-extension:\/\//i,
      ],
    })

    console.log('Sentry error monitoring initialized')
  } catch (error) {
    console.error('Failed to initialize Sentry:', error)
  }
}

// Set user context
export function setUserContext(
  userId: string,
  email?: string,
  organizationId?: string
): void {
  if (!SENTRY_ENABLED) return

  try {
    Sentry.setUser({
      id: userId,
      email: email,
    })
    
    if (organizationId) {
      Sentry.setTag('organization_id', organizationId)
    }
  } catch (error) {
    console.error('Sentry set user error:', error)
  }
}

// Clear user context (on logout)
export function clearUserContext(): void {
  if (!SENTRY_ENABLED) return

  try {
    Sentry.setUser(null)
  } catch (error) {
    console.error('Sentry clear user error:', error)
  }
}

// Manually capture exception
export function captureException(
  error: Error,
  context?: Record<string, any>
): void {
  if (!SENTRY_ENABLED) return

  try {
    if (context) {
      Sentry.setContext('additional', context)
    }
    Sentry.captureException(error)
  } catch (e) {
    console.error('Sentry capture exception error:', e)
  }
}

// Manually capture message
export function captureMessage(
  message: string,
  level: Sentry.SeverityLevel = 'info',
  context?: Record<string, any>
): void {
  if (!SENTRY_ENABLED) return

  try {
    if (context) {
      Sentry.setContext('additional', context)
    }
    Sentry.captureMessage(message, level)
  } catch (error) {
    console.error('Sentry capture message error:', error)
  }
}

// Add breadcrumb for better context
export function addBreadcrumb(
  message: string,
  category?: string,
  level?: Sentry.SeverityLevel,
  data?: Record<string, any>
): void {
  if (!SENTRY_ENABLED) return

  try {
    Sentry.addBreadcrumb({
      message,
      category: category || 'default',
      level: level || 'info',
      data: data || {},
    })
  } catch (error) {
    console.error('Sentry add breadcrumb error:', error)
  }
}

// Set tag
export function setTag(key: string, value: string): void {
  if (!SENTRY_ENABLED) return

  try {
    Sentry.setTag(key, value)
  } catch (error) {
    console.error('Sentry set tag error:', error)
  }
}

// Set context
export function setContext(name: string, context: Record<string, any>): void {
  if (!SENTRY_ENABLED) return

  try {
    Sentry.setContext(name, context)
  } catch (error) {
    console.error('Sentry set context error:', error)
  }
}

export { Sentry }
export default Sentry
