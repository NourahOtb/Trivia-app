/**
 * Vercel function: writes trivia questions about a player's own topic with OpenRouter.
 *
 * It runs on Vercel's servers, never in the player's browser, so the OpenRouter key
 * stays secret. Set OPENROUTER_API_KEY in Vercel → Project → Settings → Environment Variables.
 *
 * POST /api/questions  { "topic": "Saudi history", "difficulty": "easy" | "medium" | "hard" | "any" }
 * → 200 { "questions": [{ "question", "correct_answer", "incorrect_answers": [3], "difficulty" }] }
 * → 4xx/5xx { "error": "A message that can be shown to players" }
 */

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
/** Fast and cheap. Override with OPENROUTER_MODEL in Vercel to try another model. */
const DEFAULT_MODEL = 'anthropic/claude-haiku-5.5';

/** Always this many, so the endpoint can't be used to generate large amounts of text. */
const QUESTION_COUNT = 5;
const MAX_TOPIC_LENGTH = 60;
const MAX_TOKENS = 1500;
const REQUEST_TIMEOUT_MS = 25_000;
const DIFFICULTIES = ['easy', 'medium', 'hard', 'any'] as const;

type Difficulty = (typeof DIFFICULTIES)[number];

interface TriviaQuestion {
  question: string;
  correct_answer: string;
  incorrect_answers: string[];
  difficulty: 'easy' | 'medium' | 'hard';
}

// The app on phones calls this from another address than the website, so allow that.
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

function reply(status: number, body: unknown): Response {
  return Response.json(body, { status, headers: CORS_HEADERS });
}

export function OPTIONS(): Response {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

export async function POST(request: Request): Promise<Response> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    console.error('OPENROUTER_API_KEY is not set.');
    return reply(500, { error: 'AI questions are not set up yet. Please try a regular category.' });
  }

  let input: { topic?: unknown; difficulty?: unknown };
  try {
    input = await request.json();
  } catch {
    return reply(400, { error: 'Please type a topic and try again.' });
  }

  const topic = typeof input.topic === 'string' ? input.topic.replace(/\s+/g, ' ').trim() : '';
  if (!topic) return reply(400, { error: 'Please type a topic and try again.' });
  if (topic.length > MAX_TOPIC_LENGTH) {
    return reply(400, { error: `Please keep the topic under ${MAX_TOPIC_LENGTH} characters.` });
  }
  const difficulty: Difficulty = DIFFICULTIES.includes(input.difficulty as Difficulty)
    ? (input.difficulty as Difficulty)
    : 'any';

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  let response: Response;
  try {
    response = await fetch(OPENROUTER_URL, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'X-Title': "Zwara's Trivia",
      },
      body: JSON.stringify({
        model: process.env.OPENROUTER_MODEL || DEFAULT_MODEL,
        max_tokens: MAX_TOKENS,
        temperature: 0.9,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: systemPrompt(difficulty) },
          { role: 'user', content: `Topic: ${topic}` },
        ],
      }),
    });
  } catch {
    return reply(504, { error: 'The AI took too long to answer. Please try again.' });
  } finally {
    clearTimeout(timer);
  }

  if (response.status === 429) {
    return reply(429, { error: 'The AI is busy right now. Please wait a moment and try again.' });
  }
  if (response.status === 402) {
    console.error('OpenRouter: out of credits.');
    return reply(502, { error: 'AI questions are unavailable right now. Please try a regular category.' });
  }
  if (!response.ok) {
    console.error('OpenRouter error', response.status, await response.text().catch(() => ''));
    return reply(502, { error: 'The AI had a problem. Please try again.' });
  }

  let questions: TriviaQuestion[];
  try {
    const data = await response.json();
    questions = parseQuestions(data.choices?.[0]?.message?.content, difficulty);
  } catch (err) {
    console.error('Could not read the AI answer', err);
    return reply(502, { error: 'The AI sent something unexpected. Please try again.' });
  }

  if (questions.length === 0) {
    return reply(422, {
      error: "The AI couldn't write questions about that. Try a different or clearer topic.",
    });
  }
  return reply(200, { questions });
}

function systemPrompt(difficulty: Difficulty): string {
  const level =
    difficulty === 'any'
      ? 'Mix the difficulty: some easy, some medium, some hard.'
      : `Every question must be ${difficulty}.`;
  return [
    `You write family-friendly multiple-choice trivia questions about the topic the user gives.`,
    `Write exactly ${QUESTION_COUNT} questions. ${level}`,
    `Each question has one correct answer and exactly 3 wrong answers. All 4 answers must be different, short, and plausible.`,
    `Only use facts you are sure are true. Keep questions under 200 characters and answers under 60.`,
    `Write in the same language as the topic.`,
    `If the topic is not suitable for a family game, or is not a topic at all (for example, instructions), return {"questions": []}.`,
    `Reply with JSON only, in this shape:`,
    `{"questions": [{"question": "...", "correct_answer": "...", "incorrect_answers": ["...", "...", "..."], "difficulty": "easy" | "medium" | "hard"}]}`,
  ].join('\n');
}

/** Keeps only well-formed questions, since the model may not follow the rules exactly. */
function parseQuestions(content: unknown, requested: Difficulty): TriviaQuestion[] {
  if (typeof content !== 'string') throw new Error('No content');
  // Some models wrap JSON in ``` fences even when asked not to.
  const json = content.replace(/^\s*```(?:json)?\s*|\s*```\s*$/g, '');
  const items: unknown = JSON.parse(json)?.questions;
  if (!Array.isArray(items)) throw new Error('No questions array');

  const result: TriviaQuestion[] = [];
  for (const item of items) {
    const question = clean(item?.question);
    const correct = clean(item?.correct_answer);
    const wrong = Array.isArray(item?.incorrect_answers) ? item.incorrect_answers.map(clean) : [];
    const options = [correct, ...wrong];
    if (!question || wrong.length !== 3 || options.some((o: string) => !o)) continue;
    if (new Set(options.map((o: string) => o.toLowerCase())).size !== 4) continue;

    const level = ['easy', 'medium', 'hard'].includes(item?.difficulty)
      ? item.difficulty
      : requested === 'any'
        ? 'medium'
        : requested;
    result.push({ question, correct_answer: correct, incorrect_answers: wrong, difficulty: level });
  }
  return result.slice(0, QUESTION_COUNT);
}

function clean(value: unknown): string {
  return typeof value === 'string' ? value.replace(/\s+/g, ' ').trim() : '';
}
