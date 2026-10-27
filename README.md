# Zwara's Trivia

A one-screen trivia game for family gatherings in Kuwait, built with React Native and Expo.
Players pick a category (12 to choose from) and a difficulty on the start screen, then each round fetches
5 fresh questions from [Open Trivia DB](https://opentdb.com), shows right/wrong
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

## Website version

The same code runs as a website (desktop and phone browsers).

```bash
npx expo start --web      # try it locally
npm run build:web         # build the static site into dist/
npm run deploy            # build and push the site to the Trivia-website repository
```

- The built site is kept in its own repository, [NourahOtb/Trivia-website](https://github.com/NourahOtb/Trivia-website)
  (branch `main`). Only the finished files live there; edit the code here and run `npm run deploy`.
- Live address (Vercel): https://trivia-website-eta.vercel.app/
  Vercel watches the Trivia-website repository and republishes automatically after each `npm run deploy`.
- The site is built to run from the root of its address (no `experiments.baseUrl`). To host it under a
  sub-path instead (e.g. GitHub Pages at `/Trivia-website`), set `experiments.baseUrl` in `app.json`.
- On a computer you can play with the keyboard: **1–4** or **A–D** to answer, **F** for 50/50,
  **Enter** to start and to go to the next question.

## Project structure

```
App.tsx                      Root: safe-area provider + error boundary
src/
  screens/QuizScreen.tsx     The game screen (start / loading / error / empty / playing / finished)
  screens/PlayingView.tsx    One question: timer, 50/50, answers, feedback
  data/gameOptions.ts        Categories and difficulties offered on the start screen
  components/                Reusable UI: StartView, OptionPicker, QuestionCard, AnswerButton, ScoreBar, TimerBar,
                             LifelineButton, FeedbackBanner, PrimaryButton, StatusView, ResultView,
                             ErrorBoundary
  hooks/useQuiz.ts           Game state machine (loading / error / empty / playing / finished)
  hooks/useCountdown.ts      Accurate per-question countdown
  hooks/useKeyboardShortcuts.ts  Keyboard controls (website only)
  hooks/useResponsive.ts     Screen-size helpers (font scaling, wide layouts)
  services/questionService.ts  Open Trivia DB client: timeout, auto-retry on "too many requests",
                             decoding, validation, and spreading the right answer across A–D
  theme/                     Colours, spacing, radii
  types/quiz.ts              Shared TypeScript types
```

## How questions are loaded

- `getQuestions` calls `https://opentdb.com/api.php?amount=5&category=<id>&type=multiple&encode=url3986`,
  adding `&difficulty=easy|medium|hard` unless "Mixed" is chosen.
- Open Trivia DB allows one request every 5 seconds. On "too many requests" the app shows
  "The server is busy", waits 5 seconds and retries by itself (up to 3 times) before showing an error.
- No internet, a slow server (10 s timeout) or a bad response shows a friendly error with **Try again**.
- If the server returns no questions, an empty screen with **Try again** is shown.
- **New category:** add one row to `CATEGORIES` in `src/data/gameOptions.ts` with its Open Trivia DB id
  ([category list](https://opentdb.com/api_category.php)). It shows up in the picker automatically.
