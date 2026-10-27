import { useWindowDimensions } from 'react-native';

import { MAX_CONTENT_WIDTH } from '../theme';

const BASE_WIDTH = 375; // a typical phone

/**
 * Screen-size helpers so every component scales the same way.
 * `font(n)` grows text gently on larger screens without getting huge.
 */
export function useResponsive() {
  const { width, height } = useWindowDimensions();
  const contentWidth = Math.min(width, MAX_CONTENT_WIDTH);
  const scale = Math.min(Math.max(contentWidth / BASE_WIDTH, 0.85), 1.3);

  return {
    width,
    height,
    contentWidth,
    isWide: width >= 600,
    isLandscape: width > height,
    font: (size: number) => Math.round(size * scale),
  };
}
