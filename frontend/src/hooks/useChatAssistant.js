import { useEffect, useState, useSyncExternalStore } from 'react';
import { streamChatMessage } from '../api/chat.api.js';
import { createChatAssistantStore } from './chatAssistantStore.js';

export default function useChatAssistant() {
  const [store] = useState(() => createChatAssistantStore(streamChatMessage));
  const snapshot = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);
  useEffect(() => () => store.abort(), [store]);
  return { ...snapshot, sendMessage: store.sendMessage, retry: store.retry, reset: store.reset };
}
