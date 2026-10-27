import { StyleSheet, Text, View } from 'react-native';

import { useResponsive } from '../hooks/useResponsive';
import { colors, radius, spacing } from '../theme';
import { AnswerStatus, Question } from '../types/quiz';
import { AnswerButton } from './AnswerButton';

interface QuestionCardProps {
  question: Question;
  selectedAnswer: string | null;
  onAnswer: (answer: string) => void;
}

const MARKERS = ['A', 'B', 'C', 'D'];

function getStatus(option: string, question: Question, selected: string | null): AnswerStatus {
  if (selected === null) return 'idle';
  if (option === question.correctAnswer) return 'correct';
  if (option === selected) return 'wrong';
  return 'dimmed';
}

export function QuestionCard({ question, selectedAnswer, onAnswer }: QuestionCardProps) {
  const { font, isWide } = useResponsive();
  const answered = selectedAnswer !== null;

  return (
    <View style={styles.card}>
      <Text style={[styles.prompt, { fontSize: font(21), lineHeight: font(29) }]}>
        {question.prompt}
      </Text>

      <View style={[styles.options, isWide && styles.optionsGrid]}>
        {question.options.map((option, i) => (
          <View key={option} style={isWide ? styles.gridItem : undefined}>
            <AnswerButton
              label={option}
              marker={MARKERS[i]}
              status={getStatus(option, question, selectedAnswer)}
              disabled={answered}
              onPress={onAnswer}
            />
          </View>
        ))}
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
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
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
