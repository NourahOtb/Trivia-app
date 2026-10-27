// Palette inspired by Kuwait's flag (green, white, red, black) with warm desert neutrals.
export const colors = {
  background: '#F6F1E7',
  surface: '#FFFFFF',
  primary: '#007A3D',
  primaryDark: '#005C2E',
  onPrimary: '#FFFFFF',
  text: '#1A1A1A',
  textMuted: '#5C5A55',
  border: '#E2DBCB',
  correct: '#1E8E3E',
  correctBg: '#E3F5E8',
  wrong: '#CE1126',
  wrongBg: '#FCE4E7',
  dimmed: '#B5B0A6',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

export const radius = {
  sm: 8,
  md: 14,
  lg: 20,
  pill: 999,
} as const;

/** Widest the content column grows on tablets and web. */
export const MAX_CONTENT_WIDTH = 640;
