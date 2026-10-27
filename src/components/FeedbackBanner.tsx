import { StyleSheet, Text, View } from 'react-native';

import { useResponsive } from '../hooks/useResponsive';
import { colors, radius, spacing } from '../theme';

interface FeedbackBannerProps {
  isCorrect: boolean;
  correctAnswer: string;
  funFact?: string;
}

/** Shown right after a tap so everyone in the room sees the result. */
export function FeedbackBanner({ isCorrect, correctAnswer, funFact }: FeedbackBannerProps) {
  const { font } = useResponsive();
  const tone = isCorrect
    ? { bg: colors.correctBg, border: colors.correct, text: colors.correct }
    : { bg: colors.wrongBg, border: colors.wrong, text: colors.wrong };

  return (
    <View
      accessibilityLiveRegion="polite"
      style={[styles.banner, { backgroundColor: tone.bg, borderColor: tone.border }]}
    >
      <Text style={[styles.title, { color: tone.text, fontSize: font(20) }]}>
        {isCorrect ? '🎉 Correct!' : '❌ Wrong!'}
      </Text>
      {!isCorrect && (
        <Text style={[styles.body, { fontSize: font(15) }]}>
          The right answer is <Text style={styles.bold}>{correctAnswer}</Text>.
        </Text>
      )}
      {funFact ? (
        <Text style={[styles.body, { fontSize: font(15) }]}>💡 {funFact}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    borderWidth: 2,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.xs + 2,
  },
  title: {
    fontWeight: '800',
  },
  body: {
    color: colors.text,
    lineHeight: 21,
  },
  bold: {
    fontWeight: '700',
  },
});
