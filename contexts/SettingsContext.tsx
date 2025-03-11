'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface SettingsContextType {
  gridSize: number;
  setGridSize: (size: number) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [gridSize, setGridSize] = useState(5);

  return (
    <SettingsContext.Provider value={{ gridSize, setGridSize }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
} 