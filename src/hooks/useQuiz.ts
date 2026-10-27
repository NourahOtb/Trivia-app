import { useCallback, useEffect, useReducer, useState } from 'react';

import { getQuestions } from '../services/questionService';
import { Category, Question, QuizState } from '../types/quiz';

type Action =
  | { type: 'LOAD_START' }
  | { type: 'LOAD_SUCCESS'; questions: Question[] }
  | { type: 'LOAD_FAILURE'; message: string }
  | { type: 'ANSWER'; answer: string }
  | { type: 'NEXT' };

function reducer(state: QuizState, action: Action): QuizState {
  switch (action.type) {
    case 'LOAD_START':
      return { status: 'loading' };
    case 'LOAD_SUCCESS':
      return {
        status: 'playing',
        questions: action.questions,
        index: 0,
        score: 0,
        selectedAnswer: null,
      };
    case 'LOAD_FAILURE':
      return { status: 'error', message: action.message };
    case 'ANSWER': {
      // Ignore taps after an answer is locked in.
      if (state.status !== 'playing' || state.selectedAnswer !== null) return state;
      const isCorrect = action.answer === state.questions[state.index].correctAnswer;
      return {
        ...state,
        selectedAnswer: action.answer,
        score: isCorrect ? state.score + 1 : state.score,
      };
    }
    case 'NEXT': {
      if (state.status !== 'playing' || state.selectedAnswer === null) return state;
      const nextIndex = state.index + 1;
      if (nextIndex >= state.questions.length) {
        return { status: 'finished', questions: state.questions, score: state.score };
      }
      return { ...state, index: nextIndex, selectedAnswer: null };
    }
    default:
      return state;
  }
}

interface UseQuizOptions {
  category: Category;
  questionCount: number;
}

export function useQuiz({ category, questionCount }: UseQuizOptions) {
  const [state, dispatch] = useReducer(reducer, { status: 'loading' });
  // Bumping this re-runs the loading effect (used by Play again / Try again).
  const [gameId, setGameId] = useState(0);

  useEffect(() => {
    let cancelled = false;
    dispatch({ type: 'LOAD_START' });

    getQuestions(category, questionCount)
      .then((questions) => {
        if (!cancelled) dispatch({ type: 'LOAD_SUCCESS', questions });
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const message = err instanceof Error ? err.message : 'Something went wrong.';
        dispatch({ type: 'LOAD_FAILURE', message });
      });

    return () => {
      cancelled = true;
    };
  }, [category, questionCount, gameId]);

  const answer = useCallback((value: string) => dispatch({ type: 'ANSWER', answer: value }), []);
  const next = useCallback(() => dispatch({ type: 'NEXT' }), []);
  const restart = useCallback(() => setGameId((id) => id + 1), []);

  return { state, answer, next, restart };
}
