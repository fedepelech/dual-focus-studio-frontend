/// <reference types="vite/client" />

/**
 * Declaración de tipos para variables de entorno de Vite
 * Esto provee autocompletado y type-safety para import.meta.env
 */
interface ImportMetaEnv {
  /** URL base del API del backend */
  readonly VITE_API_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
