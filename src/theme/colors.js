/**
 * Design tokens — update these from Figma variables once exported.
 * Figma file: Food-Delivery-App--Community-
 */

/** Light palette (default) */
export const lightColors = {
  primary: '#FF6B35',
  primaryDark: '#E55A2B',
  primaryLight: '#FFF0EB',

  secondary: '#2ECC71',
  secondaryDark: '#27AE60',

  background: '#FFFFFF',
  backgroundSecondary: '#F8F9FA',
  surface: '#FFFFFF',

  text: '#1A1A1A',
  textSecondary: '#6B7280',
  textMuted: '#9CA3AF',
  textInverse: '#FFFFFF',

  border: '#E5E7EB',
  borderLight: '#F3F4F6',

  error: '#EF4444',
  warning: '#F59E0B',
  success: '#10B981',

  rating: '#FFB800',
  overlay: 'rgba(0, 0, 0, 0.5)',

  tabBar: '#FFFFFF',
  tabBarInactive: '#9CA3AF',
  tabBarActive: '#FF6B35',

  // Splash / Onboarding
  splashDark: '#1A1A2E',
  dotInactive: '#D9D9D9',
};

/** Dark palette */
export const darkColors = {
  primary: '#FF6B35',
  primaryDark: '#E55A2B',
  primaryLight: '#3D2315',

  secondary: '#2ECC71',
  secondaryDark: '#27AE60',

  background: '#1A1A2E',
  backgroundSecondary: '#232340',
  surface: '#2A2A45',

  text: '#F5F5F5',
  textSecondary: '#A0A0B8',
  textMuted: '#6B6B80',
  textInverse: '#FFFFFF',

  border: '#3A3A55',
  borderLight: '#2A2A45',

  error: '#EF4444',
  warning: '#F59E0B',
  success: '#10B981',

  rating: '#FFB800',
  overlay: 'rgba(0, 0, 0, 0.7)',

  tabBar: '#1E1E36',
  tabBarInactive: '#6B6B80',
  tabBarActive: '#FF6B35',

  splashDark: '#1A1A2E',
  dotInactive: '#3A3A55',
};

// Default export = light (backwards compatible with all existing screens)
export const colors = lightColors;
