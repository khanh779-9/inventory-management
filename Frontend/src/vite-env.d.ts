/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string
  readonly VITE_APP_NAME?: string
  readonly VITE_TOKEN_KEY?: string
  readonly VITE_USER_KEY?: string
  readonly VITE_EXPIRES_AT_KEY?: string
  readonly VITE_TOAST_DURATION_MS?: string
  readonly VITE_PAGE_SIZE?: string
  readonly VITE_DEV_PORT?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
