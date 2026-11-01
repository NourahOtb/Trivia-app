/**
 * Runs the Vercel function in api/questions.ts on this computer, for testing "Your own topic"
 * without deploying. Reads OPENROUTER_API_KEY from .env.local (never committed).
 *
 *   npm run dev:api        (in one terminal)
 *   npx expo start         (in another)
 *
 * While developing, the app calls this server instead of the live website (see questionService.ts).
 */
import { createServer } from 'node:http';

import { OPTIONS, POST } from '../api/questions.ts';

const PORT = 3001;
const ROUTE = '/api/questions';

if (!process.env.OPENROUTER_API_KEY) {
  console.warn('⚠️  OPENROUTER_API_KEY is empty. Paste your key into .env.local, then restart this.');
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url ?? '/', `http://localhost:${PORT}`);
  let response;

  if (url.pathname !== ROUTE) {
    response = new Response('Not found', { status: 404 });
  } else if (req.method === 'OPTIONS') {
    response = OPTIONS();
  } else if (req.method === 'POST') {
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const request = new Request(url, {
      method: 'POST',
      headers: { 'Content-Type': req.headers['content-type'] ?? 'application/json' },
      body: Buffer.concat(chunks),
    });
    response = await POST(request);
    console.log(`${new Date().toLocaleTimeString()}  POST ${ROUTE} → ${response.status}`);
  } else {
    response = new Response('Method not allowed', { status: 405 });
  }

  res.writeHead(response.status, Object.fromEntries(response.headers));
  res.end(Buffer.from(await response.arrayBuffer()));
});

server.listen(PORT, () => {
  console.log(`AI questions server running at http://localhost:${PORT}${ROUTE}`);
});
