import api from './axios.js';
import { readChatStream } from './chatStream.js';

export async function sendChatMessage(messages) {
  const response = await api.post('/chat', { messages });
  return response.data;
}

export async function streamChatMessage(messages, { onChunk, onProperties, signal } = {}) {
  const response = await fetch(`${api.defaults.baseURL.replace(/\/$/, '')}/chat/stream`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'text/event-stream' },
    body: JSON.stringify({ messages: messages.map(({ role, content }) => ({ role, content })) }),
    signal,
  });
  return readChatStream(response, { onChunk, onProperties });
}
