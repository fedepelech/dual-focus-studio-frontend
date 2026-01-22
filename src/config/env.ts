/**
 * Configuración centralizada de variables de entorno
 * Todas las variables de entorno del frontend deben consumirse desde aquí
 */

// URL base del API del backend
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// URL para archivos estáticos (uploads)
export const UPLOADS_URL = API_URL.replace('/api', '/uploads');

// Modo de entorno
export const IS_PRODUCTION = import.meta.env.PROD;
export const IS_DEVELOPMENT = import.meta.env.DEV;
