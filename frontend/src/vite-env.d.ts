/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_API_TIMEOUT: string
  readonly VITE_GOOGLE_CLIENT_ID: string
  readonly VITE_JWT_STORAGE_KEY: string
  readonly VITE_USER_STORAGE_KEY: string
  readonly VITE_POSTHOG_ENABLED: string
  readonly VITE_POSTHOG_KEY: string
  readonly VITE_POSTHOG_HOST: string
  readonly VITE_SENTRY_ENABLED: string
  readonly VITE_SENTRY_DSN: string
  readonly MODE: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  // adicione outras variáveis de ambiente aqui conforme necessário
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
