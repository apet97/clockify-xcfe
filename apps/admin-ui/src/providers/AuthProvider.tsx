import React, { createContext, useContext, useMemo, useState } from 'react';

type SessionMetadata = {
  userId?: string;
  email?: string;
};

type AuthContextValue = {
  token: string | null;
  user: SessionMetadata | null;
  login: (token: string, meta?: SessionMetadata) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<SessionMetadata | null>(null);

  const value = useMemo<AuthContextValue>(
    () => ({
      token,
      user,
      login: (nextToken, meta) => {
        setToken(nextToken);
        setUser(meta ?? null);
      },
      logout: () => {
        setToken(null);
        setUser(null);
      }
    }),
    [token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return ctx;
};
