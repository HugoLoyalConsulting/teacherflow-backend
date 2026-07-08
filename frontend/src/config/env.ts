/**
 * Environment Configuration
 * Centralized place for all environment variables
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

const getEnvironment = (): 'development' | 'qa' | 'production' => {
  const envValue = (import.meta.env.VITE_ENVIRONMENT || 'development').toLowerCase()
  if (envValue === 'qa' || envValue === 'staging') return 'qa'
  if (envValue === 'production' || envValue === 'prod') return 'production'
  return 'development'
}

export const config: EnvConfig = {
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  apiTimeout: parseInt(import.meta.env.VITE_API_TIMEOUT || '10000', 10),
  logLevel: (import.meta.env.VITE_LOG_LEVEL || 'info') as EnvConfig['logLevel'],
  isDevelopment: import.meta.env.DEV === true,
  isProduction: import.meta.env.PROD === true,
  environment: getEnvironment(),
  isQaEnvironment: getEnvironment() === 'qa',
  useMockData: (import.meta.env.VITE_USE_MOCK_DATA || (import.meta.env.DEV ? 'true' : 'false')) === 'true',
}

export const validateConfig = (): void => {
  const required = ['apiUrl']
  const missing = required.filter(key => !config[key as keyof EnvConfig])
  if (missing.length > 0 && !config.isDevelopment) {
    throw new Error(`Missing required env vars: ${missing.join(', ')}`)
  }
}

export const logConfig = (): void => {
  if (config.logLevel === 'debug') {
    console.log('[CONFIG]', {
      apiUrl: config.apiUrl,
      isDevelopment: config.isDevelopment,
      useMockData: config.useMockData,
    })
  }
}
