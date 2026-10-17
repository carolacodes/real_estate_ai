// SSE framing is independent of network chunk boundaries (including UTF-8/CRLF).
export async function readChatStream(response, { onChunk, onProperties } = {}) {
  if (!response.ok) throw new Error('Unable to complete your search. Please try again.');
  if (!response.headers.get('content-type')?.includes('text/event-stream') || !response.body) {
    throw new Error('The chat server needs structured streaming support. Please try again later.');
  }
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let fullText = '';
  let properties = [];
  let completed = false;
  function dispatch(frame) {
    let event = 'message';
    const data = [];
    for (const line of frame.split('\n')) {
      if (line.startsWith('event:')) event = line.slice(6).trim();
      if (line.startsWith('data:')) data.push(line.slice(5).trimStart());
    }
    if (!data.length) return;
    const payload = JSON.parse(data.join('\n'));
    if (event === 'error') throw new Error('Unable to complete your search. Please try again.');
    if (event === 'text-delta' && typeof payload.text === 'string') {
      fullText += payload.text;
      onChunk?.(payload.text, fullText);
    }
    if (event === 'properties') {
      if (!Array.isArray(payload.properties)) throw new Error('Invalid property results. Please try again.');
      properties = payload.properties.filter(property => property && typeof property.slug === 'string');
      onProperties?.(properties);
    }
    if (event === 'done') completed = true;
  }
  try {
    while (!completed) {
      const { done, value } = await reader.read();
      buffer += done ? decoder.decode() : decoder.decode(value, { stream: true });
      // Normalize only complete CRLF pairs; a final CR may be split across reads.
      buffer = buffer.replace(/\r\n/g, '\n');
      let boundary;
      while (!completed && (boundary = buffer.indexOf('\n\n')) >= 0) {
        dispatch(buffer.slice(0, boundary));
        buffer = buffer.slice(boundary + 2);
      }
      if (done) break;
    }
    if (!completed) throw new Error('The connection was interrupted. Please try again.');
    return { message: fullText, properties };
  } finally {
    await reader.cancel().catch(() => {});
    reader.releaseLock();
  }
}
