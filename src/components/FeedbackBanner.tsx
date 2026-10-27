import { StyleSheet, Text, View } from 'react-native';

import { useResponsive } from '../hooks/useResponsive';
import { colors, radius, spacing } from '../theme';
import { AnswerResult } from '../types/quiz';

interface FeedbackBannerProps {
  result: AnswerResult;
  correctAnswer: string;
  funFact?: string;
}

const tones: Record<AnswerResult, { title: string; bg: string; border: string; text: string }> = {
  correct: { title: '🎉 Correct!', bg: colors.correctBg, border: colors.correct, text: colors.correct },
  wrong: { title: '❌ Wrong!', bg: colors.wrongBg, border: colors.wrong, text: colors.wrong },
  timeout: { title: "⏰ Time's up!", bg: colors.warningBg, border: colors.warning, text: colors.warning },
};

/** Shown right after a tap (or when time runs out) so everyone in the room sees the result. */
export function FeedbackBanner({ result, correctAnswer, funFact }: FeedbackBannerProps) {
  const { font } = useResponsive();
  const tone = tones[result];

  return (
    <View
      accessibilityLiveRegion="polite"
      style={[styles.banner, { backgroundColor: tone.bg, borderColor: tone.border }]}
    >
      <Text style={[styles.title, { color: tone.text, fontSize: font(20) }]}>{tone.title}</Text>
      {result !== 'correct' && (
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
