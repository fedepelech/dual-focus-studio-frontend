import axios from 'axios';
import { API_URL } from '../config/env';

const HTTP_UNAUTHORIZED = 401;
const STORAGE_KEY_TOKEN = 'admin_token';
const RUTA_LOGIN = '/admin/login';

const api = axios.create({
  baseURL: API_URL,
});

// Interceptor para inyectar el token de autenticación en las solicitudes
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(STORAGE_KEY_TOKEN);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor de respuesta para detectar expiración de sesión (401 Unauthorized)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    if (status === HTTP_UNAUTHORIZED) {
      // Remover token caducado
      localStorage.removeItem(STORAGE_KEY_TOKEN);

      // Redirigir al login si el usuario no se encuentra ya allí
      if (!window.location.pathname.includes(RUTA_LOGIN)) {
        window.location.href = `${RUTA_LOGIN}?expired=true`;
      }
    }
    return Promise.reject(error);
  }
);

export default api;
