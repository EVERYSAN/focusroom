export const colors = {
  // Base
  bg: '#0f0f0f',
  bgSecondary: '#1a1a1a',
  bgTertiary: '#242424',
  surface: '#2a2a2a',
  surfaceHover: '#333333',

  // Text
  text: '#e8e8e8',
  textSecondary: '#999999',
  textMuted: '#666666',

  // Accent
  primary: '#6c8cff',
  primaryDim: '#4a6ad4',

  // Status colors
  statusActive: '#4ade80',
  statusActiveText: '#166534',

  // Semantic
  success: '#4ade80',
  warning: '#fbbf24',
  error: '#f87171',
  info: '#60a5fa',

  // Border
  border: '#2a2a2a',
  borderLight: '#333333',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const fontSize = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
  xxl: 28,
  title: 34,
} as const;

export const borderRadius = {
  sm: 6,
  md: 10,
  lg: 16,
  full: 9999,
} as const;
