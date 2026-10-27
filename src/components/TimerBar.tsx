import { StyleSheet, Text, View } from 'react-native';

import { useResponsive } from '../hooks/useResponsive';
import { colors, radius, spacing } from '../theme';

interface TimerBarProps {
  secondsLeft: number;
  /** 1 = full time left, 0 = time's up. */
  fraction: number;
  /** At or below this many seconds the timer turns orange. */
  warnAt?: number;
}

export function TimerBar({ secondsLeft, fraction, warnAt = 5 }: TimerBarProps) {
  const { font } = useResponsive();
  const urgent = secondsLeft <= warnAt;
  const tint = urgent ? colors.warning : colors.primary;

  return (
    <View
      style={styles.container}
      accessible
      accessibilityRole="timer"
      accessibilityLabel={`${secondsLeft} seconds left`}
    >
      <Text style={[styles.time, { color: tint, fontSize: font(16) }]}>⏱ {secondsLeft}s</Text>
      <View style={[styles.track, urgent && { backgroundColor: colors.warningBg }]}>
        <View style={[styles.fill, { width: `${fraction * 100}%`, backgroundColor: tint }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  time: {
    fontWeight: '800',
    minWidth: 52,
    fontVariant: ['tabular-nums'],
  },
  track: {
    flex: 1,
    height: 10,
    borderRadius: radius.pill,
    backgroundColor: colors.primaryLight,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: radius.pill,
  },
});
