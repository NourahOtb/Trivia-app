import { Platform, StyleSheet, Text, View } from 'react-native';

import { FeedbackBanner, LifelineButton, PrimaryButton, QuestionCard, TimerBar } from '../components';
import { useCountdown } from '../hooks/useCountdown';
import { ShortcutMap, useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import { isAnswered } from '../hooks/useQuiz';
import { useResponsive } from '../hooks/useResponsive';
import { colors, spacing } from '../theme';
import { AnswerResult, PlayingState } from '../types/quiz';

export const SECONDS_PER_QUESTION = 15;

const ANSWER_KEYS = [
  ['1', 'a'],
  ['2', 'b'],
  ['3', 'c'],
  ['4', 'd'],
];

interface PlayingViewProps {
  state: PlayingState;
  onAnswer: (answer: string) => void;
  onTimeUp: () => void;
  onFiftyFifty: () => void;
  onNext: () => void;
}

export function PlayingView({ state, onAnswer, onTimeUp, onFiftyFifty, onNext }: PlayingViewProps) {
  const question = state.questions[state.index];
  const answered = isAnswered(state);
  const isLast = state.index === state.questions.length - 1;

  const { secondsLeft, fraction } = useCountdown(SECONDS_PER_QUESTION, {
    resetKey: `${state.index}-${question.id}`,
    paused: answered,
    onExpire: onTimeUp,
  });

  const { font, isWide } = useResponsive();

  // Website only: answer with 1–4 or A–D, F for 50/50, Enter for the next question.
  const shortcuts: ShortcutMap = { f: onFiftyFifty };
  question.options.forEach((option, i) => {
    for (const key of ANSWER_KEYS[i] ?? []) shortcuts[key] = () => onAnswer(option);
  });
  if (answered) shortcuts.enter = onNext;
  useKeyboardShortcuts(shortcuts);

  const result: AnswerResult = state.timedOut
    ? 'timeout'
    : state.selectedAnswer === question.correctAnswer
      ? 'correct'
      : 'wrong';

  return (
    <View style={styles.container}>
      <View style={styles.toolbar}>
        <TimerBar secondsLeft={secondsLeft} fraction={fraction} />
        <LifelineButton
          label="50/50"
          accessibilityLabel="Use 50/50: removes two wrong answers. Once per game."
          used={state.fiftyFiftyUsed}
          disabled={answered}
          onPress={onFiftyFifty}
        />
      </View>

      {Platform.OS === 'web' && isWide && (
        <Text style={[styles.hint, { fontSize: font(12) }]}>
          Keyboard: 1–4 or A–D to answer · F for 50/50 · Enter for next
        </Text>
      )}

      <QuestionCard
        question={question}
        selectedAnswer={state.selectedAnswer}
        revealed={answered}
        hiddenAnswers={state.hiddenAnswers}
        onAnswer={onAnswer}
      />

      {answered && (
        <>
          <FeedbackBanner
            result={result}
            correctAnswer={question.correctAnswer}
            funFact={question.funFact}
          />
          <PrimaryButton title={isLast ? 'See final score' : 'Next question'} onPress={onNext} />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
  },
  hint: {
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: -spacing.sm,
  },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
});
