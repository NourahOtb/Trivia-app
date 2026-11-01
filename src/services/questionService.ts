import Constants from 'expo-constants';
import { Platform } from 'react-native';

import { getApiId } from '../data/gameOptions';
import { Difficulty, GameSettings, Question } from '../types/quiz';
import { shuffle, spreadPositions } from '../utils/shuffle';
import { abortError, isAbortError, sleep } from '../utils/sleep';

const API_URL = 'https://opentdb.com/api.php';
/**
 * Our Vercel function that asks OpenRouter for questions about the players' own topic.
 * Full address (not "/api/questions") so the phone app can reach it too.
 */
const LIVE_AI_API_URL = 'https://trivia-website-eta.vercel.app/api/questions';
/** Port of `npm run dev:api` (scripts/dev-api.mts). */
const DEV_AI_API_PORT = 3001;
const OPTIONS_PER_QUESTION = 4;
const REQUEST_TIMEOUT_MS = 10_000;
/** Writing questions takes the AI longer than looking them up. */
const AI_REQUEST_TIMEOUT_MS = 30_000;

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

/** See api/questions.ts. Answers are plain text, not URL-encoded. */
interface AiResponse {
  questions?: ApiQuestion[];
  error?: string;
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
 * Fetches a fresh set of multiple-choice questions: from Open Trivia DB, or written by AI
 * when the players chose "Your own topic".
 * Waits and retries on its own when Open Trivia DB says "too many requests".
 */
export async function getQuestions(
  settings: GameSettings,
  count: number,
  { signal, onRetry }: GetQuestionsOptions = {},
): Promise<Question[]> {
  const apiId = getApiId(settings.categoryId);
  if (apiId === null) return requestAiQuestions(settings, count, signal);

  for (let attempt = 0; ; attempt++) {
    try {
      return await requestQuestions(settings, apiId, count, signal);
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
  apiId: number,
  count: number,
  signal?: AbortSignal,
): Promise<Question[]> {
  const params = [
    `amount=${count}`,
    `category=${apiId}`,
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
    .map((item, i) => toQuestion(item, i, settings, decode))
    .filter(isValid);
  if (questions.length === 0) throw new NoQuestionsError();

  return placeCorrectAnswers(questions);
}

/**
 * While developing (`npx expo start`), use `npm run dev:api` on this computer, which reads the key
 * from .env.local. Built apps and the website always use the live Vercel function.
 */
function getAiApiUrl(): string {
  if (!__DEV__) return LIVE_AI_API_URL;
  // On a phone, "localhost" is the phone itself, so use the computer's address that Expo connected to.
  const host =
    Platform.OS === 'web'
      ? window.location.hostname
      : Constants.expoConfig?.hostUri?.split(':')[0];
  return host ? `http://${host}:${DEV_AI_API_PORT}/api/questions` : LIVE_AI_API_URL;
}

async function requestAiQuestions(
  settings: GameSettings,
  count: number,
  signal?: AbortSignal,
): Promise<Question[]> {
  let response: Response;
  try {
    response = await fetchWithTimeout(
      getAiApiUrl(),
      signal,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: settings.customTopic, difficulty: settings.difficulty }),
      },
      AI_REQUEST_TIMEOUT_MS,
    );
  } catch (err) {
    if (__DEV__ && err instanceof QuestionLoadError) {
      throw new QuestionLoadError(
        `${err.message}\n\nDeveloping? Start the AI server with "npm run dev:api" in another terminal.`,
      );
    }
    throw err;
  }

  let data: AiResponse;
  try {
    data = await response.json();
  } catch {
    throw new QuestionLoadError('The AI sent something unexpected. Please try again.');
  }
  if (!response.ok) {
    // The function's error messages are written for players.
    throw new QuestionLoadError(data.error ?? 'The AI had a problem. Please try again.');
  }

  const questions = (data.questions ?? [])
    .slice(0, count)
    .map((item, i) => toQuestion(item, i, settings, (text) => text.trim()))
    .filter(isValid);
  if (questions.length === 0) throw new NoQuestionsError();

  return placeCorrectAnswers(questions);
}

async function fetchWithTimeout(
  url: string,
  signal?: AbortSignal,
  init: RequestInit = {},
  timeoutMs = REQUEST_TIMEOUT_MS,
): Promise<Response> {
  if (signal?.aborted) throw abortError();

  const controller = new AbortController();
  let timedOut = false;
  const timer = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, timeoutMs);
  const onAbort = () => controller.abort();
  signal?.addEventListener('abort', onAbort, { once: true });

  try {
    return await fetch(url, { ...init, signal: controller.signal });
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

function toQuestion(
  item: ApiQuestion,
  index: number,
  settings: GameSettings,
  readText: (text: string) => string,
): Question {
  const correctAnswer = readText(item.correct_answer);
  const difficulty = readText(item.difficulty) as Difficulty;
  return {
    id: `${Date.now()}-${index}`,
    category: settings.categoryId,
    difficulty,
    prompt: readText(item.question),
    correctAnswer,
    options: [correctAnswer, ...item.incorrect_answers.map(readText)],
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
