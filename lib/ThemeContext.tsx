'use client';

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

type Mode = 'light' | 'dark';

const ThemeContext = createContext<{ mode: Mode; setMode: (mode: Mode) => void } | null>(null);

const STORAGE_KEY = 'extreme-ttt-theme';

export function useThemeMode() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useThemeMode must be used within ThemeRegistry');
  return ctx;
}

export function ThemeRegistry({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<Mode>('dark');

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as Mode | null;
    if (stored === 'light' || stored === 'dark') setModeState(stored);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', mode === 'dark');
  }, [mode]);

  const setMode = useCallback((next: Mode) => {
    setModeState(next);
    if (typeof window !== 'undefined') localStorage.setItem(STORAGE_KEY, next);
  }, []);

  return <ThemeContext.Provider value={{ mode, setMode }}>{children}</ThemeContext.Provider>;
}
