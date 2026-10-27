# Zwara's Trivia — Science & Nature

A one-screen trivia game for family gatherings in Kuwait, built with React Native and Expo.
Each round fetches 5 fresh Science & Nature questions from [Open Trivia DB](https://opentdb.com), shows right/wrong
after every tap, keeps the score visible, and ends with a final score and a **Play again** button.
It opens on a purple start screen, gives 15 seconds per question (running out counts as wrong and moves on),
and offers one 50/50 per game that removes two wrong answers.

## Run it on your phone (Expo Go)

Requires **Node 22.13+** (Expo SDK 58). With nvm: `nvm use 22`.

```bash
npm install
npx expo start
```

Scan the QR code with the Expo Go app (Android) or the Camera app (iOS).
Your phone and computer must be on the same Wi‑Fi.

## Project structure

```
App.tsx                      Root: safe-area provider + error boundary
src/
  screens/QuizScreen.tsx     The game screen (start / loading / error / empty / playing / finished)
  screens/PlayingView.tsx    One question: timer, 50/50, answers, feedback
  components/                Reusable UI: StartView, QuestionCard, AnswerButton, ScoreBar, TimerBar,
                             LifelineButton, FeedbackBanner, PrimaryButton, StatusView, ResultView,
                             ErrorBoundary
  hooks/useQuiz.ts           Game state machine (loading / error / empty / playing / finished)
  hooks/useCountdown.ts      Accurate per-question countdown
  hooks/useResponsive.ts     Screen-size helpers (font scaling, wide layouts)
  services/questionService.ts  Open Trivia DB client: timeout, auto-retry on "too many requests",
                             decoding, validation, and spreading the right answer across A–D
  theme/                     Colours, spacing, radii
  types/quiz.ts              Shared TypeScript types
```

## How questions are loaded

- `getQuestions` calls `https://opentdb.com/api.php?amount=5&category=17&type=multiple&encode=url3986`.
- Open Trivia DB allows one request every 5 seconds. On "too many requests" the app shows
  "The server is busy", waits 5 seconds and retries by itself (up to 3 times) before showing an error.
- No internet, a slow server (10 s timeout) or a bad response shows a friendly error with **Try again**.
- If the server returns no questions, an empty screen with **Try again** is shown.
- **New category:** add it to `Category` in `src/types/quiz.ts` and map it to its Open Trivia DB id in
  `categoryIds` in `src/services/questionService.ts`
  ([category list](https://opentdb.com/api_category.php)).
