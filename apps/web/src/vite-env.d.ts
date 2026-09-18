/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Base URL for the API. Defaults to same-origin "/api" (dev proxy / same-domain deploy). */
  readonly VITE_API_BASE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
