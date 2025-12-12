/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SENTRY_DSN: string
  readonly VITE_SENTRY_ENVIRONMENT: string
  readonly VITE_API_BASE_URL: string
  readonly VITE_OTEL_COLLECTOR_URL: string
  readonly VITE_OTEL_SERVICE_NAME: string
  readonly VITE_JAEGER_UI_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
