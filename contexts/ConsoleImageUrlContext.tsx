import { getConsoleIds } from '@retroachievements/api';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';

interface ConsoleImageUrlContextType {
  consoleImageUrls: Map<number, string>;
}

const ConsoleImageUrlContext = createContext<
  ConsoleImageUrlContextType | undefined
>(undefined);

export function ConsoleImageUrlProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [consoleImageUrls, setConsoleImageUrls] = useState<Map<number, string>>(
    new Map(),
  );
  const { authorization, isAuthenticated } = useAuth();

  useEffect(() => {
    async function setup() {
      if (!isAuthenticated || !authorization) return;

      const response = await getConsoleIds(authorization);
      const imageUrlMap = new Map<number, string>();
      response.forEach((console) => {
        imageUrlMap.set(console.id, console.iconUrl);
      });

      setConsoleImageUrls(imageUrlMap);
    }

    setup();
  }, [authorization, isAuthenticated]);

  const value: ConsoleImageUrlContextType = {
    consoleImageUrls,
  };

  return (
    <ConsoleImageUrlContext.Provider value={value}>
      {children}
    </ConsoleImageUrlContext.Provider>
  );
}

export function useConsoleImageUrls() {
  const context = useContext(ConsoleImageUrlContext);

  if (context === undefined) {
    throw new Error(
      'useConsoleImageUrls must be used within an ConsoleImageUrlProvider',
    );
  }
  return context;
}
