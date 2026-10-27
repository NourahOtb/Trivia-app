import { getCategory } from '../data/gameOptions';
import { Difficulty, GameSettings, Question } from '../types/quiz';
import { shuffle, spreadPositions } from '../utils/shuffle';
import { abortError, isAbortError, sleep } from '../utils/sleep';

const API_URL = 'https://opentdb.com/api.php';
const OPTIONS_PER_QUESTION = 4;
const REQUEST_TIMEOUT_MS = 10_000;

/** Open Trivia DB allows one request every 5 seconds per IP. */
const RATE_LIMIT_WAIT_SECONDS = 5;
const MAX_RATE_LIMIT_RETRIES = 3;

// https://opentdb.com/api_config.php
const ResponseCode = {
  Success: 0,
  NoResults: 1,
  InvalidParameter: 2,
  TokenNotFound: 3,
  TokenEmpty: 4,
  RateLimit: 5,
} as const;

interface ApiQuestion {
  type: string;
  difficulty: string;
  category: string;
  question: string;
  correct_answer: string;
  incorrect_answers: string[];
}

interface ApiResponse {
  response_code: number;
  results?: ApiQuestion[];
}

/** A friendly message is shown to the player for any of these. */
export class QuestionLoadError extends Error {}

/** The server answered but had no questions for us. */
export class NoQuestionsError extends Error {}

class RateLimitError extends Error {}

interface GetQuestionsOptions {
  signal?: AbortSignal;
  /** Called before each automatic retry after "too many requests". */
  onRetry?: (waitSeconds: number, attempt: number) => void;
}

/**
 * Fetches a fresh set of multiple-choice questions from Open Trivia DB.
 * Waits and retries on its own when the server says "too many requests".
 */
export async function getQuestions(
  settings: GameSettings,
  count: number,
  { signal, onRetry }: GetQuestionsOptions = {},
): Promise<Question[]> {
  for (let attempt = 0; ; attempt++) {
    try {
      return await requestQuestions(settings, count, signal);
    } catch (err) {
      if (!(err instanceof RateLimitError)) throw err;
      if (attempt >= MAX_RATE_LIMIT_RETRIES) {
        throw new QuestionLoadError(
          'The question server is busy right now. Please wait a moment and try again.',
        );
      }
      onRetry?.(RATE_LIMIT_WAIT_SECONDS, attempt + 1);
      await sleep(RATE_LIMIT_WAIT_SECONDS * 1000, signal);
    }
  }
}

async function requestQuestions(
  settings: GameSettings,
  count: number,
  signal?: AbortSignal,
): Promise<Question[]> {
  const params = [
    `amount=${count}`,
    `category=${getCategory(settings.categoryId).apiId}`,
    'type=multiple',
    'encode=url3986',
  ];
  if (settings.difficulty !== 'any') params.push(`difficulty=${settings.difficulty}`);
  const url = `${API_URL}?${params.join('&')}`;

  const response = await fetchWithTimeout(url, signal);

  if (response.status === 429) throw new RateLimitError();
  if (!response.ok) {
    throw new QuestionLoadError('The question server had a problem. Please try again.');
  }

  let data: ApiResponse;
  try {
    data = await response.json();
  } catch {
    throw new QuestionLoadError('The question server sent something unexpected. Please try again.');
  }

  switch (data.response_code) {
    case ResponseCode.Success:
      break;
    case ResponseCode.RateLimit:
      throw new RateLimitError();
    case ResponseCode.NoResults:
      throw new NoQuestionsError();
    default:
      throw new QuestionLoadError('Something went wrong getting questions. Please try again.');
  }

  const questions = (data.results ?? [])
    .map((item, i) => toQuestion(item, i, settings))
    .filter(isValid);
  if (questions.length === 0) throw new NoQuestionsError();

  return placeCorrectAnswers(questions);
}

async function fetchWithTimeout(url: string, signal?: AbortSignal): Promise<Response> {
  if (signal?.aborted) throw abortError();

  const controller = new AbortController();
  let timedOut = false;
  const timer = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, REQUEST_TIMEOUT_MS);
  const onAbort = () => controller.abort();
  signal?.addEventListener('abort', onAbort, { once: true });

  try {
    return await fetch(url, { signal: controller.signal });
  } catch (err) {
    if (timedOut) {
      throw new QuestionLoadError('The question server took too long to answer. Please try again.');
    }
    if (isAbortError(err) || signal?.aborted) throw abortError();
    throw new QuestionLoadError(
      "Couldn't reach the question server. Check your internet connection and try again.",
    );
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener('abort', onAbort);
  }
}

function decode(text: string): string {
  try {
    return decodeURIComponent(text).trim();
  } catch {
    return text.trim();
  }
}

function toQuestion(item: ApiQuestion, index: number, settings: GameSettings): Question {
  const correctAnswer = decode(item.correct_answer);
  const difficulty = decode(item.difficulty) as Difficulty;
  return {
    id: `${Date.now()}-${index}`,
    category: settings.categoryId,
    difficulty,
    prompt: decode(item.question),
    correctAnswer,
    options: [correctAnswer, ...item.incorrect_answers.map(decode)],
  };
}

function isValid(q: Question): boolean {
  return (
    q.prompt.length > 0 &&
    q.options.length === OPTIONS_PER_QUESTION &&
    new Set(q.options).size === OPTIONS_PER_QUESTION &&
    q.options.includes(q.correctAnswer)
  );
}

/** Shuffles each question's options so the right answer moves around between questions. */
function placeCorrectAnswers(questions: Question[]): Question[] {
  const positions = spreadPositions(questions.length, OPTIONS_PER_QUESTION);
  return questions.map((q, i) => {
    const wrong = shuffle(q.options.filter((o) => o !== q.correctAnswer));
    wrong.splice(positions[i], 0, q.correctAnswer);
    return { ...q, options: wrong };
  });
}
