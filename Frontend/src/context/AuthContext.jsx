import { createContext, useEffect, useMemo, useState } from 'react';
import { login as loginRequest, logout as logoutRequest } from '@/api/auth';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('ai_solutions_token'));
  const [admin, setAdmin] = useState(() => {
    const stored = localStorage.getItem('ai_solutions_admin');
    return stored ? JSON.parse(stored) : null;
  });

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
    await logoutRequest();
    setToken(null);
    setAdmin(null);
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
