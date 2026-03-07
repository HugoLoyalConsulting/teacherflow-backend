/**
 * Environment Configuration
 * Centralized place for all environment variables
 * Validates required vars at runtime
 */

interface EnvConfig {
  apiUrl: string
  apiTimeout: number
  logLevel: 'debug' | 'info' | 'warn' | 'error'
  isDevelopment: boolean
  isProduction: boolean
  useMockData: boolean
  environment: 'development' | 'qa' | 'production'
  isQaEnvironment: boolean
}

// Get env var with fallback - access via globalThis to avoid TS issues
const getEnv = (key: string, fallback?: string): string => {
  // @ts-ignore - Vite env vars are injected at build time
  const value = globalThis.import?.meta?.env?.[`VITE_${key}`] as string | undefined
  if (!value && !fallback) {
    console.warn(`[ENV] Missing ${key}, using fallback or default`)
    return fallback || ''
  }
  return value || fallback || ''
}

// Check if we're in development mode
const isDev = () => {
  // @ts-ignore
  return globalThis.import?.meta?.env?.DEV === true || typeof process !== 'undefined' && process.env.NODE_ENV === 'development'
}

// Determine environm

ent
const getEnvironment = (): 'development' | 'qa' | 'production' => {
  const envValue = getEnv('ENVIRONMENT', 'development').toLowerCase()
  if (envValue === 'qa' || envValue === 'staging') return 'qa'
  if (envValue === 'production' || envValue === 'prod') return 'production'
  return 'development'
}

export const config: EnvConfig = {
  // API Configuration
  apiUrl: getEnv('API_URL', 'http://localhost:3000'),
  apiTimeout: parseInt(getEnv('API_TIMEOUT', '10000'), 10),
  
  // Logging
  logLevel: (getEnv('LOG_LEVEL', 'info') as any) || 'info',
  
  // Environment Detection
  isDevelopment: isDev(),
  isProduction: !isDev(),
  environment: getEnvironment(),
  isQaEnvironment: getEnvironment() === 'qa',
  
  // Feature Flags
  useMockData: getEnv('USE_MOCK_DATA', isDev() ? 'true' : 'false') === 'true',
}

// Validate required config
export const validateConfig = (): void => {
  const required = ['apiUrl']
  const missing = required.filter(key => !config[key as keyof EnvConfig])
  
  if (missing.length > 0 && !config.isDevelopment) {
    throw new Error(`Missing required env vars: ${missing.join(', ')}`)
  }
}

// Log configuration (safe - don't log secrets)
export const logConfig = (): void => {
  if (config.logLevel === 'debug') {
    console.log('[CONFIG]', {
      apiUrl: config.apiUrl,
      isDevelopment: config.isDevelopment,
      useMockData: config.useMockData,
    })
  }
}
