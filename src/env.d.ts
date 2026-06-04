/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

interface ImportMetaEnv {
  readonly VITE_BASE_URL: string
  readonly VITE_API_URL: string
  readonly VITE_UPLOAD_TYPE: string
  readonly VITE_APP_TITLE: string
  readonly VITE_PORT: string
  readonly VITE_TENANT_ID: string
  readonly VITE_BASE_PATH: string
  readonly VITE_DROP_CONSOLE: string
  readonly VITE_SOURCEMAP: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
