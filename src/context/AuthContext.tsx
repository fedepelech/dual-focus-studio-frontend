import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const STORAGE_KEY_TOKEN = 'admin_token';
const INTERVALO_VERIFICACION_MS = 30000; // Verificar cada 30 segundos

interface AuthContextType {
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

/**
 * Determina si un token JWT ha expirado decodificando el timestamp `exp` en su payload.
 */
export function isTokenExpired(jwtToken: string | null): boolean {
  if (!jwtToken) return true;
  try {
    const parts = jwtToken.split('.');
    if (parts.length < 2) return true;
    
    // Normalizar base64url a base64 estándar para compatibilidad con atob
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );

    const payload = JSON.parse(jsonPayload);
    if (!payload.exp) return false;

    const ahoraEnSegundos = Math.floor(Date.now() / 1000);
    return payload.exp < ahoraEnSegundos;
  } catch {
    return true;
  }
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => {
    const stored = localStorage.getItem(STORAGE_KEY_TOKEN);
    if (stored && isTokenExpired(stored)) {
      localStorage.removeItem(STORAGE_KEY_TOKEN);
      return null;
    }
    return stored;
  });

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY_TOKEN);
    setToken(null);
  }, []);

  const login = (newToken: string) => {
    localStorage.setItem(STORAGE_KEY_TOKEN, newToken);
    setToken(newToken);
  };

  // Monitorear expiración del token en tiempo real
  useEffect(() => {
    if (!token) return;

    // Verificar si ya expiró
    if (isTokenExpired(token)) {
      logout();
      return;
    }

    // Intervalo de comprobación periódica
    const timer = setInterval(() => {
      if (isTokenExpired(token)) {
        logout();
      }
    }, INTERVALO_VERIFICACION_MS);

    return () => clearInterval(timer);
  }, [token, logout]);

  const isAuthenticated = Boolean(token && !isTokenExpired(token));

  return (
    <AuthContext.Provider value={{ token, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser utilizado dentro de un AuthProvider');
  }
  return context;
};
