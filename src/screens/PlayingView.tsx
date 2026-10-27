import { StyleSheet, View } from 'react-native';

import { FeedbackBanner, LifelineButton, PrimaryButton, QuestionCard, TimerBar } from '../components';
import { useCountdown } from '../hooks/useCountdown';
import { isAnswered } from '../hooks/useQuiz';
import { spacing } from '../theme';
import { AnswerResult, PlayingState } from '../types/quiz';

export const SECONDS_PER_QUESTION = 15;

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
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
});
