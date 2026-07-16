
import { useContext, createContext, useState, useEffect, useCallback } from 'react';
import { getSavedTheme, saveTheme } from '../services/storage';
import { lightColors, darkColors, spacing, radius, fontSizes, fontWeights, shadows, fonts } from '../constants/theme';

const THEMES = {
  light: { colors: lightColors, spacing, radius, fontSizes, fontWeights, shadows, fonts },
  dark:  { colors: darkColors,  spacing, radius, fontSizes, fontWeights, shadows, fonts },
};

const ThemeContext = createContext(THEMES.light);

export function ThemeProvider({ children }) {
  const [mode, setMode] = useState('light');

  useEffect(() => {
    getSavedTheme().then((saved) => {
      if (THEMES[saved]) setMode(saved);
    });
  }, []);

  const toggleTheme = useCallback(() => {
    setMode((prev) => {
      const next = prev === 'light' ? 'dark' : 'light';
      saveTheme(next);
      return next;
    });
  }, []);

  const theme = { ...(THEMES[mode] || THEMES.light), mode, toggleTheme };

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
}

export default function useTheme() {
  return useContext(ThemeContext);
}
