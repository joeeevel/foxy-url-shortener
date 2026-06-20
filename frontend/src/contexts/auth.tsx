'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { api, getApiKey, setApiKey as storeKey, clearApiKey, type User } from '@/src/lib/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  authenticated: boolean;
  providers: { google: boolean; github: boolean };
  logout: () => Promise<void>;
  apiKey: string | null;
  setApiKey: (key: string) => void;
  clearApiKey: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  authenticated: false,
  providers: { google: false, github: false },
  logout: async () => {},
  apiKey: null,
  setApiKey: () => {},
  clearApiKey: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [providers, setProviders] = useState({ google: false, github: false });
  const [apiKey, setApiKeyState] = useState<string | null>(null);

  const fetchUser = useCallback(async () => {
    try {
      const status = await api.auth.me();
      setProviders(status.providers);
      if (status.authenticated && status.user) {
        setUser(status.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const stored = getApiKey();
    if (stored) setApiKeyState(stored);
    fetchUser();
  }, [fetchUser]);

  const logout = async () => {
    try {
      await api.auth.logout();
    } catch {
      // ignore
    }
    setUser(null);
    clearApiKey();
    setApiKeyState(null);
  };

  const setApiKeyAndStore = (key: string) => {
    storeKey(key);
    setApiKeyState(key);
  };

  const clearApiKeyAndStore = () => {
    clearApiKey();
    setApiKeyState(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        authenticated: !!user,
        providers,
        logout,
        apiKey,
        setApiKey: setApiKeyAndStore,
        clearApiKey: clearApiKeyAndStore,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
