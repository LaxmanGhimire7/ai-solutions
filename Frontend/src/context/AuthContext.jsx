import { createContext, useEffect, useMemo, useState } from 'react';
import { login as loginRequest, logout as logoutRequest } from '@/api/auth';
import { isTokenExpired, readStoredJson } from '@/utils/storage';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => {
    const storedToken = localStorage.getItem('ai_solutions_token');

    if (isTokenExpired(storedToken)) {
      localStorage.removeItem('ai_solutions_token');
      localStorage.removeItem('ai_solutions_admin');
      return null;
    }

    return storedToken;
  });
  const [admin, setAdmin] = useState(() => readStoredJson('ai_solutions_admin'));

  useEffect(() => {
    const handleUnauthorized = () => {
      setToken(null);
      setAdmin(null);
    };

    window.addEventListener('ai-solutions:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('ai-solutions:unauthorized', handleUnauthorized);
  }, []);

  useEffect(() => {
    if (token) {
      localStorage.setItem('ai_solutions_token', token);
    } else {
      localStorage.removeItem('ai_solutions_token');
    }
  }, [token]);

  useEffect(() => {
    if (admin) {
      localStorage.setItem('ai_solutions_admin', JSON.stringify(admin));
    } else {
      localStorage.removeItem('ai_solutions_admin');
    }
  }, [admin]);

  const login = async (email, password) => {
    const response = await loginRequest(email, password);
    const payload = response.data;

    setToken(payload.token);
    setAdmin(payload.admin);

    return payload.admin;
  };

  const logout = async () => {
    setToken(null);
    setAdmin(null);
    await logoutRequest();
  };

  const value = useMemo(
    () => ({
      admin,
      token,
      isAuthenticated: Boolean(token),
      login,
      logout,
    }),
    [admin, token]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
