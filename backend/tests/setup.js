// Loaded before application imports: tests never need credentials from local .env files.
process.env.SUPABASE_URL = 'http://127.0.0.1:9';
process.env.SUPABASE_SECRET_KEY = 'test-only-not-a-real-key';
process.env.GOOGLE_GENERATIVE_AI_API_KEY = 'test-only-not-a-real-key';
process.env.RUN_GEMINI_INTEGRATION = '0';
process.env.NODE_ENV = 'development';
delete process.env.FRONTEND_URL;

const localFetch = globalThis.fetch;
globalThis.fetch = (input, options) => {
  const url = new URL(input instanceof Request ? input.url : input);
  if (!['127.0.0.1', 'localhost', '[::1]'].includes(url.hostname)) {
    throw new Error('External network requests are disabled in backend tests');
  }
  return localFetch(input, options);
};
