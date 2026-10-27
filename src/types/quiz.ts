export type Category = 'science-nature';

export type Difficulty = 'easy' | 'medium' | 'hard';

export interface Question {
  id: string;
  category: Category;
  difficulty?: Difficulty;
  prompt: string;
  /** Exactly four options; `correctAnswer` must be one of them. */
  options: string[];
  correctAnswer: string;
  /** Short fun fact shown after the player answers. */
  funFact?: string;
}

export interface PlayingState {
  status: 'playing';
  questions: Question[];
  index: number;
  score: number;
  selectedAnswer: string | null;
  /** The timer ran out before an answer was picked. */
  timedOut: boolean;
  /** Wrong answers removed by 50/50 on the current question. */
  hiddenAnswers: string[];
  /** 50/50 can be used once per game. */
  fiftyFiftyUsed: boolean;
}

export type QuizState =
  | { status: 'start' }
  /** `retryInSeconds` is set while waiting to retry after "too many requests". */
  | { status: 'loading'; retryInSeconds?: number }
  | { status: 'error'; message: string }
  | { status: 'empty' }
  | PlayingState
  | { status: 'finished'; questions: Question[]; score: number };

export type AnswerResult = 'correct' | 'wrong' | 'timeout';

export type AnswerStatus = 'idle' | 'correct' | 'wrong' | 'dimmed' | 'removed';
