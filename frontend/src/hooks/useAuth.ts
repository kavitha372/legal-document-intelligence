// Authentication context and hook
import { createContext, useContext, useState, useCallback, ReactNode, createElement } from 'react';
import { User, AuthState } from '../types';
import { login as apiLogin, logout as apiLogout } from '../api/auth';

interface AuthContextValue extends AuthState {
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function loadInitialState(): AuthState {
  try {
    const token = localStorage.getItem('auth_token');
    const userStr = localStorage.getItem('auth_user');
    if (token && userStr) {
      return { token, user: JSON.parse(userStr), isAuthenticated: true };
    }
  } catch {
    // ignore
  }
  return { token: null, user: null, isAuthenticated: false };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(loadInitialState);

  const login = useCallback(async (username: string, password: string) => {
    const res = await apiLogin(username, password);
    if (res.success && res.data) {
      localStorage.setItem('auth_token', res.data.token);
      localStorage.setItem('auth_user', JSON.stringify(res.data.user));
      setState({ token: res.data.token, user: res.data.user, isAuthenticated: true });
    } else {
      throw new Error(res.error || 'Login failed');
    }
  }, []);

  const logout = useCallback(async () => {
    try { await apiLogout(); } catch { /* ignore */ }
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    setState({ token: null, user: null, isAuthenticated: false });
  }, []);

  return createElement(AuthContext.Provider, { value: { ...state, login, logout } }, children);
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
