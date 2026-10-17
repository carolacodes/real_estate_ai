import { test, mock } from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import express from 'express';
import cors from 'cors';
import app from '../app.js';
import { corsOptions } from '../config/cors.js';
import { supabase } from '../libs/supabase.js';
import { aiModel } from '../libs/ai.js';

async function serve(t, application) {
  const server = application.listen(0, '127.0.0.1');
  await once(server, 'listening');
  t.after(() => new Promise(resolve => { server.close(resolve); server.closeAllConnections(); }));
  return `http://127.0.0.1:${server.address().port}`;
}

test('health returns 200 without calling Supabase or Gemini', async t => {
  const database = mock.method(supabase, 'from', () => { throw new Error('Unexpected database call'); });
  const generate = mock.method(aiModel, 'doGenerate', () => { throw new Error('Unexpected Gemini call'); });
  const stream = mock.method(aiModel, 'doStream', () => { throw new Error('Unexpected Gemini call'); });
  t.after(() => { database.mock.restore(); generate.mock.restore(); stream.mock.restore(); });
  const url = await serve(t, app);
  const response = await fetch(`${url}/api/health`);
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { success: true, status: 'ok' });
  for (const method of [database, generate, stream]) assert.equal(method.mock.callCount(), 0);
});

test('production CORS permits only the configured origin, including SSE preflight and response', async t => {
  const application = express();
  application.use(cors(corsOptions({ NODE_ENV: 'production', FRONTEND_URL: 'https://frontend.example.test' })));
  application.post('/api/chat/stream', (req, res) => {
    res.set('Content-Type', 'text/event-stream').end('event: done\ndata: {}\n\n');
  });
  const url = `${await serve(t, application)}/api/chat/stream`;
  const origin = 'https://frontend.example.test';
  const response = await fetch(url, { method: 'OPTIONS', headers: {
    Origin: origin, 'Access-Control-Request-Method': 'POST', 'Access-Control-Request-Headers': 'content-type,accept',
  } });
  assert.equal(response.status, 204);
  assert.equal(response.headers.get('access-control-allow-origin'), origin);
  assert.match(response.headers.get('access-control-allow-methods'), /POST/);
  assert.match(response.headers.get('access-control-allow-headers'), /Content-Type/);
  const stream = await fetch(url, { method: 'POST', headers: { Origin: origin, Accept: 'text/event-stream' } });
  assert.equal(stream.headers.get('access-control-allow-origin'), origin);
  assert.match(stream.headers.get('vary'), /Origin/);
  assert.match(await stream.text(), /event: done/);
  for (const rejected of ['http://localhost:5173', 'https://other.example.test', 'null', `${origin}.evil.test`]) {
    const denied = await fetch(url, { method: 'OPTIONS', headers: { Origin: rejected, 'Access-Control-Request-Method': 'POST' } });
    assert.equal(denied.headers.get('access-control-allow-origin'), null);
  }
});

test('CORS allows local development and fails closed without a production frontend URL', () => {
  const allowed = (env, origin) => {
    let result;
    corsOptions(env).origin(origin, (error, value) => { assert.equal(error, null); result = value; });
    return result;
  };
  for (const origin of ['http://localhost:5173', 'http://127.0.0.1:5174', 'http://localhost:4173']) {
    assert.equal(allowed({ NODE_ENV: 'development' }, origin), true);
    assert.equal(allowed({ NODE_ENV: 'production' }, origin), false);
  }
  assert.equal(allowed({ NODE_ENV: 'production' }, undefined), false);
  assert.throws(() => corsOptions({ NODE_ENV: 'production', FRONTEND_URL: 'http://localhost:5173' }));
  assert.throws(() => corsOptions({ FRONTEND_URL: '*' }));
});
