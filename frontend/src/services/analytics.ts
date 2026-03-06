/**
 * PostHog Product Analytics - Frontend Integration
 * 
 * Tracks user behavior and product usage on the frontend
 */

import posthog from 'posthog-js'

const POSTHOG_KEY = import.meta.env.VITE_POSTHOG_KEY || ''
const POSTHOG_HOST = import.meta.env.VITE_POSTHOG_HOST || 'https://app.posthog.com'
const ENVIRONMENT = import.meta.env.MODE || 'development'
const POSTHOG_ENABLED = import.meta.env.VITE_POSTHOG_ENABLED === 'true'

// Initialize PostHog
export function initPostHog(): void {
  if (!POSTHOG_ENABLED || !POSTHOG_KEY) {
    console.log('PostHog disabled or no API key provided')
    return
  }

  try {
    posthog.init(POSTHOG_KEY, {
      api_host: POSTHOG_HOST,
      loaded: (posthogInstance: any) => {
        if (ENVIRONMENT === 'development') {
          console.log('PostHog initialized in development mode')
          posthogInstance.debug()
        }
      },
      capture_pageview: true,
      capture_pageleave: true,
      autocapture: true,
      
      // Privacy settings
      respect_dnt: true,
      disable_session_recording: ENVIRONMENT === 'development',
    })

    console.log('PostHog analytics initialized')
  } catch (error) {
    console.error('Failed to initialize PostHog:', error)
  }
}

// Identify user
export function identifyUser(
  userId: string,
  properties?: {
    email?: string
    name?: string
    organization_id?: string
    [key: string]: any
  }
): void {
  if (!POSTHOG_ENABLED) return

  try {
    posthog.identify(userId, properties)
    
    // Set organization group if provided
    if (properties?.organization_id) {
      posthog.group('organization', properties.organization_id)
    }
  } catch (error) {
    console.error('PostHog identify error:', error)
  }
}

// Track custom event
export function trackEvent(
  eventName: string,
  properties?: Record<string, any>
): void {
  if (!POSTHOG_ENABLED) return

  try {
    posthog.capture(eventName, properties)
  } catch (error) {
    console.error('PostHog track error:', error)
  }
}

// Reset user (on logout)
export function resetUser(): void {
  if (!POSTHOG_ENABLED) return

  try {
    posthog.reset()
  } catch (error) {
    console.error('PostHog reset error:', error)
  }
}

// Set user properties
export function setUserProperties(properties: Record<string, any>): void {
  if (!POSTHOG_ENABLED) return

  try {
    posthog.people.set(properties)
  } catch (error) {
    console.error('PostHog set user properties error:', error)
  }
}

// Page view tracking (manual, if needed)
export function trackPageView(pageName?: string): void {
  if (!POSTHOG_ENABLED) return

  try {
    posthog.capture('$pageview', { page: pageName })
  } catch (error) {
    console.error('PostHog page view error:', error)
  }
}

// Standard event names (matching backend)
export const Events = {
  // Authentication
  USER_SIGNED_UP: 'user_signed_up',
  USER_LOGGED_IN: 'user_logged_in',
  USER_LOGGED_OUT: 'user_logged_out',
  
  // Students
  STUDENT_CREATED: 'student_created',
  STUDENT_UPDATED: 'student_updated',
  STUDENT_DELETED: 'student_deleted',
  STUDENT_VIEWED: 'student_viewed',
  
  // Classes/Groups
  CLASS_CREATED: 'class_created',
  CLASS_UPDATED: 'class_updated',
  CLASS_DELETED: 'class_deleted',
  CLASS_VIEWED: 'class_viewed',
  
  // Lessons
  LESSON_CREATED: 'lesson_created',
  LESSON_VIEWED: 'lesson_viewed',
  LESSON_STARTED: 'lesson_started',
  LESSON_COMPLETED: 'lesson_completed',
  
  // Attendance
  ATTENDANCE_MARKED: 'attendance_marked',
  ATTENDANCE_UPDATED: 'attendance_updated',
  
  // Payments
  PAYMENT_CREATED: 'payment_created',
  PAYMENT_VIEWED: 'payment_viewed',
  PAYMENT_UPDATED: 'payment_updated',
  
  // Navigation
  PAGE_VIEWED: 'page_viewed',
  DASHBOARD_VIEWED: 'dashboard_viewed',
  
  // Features
  FEATURE_USED: 'feature_used',
  SEARCH_PERFORMED: 'search_performed',
  FILTER_APPLIED: 'filter_applied',
  EXPORT_DOWNLOADED: 'export_downloaded',
} as const

// Helper functions for common events
export const Analytics = {
  // Auth events
  trackSignup(method: 'email' | 'google', userId: string, organizationId?: string) {
    trackEvent(Events.USER_SIGNED_UP, {
      method,
      user_id: userId,
      organization_id: organizationId,
    })
  },

  trackLogin(method: 'email' | 'google', userId: string, organizationId?: string) {
    trackEvent(Events.USER_LOGGED_IN, {
      method,
      user_id: userId,
      organization_id: organizationId,
    })
  },

  trackLogout(userId: string) {
    trackEvent(Events.USER_LOGGED_OUT, { user_id: userId })
    resetUser()
  },

  // Student events
  trackStudentCreated(studentId: string, organizationId: string) {
    trackEvent(Events.STUDENT_CREATED, {
      student_id: studentId,
      organization_id: organizationId,
    })
  },

  trackStudentViewed(studentId: string, organizationId: string) {
    trackEvent(Events.STUDENT_VIEWED, {
      student_id: studentId,
      organization_id: organizationId,
    })
  },

  // Class events
  trackClassCreated(classId: string, organizationId: string) {
    trackEvent(Events.CLASS_CREATED, {
      class_id: classId,
      organization_id: organizationId,
    })
  },

  // Payment events
  trackPaymentCreated(paymentId: string, amount: number, organizationId: string) {
    trackEvent(Events.PAYMENT_CREATED, {
      payment_id: paymentId,
      amount,
      organization_id: organizationId,
    })
  },

  // Page events
  trackPageView(pageName: string, properties?: Record<string, any>) {
    trackEvent(Events.PAGE_VIEWED, {
      page: pageName,
      ...properties,
    })
  },

  // Feature usage
  trackFeatureUsed(featureName: string, properties?: Record<string, any>) {
    trackEvent(Events.FEATURE_USED, {
      feature: featureName,
      ...properties,
    })
  },
}

export default posthog
