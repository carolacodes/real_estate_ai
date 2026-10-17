import { test } from 'node:test';
import assert from 'node:assert/strict';
import { resolveApiBaseUrl } from '../src/api/baseUrl.js';

test('API URL keeps local development and normalizes a configured HTTPS backend', () => {
  assert.equal(resolveApiBaseUrl('http://localhost:3000/api', true), 'http://localhost:3000/api');
  assert.equal(resolveApiBaseUrl(' https://backend.example.test/api/ ', false), 'https://backend.example.test/api');
});

test('production API URL rejects missing configuration, mixed content and localhost', () => {
  for (const value of [undefined, '', 'http://backend.example.test/api', 'https://localhost/api', 'https://127.0.0.1/api', 'https://[::1]/api', 'https://user:password@example.test/api']) {
    assert.throws(() => resolveApiBaseUrl(value, false));
  }
});
