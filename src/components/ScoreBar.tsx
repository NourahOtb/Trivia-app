import { StyleSheet, Text, View } from 'react-native';

import { useResponsive } from '../hooks/useResponsive';
import { colors, radius, spacing } from '../theme';

interface ScoreBarProps {
  score: number;
  current: number;
  total: number;
}

/** Always-visible header: question progress and the running score. */
export function ScoreBar({ score, current, total }: ScoreBarProps) {
  const { font } = useResponsive();
  const progress = total > 0 ? current / total : 0;

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Text style={[styles.progressText, { fontSize: font(15) }]}>
          Question {current} of {total}
        </Text>
        <View
          style={styles.scorePill}
          accessible
          accessibilityLabel={`Score ${score} out of ${total}`}
        >
          <Text style={[styles.scoreText, { fontSize: font(15) }]}>
            ⭐ Score: {score}/{total}
          </Text>
        </View>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${progress * 100}%` }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  progressText: {
    color: colors.textMuted,
    fontWeight: '600',
  },
  scorePill: {
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    paddingVertical: spacing.xs + 2,
    paddingHorizontal: spacing.md,
  },
  scoreText: {
    color: colors.onPrimary,
    fontWeight: '700',
  },
  track: {
    height: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.border,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: colors.accent,
    borderRadius: radius.pill,
  },
});
