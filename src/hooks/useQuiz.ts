import { useCallback, useEffect, useReducer, useState } from 'react';

import { getQuestions, NoQuestionsError, QuestionLoadError } from '../services/questionService';
import { GameSettings, PlayingState, Question, QuizState } from '../types/quiz';
import { shuffle } from '../utils/shuffle';
import { isAbortError } from '../utils/sleep';

/** How long the right answer stays on screen after time runs out. */
const TIMEOUT_ADVANCE_MS = 2500;

type Action =
  | { type: 'GO_TO_START' }
  | { type: 'LOAD_START' }
  | { type: 'LOAD_RETRY'; waitSeconds: number }
  | { type: 'LOAD_SUCCESS'; questions: Question[] }
  | { type: 'LOAD_FAILURE'; message: string }
  | { type: 'LOAD_EMPTY' }
  | { type: 'ANSWER'; answer: string }
  | { type: 'TIME_UP' }
  | { type: 'FIFTY_FIFTY' }
  | { type: 'NEXT' };

export function isAnswered(state: PlayingState): boolean {
  return state.selectedAnswer !== null || state.timedOut;
}

function reducer(state: QuizState, action: Action): QuizState {
  switch (action.type) {
    case 'GO_TO_START':
      return { status: 'start' };
    case 'LOAD_START':
      return { status: 'loading' };
    case 'LOAD_RETRY':
      return { status: 'loading', retryInSeconds: action.waitSeconds };
    case 'LOAD_EMPTY':
      return { status: 'empty' };
    case 'LOAD_SUCCESS':
      return {
        status: 'playing',
        questions: action.questions,
        index: 0,
        score: 0,
        selectedAnswer: null,
        timedOut: false,
        hiddenAnswers: [],
        fiftyFiftyUsed: false,
      };
    case 'LOAD_FAILURE':
      return { status: 'error', message: action.message };
    case 'ANSWER': {
      // Ignore taps after an answer is locked in, or on a removed answer.
      if (state.status !== 'playing' || isAnswered(state)) return state;
      if (state.hiddenAnswers.includes(action.answer)) return state;
      const isCorrect = action.answer === state.questions[state.index].correctAnswer;
      return {
        ...state,
        selectedAnswer: action.answer,
        score: isCorrect ? state.score + 1 : state.score,
      };
    }
    case 'TIME_UP':
      if (state.status !== 'playing' || isAnswered(state)) return state;
      return { ...state, timedOut: true };
    case 'FIFTY_FIFTY': {
      if (state.status !== 'playing' || isAnswered(state) || state.fiftyFiftyUsed) return state;
      const { options, correctAnswer } = state.questions[state.index];
      const wrong = options.filter((o) => o !== correctAnswer);
      return {
        ...state,
        hiddenAnswers: shuffle(wrong).slice(0, 2),
        fiftyFiftyUsed: true,
      };
    }
    case 'NEXT': {
      if (state.status !== 'playing' || !isAnswered(state)) return state;
      const nextIndex = state.index + 1;
      if (nextIndex >= state.questions.length) {
        return { status: 'finished', questions: state.questions, score: state.score };
      }
      return { ...state, index: nextIndex, selectedAnswer: null, timedOut: false, hiddenAnswers: [] };
    }
    default:
      return state;
  }
}

interface UseQuizOptions {
  questionCount: number;
}

interface Game {
  /** Bumped on every Start / Play again / Try again so the same settings reload. */
  id: number;
  settings: GameSettings;
}

export function useQuiz({ questionCount }: UseQuizOptions) {
  const [state, dispatch] = useReducer(reducer, { status: 'start' });
  // null = still on the start screen.
  const [game, setGame] = useState<Game | null>(null);

  useEffect(() => {
    if (!game) return;

    const controller = new AbortController();
    dispatch({ type: 'LOAD_START' });

    getQuestions(game.settings, questionCount, {
      signal: controller.signal,
      onRetry: (waitSeconds) => dispatch({ type: 'LOAD_RETRY', waitSeconds }),
    })
      .then((questions) => {
        if (!controller.signal.aborted) dispatch({ type: 'LOAD_SUCCESS', questions });
      })
      .catch((err: unknown) => {
        if (isAbortError(err) || controller.signal.aborted) return;
        if (err instanceof NoQuestionsError) {
          dispatch({ type: 'LOAD_EMPTY' });
          return;
        }
        const message =
          err instanceof QuestionLoadError
            ? err.message
            : 'Something went wrong getting questions. Please try again.';
        dispatch({ type: 'LOAD_FAILURE', message });
      });

    // Cancels the request (and any retry wait) if the game restarts or the screen closes.
    return () => controller.abort();
  }, [game, questionCount]);

  // After time runs out, show the right answer briefly, then move on by itself.
  const timedOutIndex = state.status === 'playing' && state.timedOut ? state.index : null;
  useEffect(() => {
    if (timedOutIndex === null) return;
    const timer = setTimeout(() => dispatch({ type: 'NEXT' }), TIMEOUT_ADVANCE_MS);
    return () => clearTimeout(timer);
  }, [timedOutIndex]);

  const answer = useCallback((value: string) => dispatch({ type: 'ANSWER', answer: value }), []);
  const timeUp = useCallback(() => dispatch({ type: 'TIME_UP' }), []);
  const fiftyFifty = useCallback(() => dispatch({ type: 'FIFTY_FIFTY' }), []);
  const next = useCallback(() => dispatch({ type: 'NEXT' }), []);
  /** Starts a game with new settings (from the start screen). */
  const start = useCallback(
    (settings: GameSettings) => setGame((g) => ({ id: (g?.id ?? 0) + 1, settings })),
    [],
  );
  /** Starts another game with the same settings (Play again / Try again). */
  const restart = useCallback(() => setGame((g) => (g ? { ...g, id: g.id + 1 } : g)), []);
  const goToStart = useCallback(() => {
    setGame(null);
    dispatch({ type: 'GO_TO_START' });
  }, []);

  return {
    state,
    settings: game?.settings ?? null,
    answer,
    timeUp,
    fiftyFifty,
    next,
    start,
    restart,
    goToStart,
  };
}
