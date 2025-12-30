"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

interface SiteReadyContextType {
  isPreloaderDone: boolean;
  isRegulatoryAccepted: boolean;
  isSiteReady: boolean;
  setPreloaderDone: () => void;
  setRegulatoryAccepted: () => void;
}

const SiteReadyContext = createContext<SiteReadyContextType | null>(null);

export function SiteReadyProvider({ children }: { children: ReactNode }) {
  const [isPreloaderDone, setIsPreloaderDone] = useState(false);
  const [isRegulatoryAccepted, setIsRegulatoryAccepted] = useState(false);

  const setPreloaderDone = useCallback(() => {
    setIsPreloaderDone(true);
  }, []);

  const setRegulatoryAccepted = useCallback(() => {
    setIsRegulatoryAccepted(true);
  }, []);

  const isSiteReady = isPreloaderDone && isRegulatoryAccepted;

  return (
    <SiteReadyContext.Provider
      value={{
        isPreloaderDone,
        isRegulatoryAccepted,
        isSiteReady,
        setPreloaderDone,
        setRegulatoryAccepted,
      }}
    >
      {children}
    </SiteReadyContext.Provider>
  );
}

export function useSiteReady() {
  const context = useContext(SiteReadyContext);
  if (!context) {
    throw new Error("useSiteReady must be used within SiteReadyProvider");
  }
  return context;
}
