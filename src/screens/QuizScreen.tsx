import { useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  OptionPicker,
  PrimaryButton,
  ResultView,
  ScoreBar,
  StartView,
  StatusView,
} from '../components';
import {
  CATEGORIES,
  DEFAULT_CATEGORY,
  DEFAULT_DIFFICULTY,
  DIFFICULTIES,
  getCategory,
  getDifficultyLabel,
} from '../data/gameOptions';
import { useQuiz } from '../hooks/useQuiz';
import { useResponsive } from '../hooks/useResponsive';
import { colors, MAX_CONTENT_WIDTH, spacing } from '../theme';
import { GameSettings } from '../types/quiz';
import { PlayingView, SECONDS_PER_QUESTION } from './PlayingView';

const APP_NAME = "Zwara's Trivia";
const QUESTION_COUNT = 5;

const RULES = [
  { icon: '❓', text: `${QUESTION_COUNT} questions per game` },
  { icon: '⏳', text: `${SECONDS_PER_QUESTION} seconds for each question` },
  { icon: '✂️', text: '50/50 once per game: removes two wrong answers' },
];

export function QuizScreen() {
  const { state, settings, answer, timeUp, fiftyFifty, next, start, restart, goToStart } =
    useQuiz({ questionCount: QUESTION_COUNT });
  const { font } = useResponsive();

  // Kept here (not in StartView) so the choice is remembered when players come back.
  const [choice, setChoice] = useState<GameSettings>({
    categoryId: DEFAULT_CATEGORY,
    difficulty: DEFAULT_DIFFICULTY,
  });

  if (state.status === 'start') {
    return (
      <StartView
        title={APP_NAME}
        subtitle="Family trivia for every gathering"
        rules={RULES}
        onStart={() => start(choice)}
      >
        <OptionPicker
          title="Category"
          options={CATEGORIES}
          selectedId={choice.categoryId}
          onSelect={(categoryId) => setChoice((c) => ({ ...c, categoryId }))}
        />
        <OptionPicker
          title="Difficulty"
          options={DIFFICULTIES}
          wideColumns={4}
          selectedId={choice.difficulty}
          onSelect={(difficulty) => setChoice((c) => ({ ...c, difficulty }))}
        />
      </StartView>
    );
  }

  const category = getCategory(settings?.categoryId ?? choice.categoryId);
  const difficultyLabel = getDifficultyLabel(settings?.difficulty ?? choice.difficulty);

  const renderBody = () => {
    switch (state.status) {
      case 'loading':
        return (
          <StatusView
            icon={<ActivityIndicator size="large" color={colors.primary} />}
            title={state.retryInSeconds ? 'The server is busy' : 'Getting questions ready…'}
            message={
              state.retryInSeconds
                ? `Lots of people are playing! Trying again in ${state.retryInSeconds} seconds…`
                : `Fetching fresh ${category.label} questions.`
            }
          />
        );

      case 'error':
        return (
          <StatusView icon="⚠️" title="Couldn't load the questions" message={state.message}>
            <PrimaryButton title="Try again" onPress={restart} />
            <View style={styles.gap} />
            <PrimaryButton title="Back to start" variant="secondary" onPress={goToStart} />
          </StatusView>
        );

      case 'empty':
        return (
          <StatusView
            icon="📭"
            title="No questions right now"
            message={`The server didn't send any ${category.label} questions at ${difficultyLabel} level. Try again, or pick a different category or difficulty.`}
          >
            <PrimaryButton title="Try again" onPress={restart} />
            <View style={styles.gap} />
            <PrimaryButton title="Change category" variant="secondary" onPress={goToStart} />
          </StatusView>
        );

      case 'finished':
        return (
          <ResultView
            score={state.score}
            total={state.questions.length}
            onPlayAgain={restart}
            onChangeSettings={goToStart}
          />
        );

      case 'playing':
        return (
          <PlayingView
            state={state}
            onAnswer={answer}
            onTimeUp={timeUp}
            onFiftyFifty={fiftyFifty}
            onNext={next}
          />
        );
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom', 'left', 'right']}>
      <View style={styles.column}>
        <View style={styles.header}>
          <Text style={[styles.title, { fontSize: font(26) }]}>🔮 {APP_NAME}</Text>
          <Text style={[styles.subtitle, { fontSize: font(14) }]}>
            {category.icon} {category.label} · {difficultyLabel}
          </Text>
        </View>

        {/* Kept outside the scroll view so the score is always visible. */}
        {state.status === 'playing' && (
          <ScoreBar score={state.score} current={state.index + 1} total={state.questions.length} />
        )}

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {renderBody()}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  column: {
    flex: 1,
    width: '100%',
    maxWidth: MAX_CONTENT_WIDTH,
    alignSelf: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    gap: spacing.md,
  },
  header: {
    alignItems: 'center',
  },
  title: {
    color: colors.primary,
    fontWeight: '900',
  },
  subtitle: {
    color: colors.textMuted,
    fontWeight: '600',
    marginTop: 2,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: spacing.lg,
  },
  gap: {
    height: spacing.sm + 4,
  },
});
