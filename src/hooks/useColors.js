import { useThemeStore } from '../store';
import { lightColors, darkColors } from '../theme';

/**
 * Returns the active color palette based on the current theme mode.
 * Use this in screens that should support dark/light toggle.
 * Existing screens using `import { colors }` still work (light only).
 */
export function useColors() {
  const isDark = useThemeStore((s) => s.isDark);
  return isDark ? darkColors : lightColors;
}
