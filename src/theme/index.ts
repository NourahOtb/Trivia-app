// Purple theme. Green/red stay for right/wrong so results are unmistakable.
export const colors = {
  background: '#F5F0FF',
  surface: '#FFFFFF',
  primary: '#6D28D9',
  primaryDark: '#4C1D95',
  primaryLight: '#EDE4FF',
  onPrimary: '#FFFFFF',
  accent: '#FBBF24',
  text: '#1F1433',
  textMuted: '#6B6080',
  border: '#E3D8F5',
  correct: '#15803D',
  correctBg: '#DCFCE7',
  wrong: '#DC2626',
  wrongBg: '#FEE2E2',
  warning: '#EA580C',
  warningBg: '#FFEDD5',
  dimmed: '#B9AFCB',
} as const;

/** Start screen background, top to bottom. */
export const gradients = {
  hero: ['#3B0764', '#6D28D9', '#9333EA'] as const,
};

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
