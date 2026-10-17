// UI state and request orchestration, injected transport allows tests without an AI provider.
// Keep all turns in memory; send a recent context window within the backend schema limits.
export function toApiMessages(messages) {
  const history = messages.filter(message => message.status === 'complete')
    .map(({ role, content }) => ({ role, content: content.slice(0, 4000) }));
  while (history.length > 19 || history.reduce((total, message) => total + message.content.length, 0) > 20000) {
    history.splice(0, 2);
  }
  return history;
}

export function createChatAssistantStore(transport) {
  let snapshot = { messages: [], state: 'welcome', error: null, resetKey: 0 };
  let active = null;
  let lastAttempt = null;
  let nextId = 0;
  const listeners = new Set();
  const publish = patch => {
    snapshot = { ...snapshot, ...patch };
    listeners.forEach(listener => listener());
  };
  const updateAssistant = (id, patch) => publish({
    messages: snapshot.messages.map(message => message.id === id ? { ...message, ...patch } : message),
  });

  async function execute(previous, user) {
    const controller = new AbortController();
    active = controller;
    const id = ++nextId;
    const time = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit' }).format(new Date());
    const assistant = { id, role: 'assistant', content: '', properties: [], time, status: 'pending' };
    lastAttempt = { previous, user };
    publish({ messages: [...previous, user, assistant], state: 'searching', error: null });
    try {
      const response = await transport(toApiMessages([...previous, user]), {
        signal: AbortSignal.any([controller.signal, AbortSignal.timeout(120000)]),
        onChunk(_chunk, fullText) {
          if (active !== controller) return;
          updateAssistant(id, { content: fullText });
          publish({ state: 'streaming' });
        },
      });
      if (active !== controller) return;
      if (!response.message?.trim()) throw new Error('Empty assistant response');
      updateAssistant(id, { content: response.message, properties: response.properties ?? [], status: 'complete' });
      publish({ state: 'success' });
    } catch {
      if (active !== controller) return;
      publish({
        messages: snapshot.messages.map(message => message.id === id || message.id === user.id
          ? { ...message, status: 'failed', properties: [] } : message),
        state: 'error', error: 'We couldn’t complete your search. Please try again.',
      });
    } finally {
      if (active === controller) active = null;
    }
  }

  return {
    getSnapshot: () => snapshot,
    subscribe(listener) { listeners.add(listener); return () => listeners.delete(listener); },
    sendMessage(text) {
      const content = text.trim();
      if (active || !content || content.length > 4000) return;
      const time = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit' }).format(new Date());
      return execute(snapshot.messages, { id: ++nextId, role: 'user', content, time, status: 'complete' });
    },
    retry() {
      if (active || snapshot.state !== 'error' || !lastAttempt) return;
      return execute(lastAttempt.previous, lastAttempt.user);
    },
    reset() {
      const pending = active;
      active = null;
      pending?.abort();
      lastAttempt = null;
      publish({ messages: [], state: 'welcome', error: null, resetKey: snapshot.resetKey + 1 });
    },
    abort() {
      const pending = active;
      active = null;
      pending?.abort();
    },
  };
}
