import React, {createContext, useCallback, useContext, useMemo, useState} from 'react';
import {DARK_THEME, LIGHT_THEME, ThemePalette} from '../constants/theme';

export type ThemeMode = 'light' | 'dark';

type ThemeContextValue = {
  themeMode: ThemeMode;
  theme: ThemePalette;
  isDark: boolean;
  setThemeMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({children}: {children: React.ReactNode}) {
  const [themeMode, setThemeMode] = useState<ThemeMode>('light');
  const isDark = themeMode === 'dark';
  const theme = isDark ? DARK_THEME : LIGHT_THEME;

  const toggleTheme = useCallback(() => {
    setThemeMode(mode => (mode === 'light' ? 'dark' : 'light'));
  }, []);

  const value = useMemo(
    () => ({themeMode, theme, isDark, setThemeMode, toggleTheme}),
    [themeMode, theme, isDark, toggleTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used inside ThemeProvider');
  }
  return context;
}
