import { StyleSheet, Text, View } from 'react-native';

import { useResponsive } from '../hooks/useResponsive';
import { colors, radius, spacing } from '../theme';
import { AnswerStatus, Question } from '../types/quiz';
import { AnswerButton } from './AnswerButton';

interface QuestionCardProps {
  question: Question;
  selectedAnswer: string | null;
  /** True once the question is over (answered or timed out). */
  revealed: boolean;
  /** Options taken away by 50/50. */
  hiddenAnswers: string[];
  onAnswer: (answer: string) => void;
}

const MARKERS = ['A', 'B', 'C', 'D'];

function getStatus(
  option: string,
  question: Question,
  selected: string | null,
  revealed: boolean,
  hidden: string[],
): AnswerStatus {
  if (hidden.includes(option)) return 'removed';
  if (!revealed) return 'idle';
  if (option === question.correctAnswer) return 'correct';
  if (option === selected) return 'wrong';
  return 'dimmed';
}

export function QuestionCard({
  question,
  selectedAnswer,
  revealed,
  hiddenAnswers,
  onAnswer,
}: QuestionCardProps) {
  const { font, isWide } = useResponsive();

  return (
    <View style={styles.card}>
      <Text style={[styles.prompt, { fontSize: font(21), lineHeight: font(29) }]}>
        {question.prompt}
      </Text>

      <View style={[styles.options, isWide && styles.optionsGrid]}>
        {question.options.map((option, i) => {
          const status = getStatus(option, question, selectedAnswer, revealed, hiddenAnswers);
          return (
            <View key={option} style={isWide ? styles.gridItem : undefined}>
              <AnswerButton
                label={option}
                marker={MARKERS[i]}
                status={status}
                disabled={revealed || status === 'removed'}
                onPress={onAnswer}
              />
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.lg,
    shadowColor: colors.primaryDark,
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  prompt: {
    color: colors.text,
    fontWeight: '700',
  },
  options: {
    gap: spacing.sm + 4,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  gridItem: {
    flexBasis: '48%',
    flexGrow: 1,
  },
});
