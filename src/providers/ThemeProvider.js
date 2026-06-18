import { createContext, useContext } from 'react';
import { useThemeStore } from '../store';
import { lightColors, darkColors } from '../theme';

const ThemeContext = createContext(lightColors);

/**
 * Wrap the app with this provider. All children can use useTheme()
 * to get the current color palette that reacts to dark mode toggle.
 */
export function ThemeProvider({ children }) {
  const isDark = useThemeStore((s) => s.isDark);
  const colors = isDark ? darkColors : lightColors;
  return (
    <ThemeContext.Provider value={colors}>
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * Returns the active color palette. Updates when theme toggles.
 * Use this instead of importing `colors` directly.
 */
export function useTheme() {
  return useContext(ThemeContext);
}
