import { API_KEY_STORAGE_KEY, USERNAME_STORAGE_KEY } from '@/constants';
import { getStorageKey, setStorageKey } from '@/utils/storage';
import { buildAuthorization } from '@retroachievements/api';
import React, { createContext, useContext, useEffect, useState } from 'react';

interface AuthContextType {
  username: string;
  apiKey: string | null;
  authorization: any | null;
  isAuthenticated: boolean;
  setCredentials: (username: string, apiKey: string) => Promise<void>;
  clearCredentials: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [username, setUsername] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [authorization, setAuthorization] = useState<any | null>(null);

  useEffect(() => {
    loadCredentials();
  }, []);

  const loadCredentials = async () => {
    const storedUsername = await getStorageKey(USERNAME_STORAGE_KEY);
    const storedApiKey = await getStorageKey(API_KEY_STORAGE_KEY);

    if (storedUsername && storedApiKey) {
      setUsername(storedUsername);
      setApiKey(storedApiKey);
      setAuthorization(
        buildAuthorization({
          username: storedUsername,
          webApiKey: storedApiKey,
        }),
      );
    }
  };

  const setCredentials = async (newUsername: string, newApiKey: string) => {
    await setStorageKey(USERNAME_STORAGE_KEY, newUsername);
    await setStorageKey(API_KEY_STORAGE_KEY, newApiKey);
    setUsername(newUsername);
    setApiKey(newApiKey);
    setAuthorization(
      buildAuthorization({ username: newUsername, webApiKey: newApiKey }),
    );
  };

  const clearCredentials = async () => {
    await setStorageKey(USERNAME_STORAGE_KEY, '');
    await setStorageKey(API_KEY_STORAGE_KEY, '');
    setUsername(null);
    setApiKey(null);
    setAuthorization(null);
  };

  const value: AuthContextType = {
    username: username || '',
    apiKey,
    authorization,
    isAuthenticated: !!authorization,
    setCredentials,
    clearCredentials,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
